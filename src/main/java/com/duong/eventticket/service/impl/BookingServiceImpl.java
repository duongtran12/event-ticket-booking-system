package com.duong.eventticket.service.impl;

import com.duong.eventticket.dto.request.BookingRequest;
import com.duong.eventticket.dto.response.BookingResponse;
import com.duong.eventticket.entity.Booking;
import com.duong.eventticket.entity.BookingStatus;
import com.duong.eventticket.entity.Event;
import com.duong.eventticket.entity.User;
import com.duong.eventticket.exception.custom.ResourceNotFoundException;
import com.duong.eventticket.repository.BookingRepository;
import com.duong.eventticket.repository.EventRepository;
import com.duong.eventticket.repository.UserRepository;
import com.duong.eventticket.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    @Value("${vnpay.tmnCode:}")
    private String vnpTmnCode;

    @Value("${vnpay.hashSecret:}")
    private String vnpHashSecret;

    @Value("${vnpay.payUrl:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
    private String vnpPayUrl;

    @Value("${vnpay.returnUrl:http://localhost:3000/}")
    private String vnpReturnUrl;

    @Override
    @Transactional
    public BookingResponse createBooking(String userEmail, BookingRequest request) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Event event = eventRepository.findByIdWithLock(request.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + request.getEventId()));

        if (event.getAvailableTickets() < request.getQuantity()) {
            throw new IllegalArgumentException(
                    "Not enough tickets available. Requested: " + request.getQuantity()
                    + ", Available: " + event.getAvailableTickets()
            );
        }

        if (event.getDateTime().isBefore(LocalDateTime.now().plusHours(2))) {
            throw new IllegalArgumentException("Không thể đặt vé khi còn dưới 2 tiếng trước giờ diễn.");
        }

        event.setAvailableTickets(event.getAvailableTickets() - request.getQuantity());
        eventRepository.save(event);

        BigDecimal totalPrice = event.getPrice().multiply(BigDecimal.valueOf(request.getQuantity()));

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setEvent(event);
        booking.setQuantity(request.getQuantity());
        booking.setTotalPrice(totalPrice);
        booking.setStatus(BookingStatus.RESERVED);

        Booking savedBooking = bookingRepository.save(booking);
        return mapToResponse(savedBooking);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookingResponse> getMyBookings(String userEmail, Pageable pageable) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return bookingRepository.findByUserId(user.getId(), pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(String userEmail, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new AccessDeniedException("You do not have permission to view this booking");
        }

        return mapToResponse(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public long countBookingsByStatus(BookingStatus status) {
        return bookingRepository.countByStatus(status);
    }

    @Override
    @Transactional(readOnly = true)
    public java.math.BigDecimal sumBookingRevenueByStatus(BookingStatus status) {
        return bookingRepository.sumTotalPriceByStatus(status);
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void releaseExpiredReservations() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(10);
        List<Booking> expiredBookings = bookingRepository.findByStatusAndCreatedAtBefore(BookingStatus.RESERVED, cutoff);

        for (Booking booking : expiredBookings) {
            Event event = eventRepository.findByIdWithLock(booking.getEvent().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
            event.setAvailableTickets(event.getAvailableTickets() + booking.getQuantity());
            eventRepository.save(event);
            booking.setStatus(BookingStatus.EXPIRED);
            bookingRepository.save(booking);
        }
    }

    @Override
    @Transactional
    public BookingResponse cancelBooking(String userEmail, Long bookingId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        // Kiểm tra chủ nhân booking
        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new AccessDeniedException("You do not have permission to cancel this booking");
        }

        // Chỉ cho phép hủy khi trạng thái là RESERVED
        if (booking.getStatus() != BookingStatus.RESERVED) {
            throw new IllegalArgumentException(
                    "Only RESERVED bookings can be cancelled. Current status: " + booking.getStatus()
            );
        }

        Event event = eventRepository.findByIdWithLock(booking.getEvent().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        event.setAvailableTickets(event.getAvailableTickets() + booking.getQuantity());
        eventRepository.save(event);

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelReason(reason);
        Booking cancelledBooking = bookingRepository.save(booking);

        return mapToResponse(cancelledBooking);
    }

    @Override
    @Transactional
    public String createPaymentUrl(String userEmail, Long bookingId, String clientIp) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new AccessDeniedException("You do not have permission to pay this booking");
        }

        if (booking.getStatus() != BookingStatus.RESERVED) {
            throw new IllegalArgumentException("Only RESERVED bookings can be paid. Current status: " + booking.getStatus());
        }

        String orderId = "booking_" + booking.getId();
        String amount = String.valueOf(booking.getTotalPrice().multiply(BigDecimal.valueOf(100)).intValueExact());
        String vnpTxnRef = orderId + "_" + System.currentTimeMillis();
        String vnpCreateDate = LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));

        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", vnpTmnCode);
        params.put("vnp_Amount", amount);
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", vnpTxnRef);
        params.put("vnp_OrderInfo", "Thanh toan ve su kien " + booking.getEvent().getTitle());
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", vnpReturnUrl + "?bookingId=" + booking.getId());
        params.put("vnp_IpAddr", clientIp);
        params.put("vnp_CreateDate", vnpCreateDate);

        StringBuilder query = new StringBuilder();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (entry.getValue() != null && !entry.getValue().isBlank()) {
                query.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8));
                query.append("=");
                query.append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8));
                query.append("&");
            }
        }

        String hashData = buildHashData(params);
        String vnpSecureHash = hmacSHA512(vnpHashSecret, hashData);
        query.append("vnp_SecureHashType=HmacSHA512");
        query.append("&");
        query.append("vnp_SecureHash=");
        query.append(URLEncoder.encode(vnpSecureHash, StandardCharsets.UTF_8));

        return vnpPayUrl + "?" + query;
    }

    @Override
    @Transactional
    public BookingResponse completePayment(String userEmail, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new AccessDeniedException("You do not have permission to confirm this booking");
        }

        if (booking.getStatus() != BookingStatus.RESERVED) {
            throw new IllegalArgumentException("Only RESERVED bookings can be completed. Current status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.SOLD);
        return mapToResponse(bookingRepository.save(booking));
    }

    @Override
    @Transactional
    public boolean handlePaymentCallback(Map<String, String> params) {
        String responseCode = params.get("vnp_ResponseCode");
        String bookingId = params.get("bookingId");
        if (bookingId == null || responseCode == null) {
            return false;
        }

        Booking booking = bookingRepository.findById(Long.parseLong(bookingId))
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        if ("00".equals(responseCode) && booking.getStatus() == BookingStatus.RESERVED) {
            booking.setStatus(BookingStatus.SOLD);
            bookingRepository.save(booking);
            return true;
        }
        return false;
    }

    private String buildHashData(Map<String, String> params) {
        StringBuilder hashData = new StringBuilder();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (entry.getValue() != null && !entry.getValue().isBlank()) {
                hashData.append(entry.getKey()).append("=")
                        .append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8))
                        .append("&");
            }
        }
        if (hashData.length() > 0) {
            hashData.deleteCharAt(hashData.length() - 1);
        }
        return hashData.toString();
    }

    private String hmacSHA512(String key, String data) {
        try {
            final javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes(StandardCharsets.UTF_8);
            final javax.crypto.spec.SecretKeySpec secretKey = new javax.crypto.spec.SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            mac.init(secretKey);
            byte[] result = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ex) {
            return "";
        }
    }

    private BookingResponse mapToResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setEventId(booking.getEvent().getId());
        response.setEventTitle(booking.getEvent().getTitle());
        response.setEventLocation(booking.getEvent().getLocation());
        response.setEventDateTime(booking.getEvent().getDateTime());
        response.setEventPrice(booking.getEvent().getPrice());
        response.setUserId(booking.getUser().getId());
        response.setUserEmail(booking.getUser().getEmail());
        response.setBuyerName(booking.getUser().getFullName());
        response.setBuyerPhone(booking.getUser().getPhone());
        response.setBuyerCccd(booking.getUser().getCccd());
        response.setQuantity(booking.getQuantity());
        response.setTotalPrice(booking.getTotalPrice());
        response.setStatus(booking.getStatus().name());
        response.setCreatedAt(booking.getCreatedAt());
        response.setUpdatedAt(booking.getUpdatedAt());
        response.setCancelReason(booking.getCancelReason());
        return response;
    }
}
