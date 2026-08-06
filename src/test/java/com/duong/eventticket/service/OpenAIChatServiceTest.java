package com.duong.eventticket.service;

import com.duong.eventticket.entity.Event;
import com.duong.eventticket.entity.TicketType;
import com.duong.eventticket.repository.EventRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OpenAIChatServiceTest {

    @Mock
    private EventRepository eventRepository;

    @Test
    void cheapestEventQuestionReturnsTheEventInsteadOfInternalContext() {
        Event event = new Event();
        event.setTitle("Spring Boot Workshop");
        event.setLocation("Ho Chi Minh City");
        event.setDateTime(LocalDateTime.now().plusDays(2));
        event.setPrice(BigDecimal.valueOf(150_000));
        event.setAvailableTickets(50);
        event.setTotalTickets(100);
        when(eventRepository.findFirstByAvailableTicketsGreaterThanOrderByPriceAsc(0))
                .thenReturn(Optional.of(event));

        OpenAIChatService chatService = new OpenAIChatService(eventRepository);

        String answer = chatService.ask("Sự kiện nào rẻ nhất?");

        assertTrue(answer.contains("Spring Boot Workshop"));
        assertTrue(answer.contains("150000"));
        assertFalse(answer.contains("QUY TẮC VÀ TÍNH NĂNG CỦA HỆ THỐNG"));
    }

    @Test
    void locationQuestionOnlyReturnsEventsAtThatLocation() {
        Event hanoiEvent = buildEvent("Hanoi Marathon", "Hà Nội", 199_000);
        Event hcmEvent = buildEvent("Musicaland Festival", "Ho Chi Minh City", 459_000);
        when(eventRepository.findAll()).thenReturn(List.of(hanoiEvent, hcmEvent));

        OpenAIChatService chatService = new OpenAIChatService(eventRepository);

        String answer = chatService.ask("Có sự kiện nào tổ chức tại Hà Nội?");

        assertTrue(answer.contains("Hanoi Marathon"));
        assertFalse(answer.contains("Musicaland Festival"));
    }

    @Test
    void eventNameCanBePrefixedWithTheWordEvent() {
        Event event = buildEvent("MUSICALAND FESTIVAL", "Ho Chi Minh City", 459_000);
        when(eventRepository.findFirstByTitleIgnoreCase("MUSICALAND FESTIVAL"))
                .thenReturn(Optional.of(event));

        OpenAIChatService chatService = new OpenAIChatService(eventRepository);

        String answer = chatService.ask("Sự kiện MUSICALAND FESTIVAL tổ chức khi nào?");

        assertTrue(answer.contains("MUSICALAND FESTIVAL"));
        assertTrue(answer.contains(event.getDateTime().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))));
    }

    @Test
    void ticketTypePriceQuestionUsesTheMentionedEventAndTicketType() {
        Event event = buildEvent("2026 ASH ISLAND Asia Tour Hanoi", "1900 Le Théâtre", 980_000);
        addTicketType(event, "VIP", 2_500_000, 500);
        when(eventRepository.findAll()).thenReturn(List.of(event));

        OpenAIChatService chatService = new OpenAIChatService(eventRepository);

        String answer = chatService.ask("Vé VIP của sự kiện 2026 ASH ISLAND Asia Tour Hanoi giá bao nhiêu?");

        assertTrue(answer.contains("VIP"));
        assertTrue(answer.contains("2500000"));
        assertTrue(answer.contains("500 vé"));
    }

    @Test
    void eventLocationAndTicketTypesUseTheMentionedEvent() {
        Event event = buildEvent("Van Mieu night tour", "58 Quốc Tử Giám, Đống Đa, Hà Nội", 149_000);
        addTicketType(event, "Standard", 149_000, 200);
        addTicketType(event, "Premium", 249_000, 100);
        when(eventRepository.findAll()).thenReturn(List.of(event));

        OpenAIChatService chatService = new OpenAIChatService(eventRepository);

        String locationAnswer = chatService.ask("Sự kiện Van Mieu night tour tổ chức ở đâu?");
        String typesAnswer = chatService.ask("Sự kiện Van Mieu night tour có những loại vé nào?");

        assertTrue(locationAnswer.contains("58 Quốc Tử Giám"));
        assertTrue(typesAnswer.contains("Standard: 149000"));
        assertTrue(typesAnswer.contains("Premium: 249000"));
        assertFalse(typesAnswer.contains("JSOL"));
    }

    @ParameterizedTest
    @CsvSource({
            "'Vé được giữ trong bao lâu?','10 phút'",
            "'Thanh toán xong lấy QR ở đâu?','Vé của tôi'",
            "'Tôi cập nhật hồ sơ ở đâu?','Hồ sơ'",
            "'Tôi muốn yêu cầu hoàn tiền thì làm thế nào?','REFUND_REQUESTED'",
            "'Mỗi QR có check-in nhiều lần được không?','một lần'"
    })
    void platformQuestionsReturnDeterministicAnswers(String question, String expectedText) {
        OpenAIChatService chatService = new OpenAIChatService(eventRepository);

        String answer = chatService.ask(question);

        assertTrue(answer.contains(expectedText));
        assertFalse(answer.contains("Một số sự kiện hiện có"));
    }

    private Event buildEvent(String title, String location, int price) {
        Event event = new Event();
        event.setTitle(title);
        event.setLocation(location);
        event.setDateTime(LocalDateTime.now().plusDays(2));
        event.setPrice(BigDecimal.valueOf(price));
        event.setAvailableTickets(50);
        event.setTotalTickets(100);
        return event;
    }

    private void addTicketType(Event event, String name, int price, int availableTickets) {
        TicketType ticketType = new TicketType();
        ticketType.setName(name);
        ticketType.setPrice(BigDecimal.valueOf(price));
        ticketType.setAvailableTickets(availableTickets);
        ticketType.setTotalTickets(availableTickets);
        ticketType.setEvent(event);
        event.getTicketTypes().add(ticketType);
    }
}
