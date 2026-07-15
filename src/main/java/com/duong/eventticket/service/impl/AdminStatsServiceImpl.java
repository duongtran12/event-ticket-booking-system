package com.duong.eventticket.service.impl;

import com.duong.eventticket.dto.response.AdminStatsResponse;
import com.duong.eventticket.entity.BookingStatus;
import com.duong.eventticket.repository.BookingRepository;
import com.duong.eventticket.repository.EventRepository;
import com.duong.eventticket.repository.UserRepository;
import com.duong.eventticket.service.AdminStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        return new AdminStatsResponse(
                totalUsers,
                totalEvents,
                totalBookings,
                reservedBookings,
                soldBookings,
                availableTickets,
                totalRevenue
        );
    }
}
