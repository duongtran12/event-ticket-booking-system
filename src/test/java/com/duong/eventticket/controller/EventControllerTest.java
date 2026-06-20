package com.duong.eventticket.controller;

import com.duong.eventticket.dto.response.EventResponse;
import com.duong.eventticket.service.EventService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EventControllerTest {

    @Mock
    private EventService eventService;

    @InjectMocks
    private EventController eventController;

    @Test
    void getAllEventsShouldFallbackToDateTimeSortWhenSortFieldIsInvalid() {
        EventResponse response = buildEventResponse();
        when(eventService.getAllEvents(any(), any())).thenReturn(new PageImpl<>(List.of(response)));

        eventController.getAllEvents(null, 0, 10, "unknown,desc");

        ArgumentCaptor<org.springframework.data.domain.Pageable> pageableCaptor = ArgumentCaptor.forClass(org.springframework.data.domain.Pageable.class);
        verify(eventService).getAllEvents(org.mockito.ArgumentMatchers.isNull(), pageableCaptor.capture());

        assertEquals(Sort.by(Sort.Direction.DESC, "dateTime"), pageableCaptor.getValue().getSort());
        assertEquals(PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "dateTime")), pageableCaptor.getValue());
    }

    private EventResponse buildEventResponse() {
        EventResponse response = new EventResponse();
        response.setId(1L);
        response.setTitle("Spring Boot Workshop");
        response.setDescription("Backend workshop");
        response.setLocation("Ho Chi Minh City");
        response.setDateTime(LocalDateTime.now().plusDays(1));
        response.setPrice(BigDecimal.valueOf(150000));
        response.setTotalTickets(100);
        response.setAvailableTickets(100);
        return response;
    }
}