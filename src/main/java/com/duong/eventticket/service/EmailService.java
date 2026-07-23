package com.duong.eventticket.service;

import com.duong.eventticket.entity.Booking;

public interface EmailService {
    void sendTicketEmail(Booking booking);
}
