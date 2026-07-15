package com.duong.eventticket.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class AdminStatsResponse {
    private long totalUsers;
    private long totalEvents;
    private long totalBookings;
    private long reservedBookings;
    private long soldBookings;
    private long availableTickets;
    private BigDecimal totalRevenue;
}
