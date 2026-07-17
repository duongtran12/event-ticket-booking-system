package com.duong.eventticket.service.impl;

import com.duong.eventticket.dto.response.AdminStatsResponse;
import com.duong.eventticket.entity.BookingStatus;
import com.duong.eventticket.repository.BookingRepository;
import com.duong.eventticket.repository.EventRepository;
import com.duong.eventticket.repository.UserRepository;
import com.duong.eventticket.service.AdminStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminStatsServiceImpl implements AdminStatsService {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final BookingRepository bookingRepository;

    @Override
    @Transactional(readOnly = true)
    public AdminStatsResponse getAdminStats() {
        long totalUsers = userRepository.count();
        long totalEvents = eventRepository.count();
        long totalBookings = bookingRepository.count();
        long reservedBookings = bookingRepository.countByStatus(BookingStatus.RESERVED);
        long soldBookings = bookingRepository.countByStatus(BookingStatus.SOLD);
        long availableTickets = eventRepository.sumAvailableTickets();
        java.math.BigDecimal totalRevenue = bookingRepository.sumTotalPriceByStatus(BookingStatus.SOLD);

        LocalDateTime now = LocalDateTime.now();
        java.math.BigDecimal dailyRevenue = bookingRepository.sumTotalPriceByStatusSince(BookingStatus.SOLD, now.minusDays(1));
        java.math.BigDecimal weeklyRevenue = bookingRepository.sumTotalPriceByStatusSince(BookingStatus.SOLD, now.minusWeeks(1));
        java.math.BigDecimal monthlyRevenue = bookingRepository.sumTotalPriceByStatusSince(BookingStatus.SOLD, now.minusMonths(1));
        long activeUsers = bookingRepository.countDistinctUserByCreatedAtAfter(now.minusWeeks(1));
        String topEvent = bookingRepository.findTopEventTitleByStatus(BookingStatus.SOLD, PageRequest.of(0, 1)).stream().findFirst().orElse("Chưa có dữ liệu");

        return new AdminStatsResponse(
                totalUsers,
                totalEvents,
                totalBookings,
                reservedBookings,
                soldBookings,
                availableTickets,
                totalRevenue,
                activeUsers,
                topEvent,
                dailyRevenue,
                weeklyRevenue,
                monthlyRevenue
        );
    }
}
