package com.duong.eventticket.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class BookingResponse {

    private Long id;
    private Long eventId;
    private String eventTitle;
    private String eventLocation;
    private LocalDateTime eventDateTime;
    private BigDecimal eventPrice;
    private Long userId;
    private String userEmail;
    private String buyerName;
    private String buyerPhone;
    private String buyerCccd;
    private Integer quantity;
    private BigDecimal totalPrice;
    private String status;
    private String cancelReason;
    private String qrCodeValue;
    private String qrCodeImage;
    private Boolean checkedIn;
    private LocalDateTime checkedInAt;
    private String checkedInBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
