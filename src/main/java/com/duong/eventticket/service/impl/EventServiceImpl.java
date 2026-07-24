package com.duong.eventticket.service.impl;

import com.duong.eventticket.dto.request.EventRequest;
import com.duong.eventticket.dto.request.TicketTypeRequest;
import com.duong.eventticket.dto.response.EventResponse;
import com.duong.eventticket.dto.response.TicketTypeResponse;
import com.duong.eventticket.entity.Event;
import com.duong.eventticket.entity.TicketType;
import com.duong.eventticket.exception.custom.ResourceNotFoundException;
import com.duong.eventticket.repository.EventRepository;
import com.duong.eventticket.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;

    @Override
    @Transactional
    public EventResponse createEvent(EventRequest request) {
        Event event = new Event();
        applyRequest(event, request);

        List<TicketType> ticketTypes = request.getTicketTypes().stream()
                .map(ticketTypeRequest -> {
                    TicketType ticketType = new TicketType();
                    ticketType.setName(ticketTypeRequest.getName());
                    ticketType.setPrice(ticketTypeRequest.getPrice());
                    ticketType.setTotalTickets(ticketTypeRequest.getTotalTickets());
                    ticketType.setAvailableTickets(ticketTypeRequest.getTotalTickets());
                    ticketType.setEvent(event);
                    return ticketType;
                })
                .collect(Collectors.toList());

        event.setTicketTypes(ticketTypes);
        event.setTotalTickets(ticketTypes.stream().mapToInt(TicketType::getTotalTickets).sum());
        event.setAvailableTickets(ticketTypes.stream().mapToInt(TicketType::getAvailableTickets).sum());
        event.setPrice(ticketTypes.stream().map(TicketType::getPrice).min(Comparator.naturalOrder()).orElse(BigDecimal.ZERO));

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
        int newTotalTickets = request.getTicketTypes().stream().mapToInt(ticketTypeRequest -> ticketTypeRequest.getTotalTickets()).sum();
        int newAvailableTickets = calculateAvailableTickets(event, newTotalTickets);
        if (newAvailableTickets < 0) {
            throw new IllegalArgumentException(
                    "Cannot reduce total tickets. New capacity (" + newTotalTickets + ") " +
                    "is less than tickets already sold (" + soldTickets + ")."
            );
        }

        applyRequest(event, request);

        event.getTicketTypes().clear();
        List<TicketType> ticketTypes = request.getTicketTypes().stream()
                .map(ticketTypeRequest -> {
                    TicketType ticketType = new TicketType();
                    ticketType.setName(ticketTypeRequest.getName());
                    ticketType.setPrice(ticketTypeRequest.getPrice());
                    ticketType.setTotalTickets(ticketTypeRequest.getTotalTickets());
                    ticketType.setAvailableTickets(ticketTypeRequest.getTotalTickets());
                    ticketType.setEvent(event);
                    return ticketType;
                })
                .collect(Collectors.toList());

        event.setTicketTypes(ticketTypes);
        event.setTotalTickets(ticketTypes.stream().mapToInt(TicketType::getTotalTickets).sum());
        event.setAvailableTickets(event.getTotalTickets() - soldTickets);
        event.setPrice(ticketTypes.stream().map(TicketType::getPrice).min(Comparator.naturalOrder()).orElse(BigDecimal.ZERO));

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
        response.setTicketTypes(event.getTicketTypes().stream()
                .map(this::mapToTicketTypeResponse)
                .collect(Collectors.toList())
        );
        response.setCreatedAt(event.getCreatedAt());
        response.setUpdatedAt(event.getUpdatedAt());
        return response;
    }

    private TicketTypeResponse mapToTicketTypeResponse(TicketType ticketType) {
        TicketTypeResponse response = new TicketTypeResponse();
        response.setId(ticketType.getId());
        response.setName(ticketType.getName());
        response.setPrice(ticketType.getPrice());
        response.setTotalTickets(ticketType.getTotalTickets());
        response.setAvailableTickets(ticketType.getAvailableTickets());
        return response;
    }
}
