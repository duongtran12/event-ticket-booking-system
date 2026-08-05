package com.duong.eventticket.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "tickets", uniqueConstraints = @UniqueConstraint(name = "uk_ticket_qr_code", columnNames = "qr_code_value"))
@Getter
@Setter
@NoArgsConstructor
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(name = "qr_code_value", nullable = false, length = 500)
    private String qrCodeValue;

    @Column(nullable = false)
    private boolean checkedIn;

    private LocalDateTime checkedInAt;

    @Column(length = 255)
    private String checkedInBy;

    @Version
    private Long version;
}
