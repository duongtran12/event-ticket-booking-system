package com.duong.eventticket.entity;

public enum BookingStatus {
    // Legacy values kept for compatibility with existing database rows.
    PENDING,
    CONFIRMED,
    CANCELLED,
    AVAILABLE,
    RESERVED,
    SOLD,
    REFUNDED,
    EXPIRED
}
