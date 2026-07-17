package com.duong.eventticket.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CancelBookingRequest {
    private String reason;
}
