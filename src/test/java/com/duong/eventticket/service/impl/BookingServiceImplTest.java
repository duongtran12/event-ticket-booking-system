package com.duong.eventticket.service.impl;

import com.duong.eventticket.dto.request.BookingRequest;
import com.duong.eventticket.dto.response.BookingResponse;
import com.duong.eventticket.entity.Booking;
import com.duong.eventticket.entity.BookingStatus;
import com.duong.eventticket.entity.Event;
import com.duong.eventticket.entity.User;
import com.duong.eventticket.exception.custom.ResourceNotFoundException;
import com.duong.eventticket.repository.BookingRepository;
import com.duong.eventticket.repository.EventRepository;
import com.duong.eventticket.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceImplTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private EventRepository eventRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private BookingServiceImpl bookingService;

    @Test
    void createBookingShouldReserveTicketsAndReturnReservedBooking() {
        User user = buildUser();
        Event event = buildEvent(100, 100000);
        BookingRequest request = buildBookingRequest(1L, 3);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(eventRepository.findByIdWithLock(1L)).thenReturn(Optional.of(event));
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BookingResponse response = bookingService.createBooking("user@example.com", request);

        assertEquals(3, response.getQuantity());
        assertEquals(BigDecimal.valueOf(300000), response.getTotalPrice());
        assertEquals("RESERVED", response.getStatus());
        assertEquals(97, event.getAvailableTickets());
    }

    @Test
    void completePaymentShouldMarkBookingAsSold() {
        User user = buildUser();
        Event event = buildEvent(97, 100000);
        Booking booking = new Booking();
        booking.setId(10L);
        booking.setUser(user);
        booking.setEvent(event);
        booking.setQuantity(3);
        booking.setTotalPrice(BigDecimal.valueOf(300000));
        booking.setStatus(BookingStatus.RESERVED);

        when(bookingRepository.findById(10L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BookingResponse response = bookingService.completePayment("user@example.com", 10L);

        assertEquals("SOLD", response.getStatus());
    }

    @Test
    void cancelBookingShouldRestoreAvailableTicketsAndMarkBookingCancelled() {
        User user = buildUser();
        Event event = buildEvent(97, 100000);
        Booking booking = new Booking();
        booking.setId(10L);
        booking.setUser(user);
        booking.setEvent(event);
        booking.setQuantity(3);
        booking.setTotalPrice(BigDecimal.valueOf(300000));
        booking.setStatus(BookingStatus.RESERVED);

        when(bookingRepository.findById(10L)).thenReturn(Optional.of(booking));
        when(eventRepository.findByIdWithLock(1L)).thenReturn(Optional.of(event));
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BookingResponse response = bookingService.cancelBooking("user@example.com", 10L);

        assertEquals("AVAILABLE", response.getStatus());
        assertEquals(100, event.getAvailableTickets());
    }

    @Test
    void getBookingByIdShouldRejectNonOwner() {
        User owner = buildUser();
        Event event = buildEvent(100, 100000);
        Booking booking = new Booking();
        booking.setId(10L);
        booking.setUser(owner);
        booking.setEvent(event);
        booking.setQuantity(1);
        booking.setTotalPrice(BigDecimal.valueOf(100000));
        booking.setStatus(BookingStatus.RESERVED);

        when(bookingRepository.findById(10L)).thenReturn(Optional.of(booking));

        assertThrows(AccessDeniedException.class, () -> bookingService.getBookingById("other@example.com", 10L));
    }

    @Test
    void createBookingShouldThrowWhenUserDoesNotExist() {
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> bookingService.createBooking("missing@example.com", buildBookingRequest(1L, 1)));
    }

    private User buildUser() {
        User user = new User();
        user.setId(1L);
        user.setFullName("Nguyen Van A");
        user.setEmail("user@example.com");
        user.setPassword("password123");
        return user;
    }

    private Event buildEvent(int availableTickets, int price) {
        Event event = new Event();
        event.setId(1L);
        event.setTitle("Spring Boot Workshop");
        event.setDescription("Backend workshop");
        event.setLocation("Ho Chi Minh City");
        event.setDateTime(LocalDateTime.now().plusDays(1));
        event.setPrice(BigDecimal.valueOf(price));
        event.setTotalTickets(100);
        event.setAvailableTickets(availableTickets);
        return event;
    }

    private BookingRequest buildBookingRequest(Long eventId, Integer quantity) {
        BookingRequest request = new BookingRequest();
        request.setEventId(eventId);
        request.setQuantity(quantity);
        return request;
    }
}