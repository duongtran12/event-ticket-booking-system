package com.duong.eventticket.service;

import com.duong.eventticket.dto.request.BookingRequest;
import com.duong.eventticket.dto.response.BookingResponse;
import com.duong.eventticket.dto.response.CheckInResponse;
import com.duong.eventticket.entity.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Map;

public interface BookingService {

    BookingResponse createBooking(String userEmail, BookingRequest request);

    Page<BookingResponse> getMyBookings(String userEmail, Pageable pageable);

    BookingResponse getBookingById(String userEmail, Long bookingId);

    BookingResponse cancelBooking(String userEmail, Long bookingId, String reason);

    BookingResponse refundBooking(String userEmail, Long bookingId, String reason);

    String createPaymentUrl(String userEmail, Long bookingId, String clientIp);

    BookingResponse completePayment(String userEmail, Long bookingId);

    boolean handlePaymentCallback(Map<String, String> params);

    long countBookingsByStatus(BookingStatus status);

    java.math.BigDecimal sumBookingRevenueByStatus(BookingStatus status);

    CheckInResponse checkInBooking(String adminEmail, byte[] imageBytes);
    int backfillQrForSoldBookings();
}
