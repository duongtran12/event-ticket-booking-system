package com.duong.eventticket.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class CheckInResponse {
    private boolean success;
    private String message;
    private String status;
    private Long bookingId;
    private String customerName;
    private String eventTitle;
    private String eventLocation;
    private String qrCodeValue;
    private String checkedInAt;

    public static CheckInResponse success(String message, Long bookingId, String customerName, String eventTitle, String eventLocation, String qrCodeValue, String checkedInAt) {
        return CheckInResponse.builder()
                .success(true)
                .message(message)
                .status("VALID")
                .bookingId(bookingId)
                .customerName(customerName)
                .eventTitle(eventTitle)
                .eventLocation(eventLocation)
                .qrCodeValue(qrCodeValue)
                .checkedInAt(checkedInAt)
                .build();
    }

    public static CheckInResponse failure(String message) {
        return CheckInResponse.builder()
                .success(false)
                .message(message)
                .status("INVALID")
                .build();
    }
}
