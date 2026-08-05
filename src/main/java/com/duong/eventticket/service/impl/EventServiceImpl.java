package com.duong.eventticket.service.impl;

import com.duong.eventticket.dto.request.EventRequest;
import com.duong.eventticket.dto.response.EventResponse;
import com.duong.eventticket.dto.response.TicketTypeResponse;
import com.duong.eventticket.entity.BookingStatus;
import com.duong.eventticket.entity.Event;
import com.duong.eventticket.entity.TicketType;
import com.duong.eventticket.exception.custom.ResourceNotFoundException;
import com.duong.eventticket.repository.BookingRepository;
import com.duong.eventticket.repository.EventRepository;
import com.duong.eventticket.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final BookingRepository bookingRepository;

    @Override
    @Transactional
    public EventResponse createEvent(EventRequest request) {
        validateTicketTypeNames(request);
        Event event = new Event();
        applyRequest(event, request);

        List<TicketType> ticketTypes = request.getTicketTypes().stream()
                .map(ticketTypeRequest -> {
                    TicketType ticketType = new TicketType();
                    ticketType.setName(ticketTypeRequest.getName().trim());
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
    public Page<EventResponse> getAllEvents(String keyword, LocalDateTime dateFrom, LocalDateTime dateTo, BigDecimal priceFrom, BigDecimal priceTo, Integer minAvailableTickets, Pageable pageable) {
        Page<Event> eventPage = eventRepository.searchEvents(keyword, dateFrom, dateTo, priceFrom, priceTo, minAvailableTickets, pageable);
        return eventPage.map(this::mapToResponse);
    }

    @Override
    @Transactional
    public EventResponse updateEvent(Long id, EventRequest request) {
        validateTicketTypeNames(request);
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));

        validateEventCanBeModified(event, "update");

        applyRequest(event, request);
        updateTicketTypes(event, request);

        event.setTotalTickets(event.getTicketTypes().stream().mapToInt(TicketType::getTotalTickets).sum());
        event.setAvailableTickets(event.getTicketTypes().stream().mapToInt(TicketType::getAvailableTickets).sum());
        event.setPrice(event.getTicketTypes().stream().map(TicketType::getPrice)
                .min(Comparator.naturalOrder()).orElse(BigDecimal.ZERO));

        Event updatedEvent = eventRepository.save(event);
        return mapToResponse(updatedEvent);
    }

    @Override
    @Transactional
    public void deleteEvent(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));

        validateEventCanBeModified(event, "delete");
        eventRepository.deleteById(id);
    }

    private void validateEventCanBeModified(Event event, String action) {
        LocalDateTime now = LocalDateTime.now();
        if (!event.getDateTime().isAfter(now)) {
            throw new IllegalArgumentException(
                    "Cannot " + action + " an event that has already started or already passed."
            );
        }

        boolean hasActiveBookings = bookingRepository.existsByEventIdAndStatusIn(
                event.getId(),
                List.of(BookingStatus.RESERVED, BookingStatus.SOLD)
        );
        if (hasActiveBookings) {
            throw new IllegalArgumentException(
                    "Cannot " + action + " an event that already has active bookings."
            );
        }
    }

    private void applyRequest(Event event, EventRequest request) {
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setLocation(request.getLocation());
        event.setImageUrl(request.getImageUrl());
        event.setDateTime(request.getDateTime());
    }

    private void validateTicketTypeNames(EventRequest request) {
        Set<String> normalizedNames = new HashSet<>();
        for (var ticketType : request.getTicketTypes()) {
            String normalizedName = ticketType.getName().trim().toLowerCase(Locale.ROOT);
            if (!normalizedNames.add(normalizedName)) {
                throw new IllegalArgumentException("Ticket type names must be unique within an event");
            }
        }
    }

    private void updateTicketTypes(Event event, EventRequest request) {
        Map<Long, TicketType> existingById = new HashMap<>();
        event.getTicketTypes().forEach(ticketType -> existingById.put(ticketType.getId(), ticketType));
        Set<Long> retainedIds = new HashSet<>();

        for (var ticketTypeRequest : request.getTicketTypes()) {
            TicketType ticketType;
            if (ticketTypeRequest.getId() == null) {
                ticketType = new TicketType();
                ticketType.setEvent(event);
                ticketType.setAvailableTickets(ticketTypeRequest.getTotalTickets());
                event.getTicketTypes().add(ticketType);
            } else {
                ticketType = existingById.get(ticketTypeRequest.getId());
                if (ticketType == null) {
                    throw new IllegalArgumentException("Ticket type does not belong to this event: " + ticketTypeRequest.getId());
                }
                retainedIds.add(ticketType.getId());
                int allocatedTickets = ticketType.getTotalTickets() - ticketType.getAvailableTickets();
                if (ticketTypeRequest.getTotalTickets() < allocatedTickets) {
                    throw new IllegalArgumentException("Cannot reduce ticket capacity below allocated tickets for " + ticketType.getName());
                }
                ticketType.setAvailableTickets(ticketTypeRequest.getTotalTickets() - allocatedTickets);
            }

            ticketType.setName(ticketTypeRequest.getName().trim());
            ticketType.setPrice(ticketTypeRequest.getPrice());
            ticketType.setTotalTickets(ticketTypeRequest.getTotalTickets());
        }

        List<TicketType> removedTypes = event.getTicketTypes().stream()
                .filter(ticketType -> ticketType.getId() != null && !retainedIds.contains(ticketType.getId()))
                .toList();
        for (TicketType removedType : removedTypes) {
            if (bookingRepository.existsByTicketTypeId(removedType.getId())) {
                throw new IllegalArgumentException(
                        "Cannot remove ticket type '" + removedType.getName() + "' because it is referenced by booking history"
                );
            }
            event.getTicketTypes().remove(removedType);
        }
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
