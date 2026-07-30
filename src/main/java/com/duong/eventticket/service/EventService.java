package com.duong.eventticket.service;

import com.duong.eventticket.dto.request.EventRequest;
import com.duong.eventticket.dto.response.EventResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface EventService {

    EventResponse createEvent(EventRequest request);

    EventResponse getEventById(Long id);

    Page<EventResponse> getAllEvents(
            String keyword,
            LocalDateTime dateFrom,
            LocalDateTime dateTo,
            BigDecimal priceFrom,
            BigDecimal priceTo,
            Integer minAvailableTickets,
            Pageable pageable);

    EventResponse updateEvent(Long id, EventRequest request);

    void deleteEvent(Long id);
}
