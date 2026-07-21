package com.duong.eventticket.controller;

import com.duong.eventticket.dto.response.AdminStatsResponse;
import com.duong.eventticket.service.AdminStatsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin APIs for system statistics")
public class AdminController {

    private final AdminStatsService adminStatsService;

    private final com.duong.eventticket.service.BookingService bookingService;

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get admin dashboard statistics")
    public ResponseEntity<AdminStatsResponse> getAdminStats() {
        AdminStatsResponse stats = adminStatsService.getAdminStats();
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/backfill-qr")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Backfill QR codes for existing SOLD bookings")
    public ResponseEntity<String> backfillQr() {
        int count = bookingService.backfillQrForSoldBookings();
        return ResponseEntity.ok("Backfilled QR for " + count + " bookings");
    }
}
