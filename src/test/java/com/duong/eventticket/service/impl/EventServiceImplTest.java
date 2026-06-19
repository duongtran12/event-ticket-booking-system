package com.duong.eventticket.service.impl;

import com.duong.eventticket.dto.request.EventRequest;
import com.duong.eventticket.dto.response.EventResponse;
import com.duong.eventticket.entity.Event;
import com.duong.eventticket.exception.custom.ResourceNotFoundException;
import com.duong.eventticket.repository.EventRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EventServiceImplTest {

    @Mock
    private EventRepository eventRepository;

    @InjectMocks
    private EventServiceImpl eventService;

    @Test
    void createEventShouldSetAvailableTicketsEqualToTotalTickets() {
        EventRequest request = buildEventRequest("Spring Boot Workshop", 100);

        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EventResponse response = eventService.createEvent(request);

        assertEquals(100, response.getTotalTickets());
        assertEquals(100, response.getAvailableTickets());
        assertEquals("Spring Boot Workshop", response.getTitle());
    }

    @Test
    void updateEventShouldPreserveSoldTicketsAndRecalculateAvailableTickets() {
        Event existingEvent = new Event();
        existingEvent.setId(1L);
        existingEvent.setTitle("Old Title");
        existingEvent.setDescription("Old description");
        existingEvent.setLocation("Old location");
        existingEvent.setDateTime(LocalDateTime.now().plusDays(1));
        existingEvent.setPrice(BigDecimal.valueOf(100000));
        existingEvent.setTotalTickets(100);
        existingEvent.setAvailableTickets(70);

        EventRequest request = buildEventRequest("New Title", 120);

        when(eventRepository.findById(1L)).thenReturn(Optional.of(existingEvent));
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EventResponse response = eventService.updateEvent(1L, request);

        assertEquals(120, response.getTotalTickets());
        assertEquals(90, response.getAvailableTickets());
        assertEquals("New Title", response.getTitle());
    }

    @Test
    void getEventByIdShouldThrowWhenEventDoesNotExist() {
        when(eventRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> eventService.getEventById(99L));
    }

    private EventRequest buildEventRequest(String title, int totalTickets) {
        EventRequest request = new EventRequest();
        request.setTitle(title);
        request.setDescription("A practical backend workshop");
        request.setLocation("Ho Chi Minh City");
        request.setDateTime(LocalDateTime.now().plusDays(1));
        request.setPrice(BigDecimal.valueOf(150000));
        request.setTotalTickets(totalTickets);
        return request;
    }
}