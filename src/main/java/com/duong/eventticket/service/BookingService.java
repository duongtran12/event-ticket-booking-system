package com.duong.eventticket.service;

import com.duong.eventticket.dto.request.BookingRequest;
import com.duong.eventticket.dto.response.BookingResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BookingService {

    BookingResponse createBooking(String userEmail, BookingRequest request);

    Page<BookingResponse> getMyBookings(String userEmail, Pageable pageable);

    BookingResponse getBookingById(String userEmail, Long bookingId);

    BookingResponse cancelBooking(String userEmail, Long bookingId);
}
