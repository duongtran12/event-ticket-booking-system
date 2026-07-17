package com.duong.eventticket.controller;

import com.duong.eventticket.dto.request.BookingRequest;
import com.duong.eventticket.dto.request.CancelBookingRequest;
import com.duong.eventticket.dto.response.BookingResponse;
import com.duong.eventticket.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Tag(name = "Bookings", description = "APIs for booking tickets and managing booking history")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @Operation(summary = "Create a booking")
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingRequest request,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        BookingResponse response = bookingService.createBooking(userEmail, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my-bookings")
    @Operation(summary = "Get my booking history")
    public ResponseEntity<Page<BookingResponse>> getMyBookings(
            Authentication authentication,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        String userEmail = authentication.getName();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<BookingResponse> response = bookingService.getMyBookings(userEmail, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a booking by id")
    public ResponseEntity<BookingResponse> getBookingById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        BookingResponse response = bookingService.getBookingById(userEmail, id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel a booking")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable Long id,
            Authentication authentication,
            @RequestBody(required = false) CancelBookingRequest request
    ) {
        String userEmail = authentication.getName();
        String reason = request != null && request.getReason() != null && !request.getReason().isBlank()
                ? request.getReason().trim()
                : "Hủy bởi người dùng";
        BookingResponse response = bookingService.cancelBooking(userEmail, id, reason);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/pay")
    @Operation(summary = "Create a VNPay payment URL")
    public ResponseEntity<Map<String, String>> createPaymentUrl(
            @PathVariable Long id,
            Authentication authentication,
            @RequestHeader(value = "X-Forwarded-For", required = false) String forwardedIp,
            @RequestParam(value = "clientIp", required = false) String clientIp
    ) {
        String userEmail = authentication.getName();
        String ip = clientIp != null && !clientIp.isBlank() ? clientIp : forwardedIp;
        String paymentUrl = bookingService.createPaymentUrl(userEmail, id, ip != null ? ip : "127.0.0.1");
        return ResponseEntity.ok(Map.of("paymentUrl", paymentUrl));
    }

    @PostMapping("/{id}/complete")
    @Operation(summary = "Complete payment locally")
    public ResponseEntity<BookingResponse> completePayment(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        BookingResponse response = bookingService.completePayment(userEmail, id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/payment-callback")
    @Operation(summary = "Handle payment callback")
    public ResponseEntity<String> handlePaymentCallback(@RequestParam Map<String, String> params) {
        boolean success = bookingService.handlePaymentCallback(params);
        return success ? ResponseEntity.ok("success") : ResponseEntity.badRequest().body("failed");
    }
}
