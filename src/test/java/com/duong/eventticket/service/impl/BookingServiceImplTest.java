package com.duong.eventticket.service.impl;

import com.duong.eventticket.dto.request.BookingRequest;
import com.duong.eventticket.dto.response.BookingResponse;
import com.duong.eventticket.entity.Booking;
import com.duong.eventticket.entity.BookingStatus;
import com.duong.eventticket.entity.Event;
import com.duong.eventticket.entity.TicketType;
import com.duong.eventticket.entity.User;
import com.duong.eventticket.exception.custom.ResourceNotFoundException;
import com.duong.eventticket.repository.BookingRepository;
import com.duong.eventticket.repository.EventRepository;
import com.duong.eventticket.repository.TicketTypeRepository;
import com.duong.eventticket.repository.UserRepository;
import com.duong.eventticket.service.EmailService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceImplTest {

    private static final String VNPAY_TMN_CODE = "TEST_MERCHANT";
    private static final String VNPAY_HASH_SECRET = "test-hash-secret";

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private EventRepository eventRepository;

    @Mock
    private TicketTypeRepository ticketTypeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private BookingServiceImpl bookingService;

    @BeforeEach
    void setUpVnpayConfiguration() {
        ReflectionTestUtils.setField(bookingService, "vnpTmnCode", VNPAY_TMN_CODE);
        ReflectionTestUtils.setField(bookingService, "vnpHashSecret", VNPAY_HASH_SECRET);
    }

    @Test
    void createBookingShouldReserveTicketsAndReturnReservedBooking() {
        User user = buildUser();
        Event event = buildEvent(100, 100000);
        BookingRequest request = buildBookingRequest(1L, 3, 10L);
        TicketType ticketType = buildTicketType(10L, event, BigDecimal.valueOf(100000), 100);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(eventRepository.findByIdWithLock(1L)).thenReturn(Optional.of(event));
        when(ticketTypeRepository.findByIdWithLock(10L)).thenReturn(Optional.of(ticketType));
        when(ticketTypeRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BookingResponse response = bookingService.createBooking("user@example.com", request);

        assertEquals(3, response.getQuantity());
        assertEquals(BigDecimal.valueOf(300000), response.getTotalPrice());
        assertEquals("RESERVED", response.getStatus());
        assertEquals(97, event.getAvailableTickets());
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

        BookingResponse response = bookingService.cancelBooking("user@example.com", 10L, "User requested cancellation");

        assertEquals("CANCELLED", response.getStatus());
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
                () -> bookingService.createBooking("missing@example.com", buildBookingRequest(1L, 1, 10L)));
    }

    @Test
    void paymentCallbackShouldCompleteBookingWhenVnpayDataIsValid() throws Exception {
        Booking booking = buildReservedBooking(10L, BigDecimal.valueOf(300000));
        Map<String, String> params = buildSignedCallback("10", "30000000", "booking_10_123456");

        when(bookingRepository.findById(10L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        boolean result = bookingService.handlePaymentCallback(params);

        assertEquals(true, result);
        assertEquals(BookingStatus.SOLD, booking.getStatus());
        verify(emailService).sendTicketEmail(booking);
    }

    @Test
    void paymentCallbackShouldRejectInvalidSignatureBeforeLookingUpBooking() {
        Map<String, String> params = new TreeMap<>();
        params.put("bookingId", "10");
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_SecureHash", "forged-signature");
        params.put("vnp_TmnCode", VNPAY_TMN_CODE);

        boolean result = bookingService.handlePaymentCallback(params);

        assertEquals(false, result);
        verify(bookingRepository, never()).findById(any());
    }

    @Test
    void paymentCallbackShouldRejectMismatchedAmount() throws Exception {
        Booking booking = buildReservedBooking(10L, BigDecimal.valueOf(300000));
        Map<String, String> params = buildSignedCallback("10", "100", "booking_10_123456");
        when(bookingRepository.findById(10L)).thenReturn(Optional.of(booking));

        boolean result = bookingService.handlePaymentCallback(params);

        assertEquals(false, result);
        assertEquals(BookingStatus.RESERVED, booking.getStatus());
        verify(bookingRepository, never()).save(any());
    }

    private Booking buildReservedBooking(Long id, BigDecimal totalPrice) {
        Booking booking = new Booking();
        booking.setId(id);
        booking.setUser(buildUser());
        booking.setEvent(buildEvent(97, 100000));
        booking.setQuantity(3);
        booking.setTotalPrice(totalPrice);
        booking.setStatus(BookingStatus.RESERVED);
        return booking;
    }

    private Map<String, String> buildSignedCallback(String bookingId, String amount, String transactionReference)
            throws Exception {
        Map<String, String> params = new TreeMap<>();
        params.put("bookingId", bookingId);
        params.put("vnp_Amount", amount);
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_TmnCode", VNPAY_TMN_CODE);
        params.put("vnp_TransactionStatus", "00");
        params.put("vnp_TxnRef", transactionReference);
        params.put("vnp_SecureHash", signVnpayParams(params));
        return params;
    }

    private String signVnpayParams(Map<String, String> params) throws Exception {
        StringBuilder hashData = new StringBuilder();
        params.entrySet().stream()
                .filter(entry -> entry.getKey().startsWith("vnp_"))
                .filter(entry -> !"vnp_SecureHash".equals(entry.getKey()))
                .filter(entry -> entry.getValue() != null && !entry.getValue().isBlank())
                .forEach(entry -> hashData.append(entry.getKey())
                        .append('=')
                        .append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8))
                        .append('&'));
        hashData.deleteCharAt(hashData.length() - 1);

        Mac mac = Mac.getInstance("HmacSHA512");
        mac.init(new SecretKeySpec(VNPAY_HASH_SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
        byte[] result = mac.doFinal(hashData.toString().getBytes(StandardCharsets.UTF_8));
        StringBuilder hex = new StringBuilder(result.length * 2);
        for (byte value : result) {
            hex.append(String.format("%02x", value & 0xff));
        }
        return hex.toString();
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

    private BookingRequest buildBookingRequest(Long eventId, Integer quantity, Long ticketTypeId) {
        BookingRequest request = new BookingRequest();
        request.setEventId(eventId);
        request.setQuantity(quantity);
        request.setTicketTypeId(ticketTypeId);
        return request;
    }

    private TicketType buildTicketType(Long id, Event event, BigDecimal price, int availableTickets) {
        TicketType ticketType = new TicketType();
        ticketType.setId(id);
        ticketType.setEvent(event);
        ticketType.setName("General");
        ticketType.setPrice(price);
        ticketType.setAvailableTickets(availableTickets);
        ticketType.setTotalTickets(availableTickets);
        return ticketType;
    }
}
