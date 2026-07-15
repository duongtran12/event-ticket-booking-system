package com.duong.eventticket.service.impl;

import com.duong.eventticket.dto.request.EventRequest;
import com.duong.eventticket.dto.response.EventResponse;
import com.duong.eventticket.entity.Event;
import com.duong.eventticket.exception.custom.ResourceNotFoundException;
import com.duong.eventticket.repository.EventRepository;
import com.duong.eventticket.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;

    @Override
    @Transactional
    public EventResponse createEvent(EventRequest request) {
        Event event = new Event();
        applyRequest(event, request);
        event.setTotalTickets(request.getTotalTickets());
        event.setAvailableTickets(request.getTotalTickets());

        Event savedEvent = eventRepository.save(event);
        return mapToResponse(savedEvent);
    }

    @Override
    @Transactional(readOnly = true)
    public EventResponse getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
        return mapToResponse(event);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EventResponse> getAllEvents(String keyword, Pageable pageable) {
        Page<Event> eventPage = eventRepository.searchEvents(keyword, pageable);
        return eventPage.map(this::mapToResponse);
    }

    @Override
    @Transactional
    public EventResponse updateEvent(Long id, EventRequest request) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));

        int soldTickets = getSoldTickets(event);
        int newAvailableTickets = calculateAvailableTickets(event, request.getTotalTickets());
        if (newAvailableTickets < 0) {
            throw new IllegalArgumentException(
                    "Cannot reduce total tickets. New capacity (" + request.getTotalTickets() + ") " +
                    "is less than tickets already sold (" + soldTickets + ")."
            );
        }

        applyRequest(event, request);
        event.setTotalTickets(request.getTotalTickets());
        event.setAvailableTickets(newAvailableTickets);

        Event updatedEvent = eventRepository.save(event);
        return mapToResponse(updatedEvent);
    }

    @Override
    @Transactional
    public void deleteEvent(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new ResourceNotFoundException("Event not found with id: " + id);
        }
        eventRepository.deleteById(id);
    }

    private void applyRequest(Event event, EventRequest request) {
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setLocation(request.getLocation());
        event.setImageUrl(request.getImageUrl());
        event.setDateTime(request.getDateTime());
        event.setPrice(request.getPrice());
    }

    private int calculateAvailableTickets(Event event, Integer newTotalTickets) {
        int ticketDifference = newTotalTickets - event.getTotalTickets();
        return event.getAvailableTickets() + ticketDifference;
    }

    private int getSoldTickets(Event event) {
        return event.getTotalTickets() - event.getAvailableTickets();
    }

    private EventResponse mapToResponse(Event event) {
        EventResponse response = new EventResponse();
        response.setId(event.getId());
        response.setTitle(event.getTitle());
        response.setDescription(event.getDescription());
        response.setLocation(event.getLocation());
        response.setImageUrl(event.getImageUrl());
        response.setDateTime(event.getDateTime());
        response.setPrice(event.getPrice());
        response.setTotalTickets(event.getTotalTickets());
        response.setAvailableTickets(event.getAvailableTickets());
        response.setCreatedAt(event.getCreatedAt());
        response.setUpdatedAt(event.getUpdatedAt());
        return response;
    }
}
