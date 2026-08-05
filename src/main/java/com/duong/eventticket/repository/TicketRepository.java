package com.duong.eventticket.repository;

import com.duong.eventticket.entity.Ticket;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM Ticket t JOIN FETCH t.booking b JOIN FETCH b.user JOIN FETCH b.event " +
            "WHERE t.qrCodeValue = :qrCodeValue")
    Optional<Ticket> findByQrCodeValueWithLock(@Param("qrCodeValue") String qrCodeValue);
}
