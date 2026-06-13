package com.duong.eventticket.service;

import com.duong.eventticket.dto.request.EventRequest;
import com.duong.eventticket.dto.response.EventResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EventService {

    EventResponse createEvent(EventRequest request);

    EventResponse getEventById(Long id);

    Page<EventResponse> getAllEvents(String keyword, Pageable pageable);

    EventResponse updateEvent(Long id, EventRequest request);

    void deleteEvent(Long id);
}
