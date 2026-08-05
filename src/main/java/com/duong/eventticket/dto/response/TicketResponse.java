package com.duong.eventticket.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class TicketResponse {
    private Long id;
    private String qrCodeValue;
    private String qrCodeImage;
    private boolean checkedIn;
    private LocalDateTime checkedInAt;
    private String checkedInBy;
}
