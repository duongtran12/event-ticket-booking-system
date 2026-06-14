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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public BookingResponse createBooking(String userEmail, BookingRequest request) {

        // 1. Tìm user đang đăng nhập
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // 2. Khóa dòng Event lại (Pessimistic Lock) để tránh Race Condition
        //    Không có giao dịch nào khác có thể đọc/ghi dòng này cho đến khi transaction này kết thúc
        Event event = eventRepository.findByIdWithLock(request.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + request.getEventId()));

        // 3. Kiểm tra số lượng vé còn lại
        if (event.getAvailableTickets() < request.getQuantity()) {
            throw new IllegalArgumentException(
                    "Not enough tickets available. Requested: " + request.getQuantity()
                    + ", Available: " + event.getAvailableTickets()
            );
        }

        // 4. Trừ số vé khả dụng
        event.setAvailableTickets(event.getAvailableTickets() - request.getQuantity());
        eventRepository.save(event);

        // 5. Tính tổng tiền và tạo booking
        BigDecimal totalPrice = event.getPrice().multiply(BigDecimal.valueOf(request.getQuantity()));

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setEvent(event);
        booking.setQuantity(request.getQuantity());
        booking.setTotalPrice(totalPrice);
        booking.setStatus(BookingStatus.PENDING);

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

        // Chỉ chủ nhân booking hoặc Admin mới được xem
        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new AccessDeniedException("You do not have permission to view this booking");
        }

        return mapToResponse(booking);
    }

    @Override
    @Transactional
    public BookingResponse cancelBooking(String userEmail, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        // Kiểm tra chủ nhân booking
        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new AccessDeniedException("You do not have permission to cancel this booking");
        }

        // Chỉ cho phép hủy khi trạng thái là PENDING
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Only PENDING bookings can be cancelled. Current status: " + booking.getStatus()
            );
        }

        // Hoàn lại số vé cho sự kiện
        Event event = eventRepository.findByIdWithLock(booking.getEvent().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        event.setAvailableTickets(event.getAvailableTickets() + booking.getQuantity());
        eventRepository.save(event);

        // Cập nhật trạng thái booking thành CANCELLED
        booking.setStatus(BookingStatus.CANCELLED);
        Booking cancelledBooking = bookingRepository.save(booking);

        return mapToResponse(cancelledBooking);
    }

    private BookingResponse mapToResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setEventId(booking.getEvent().getId());
        response.setEventTitle(booking.getEvent().getTitle());
        response.setUserId(booking.getUser().getId());
        response.setUserEmail(booking.getUser().getEmail());
        response.setQuantity(booking.getQuantity());
        response.setTotalPrice(booking.getTotalPrice());
        response.setStatus(booking.getStatus().name());
        response.setCreatedAt(booking.getCreatedAt());
        response.setUpdatedAt(booking.getUpdatedAt());
        return response;
    }
}
