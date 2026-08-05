package com.duong.eventticket.repository;

import com.duong.eventticket.entity.Booking;
import com.duong.eventticket.entity.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import jakarta.persistence.LockModeType;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Page<Booking> findByUserId(Long userId, Pageable pageable);

    long countByStatus(BookingStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM Booking b WHERE b.id = :id")
    Optional<Booking> findByIdWithLock(@Param("id") Long id);

    @Query("SELECT b.id FROM Booking b WHERE b.status = :status " +
            "AND ((b.expiresAt IS NOT NULL AND b.expiresAt <= :now) " +
            "OR (b.expiresAt IS NULL AND b.createdAt <= :legacyCutoff))")
    List<Long> findExpiredReservationIds(
            @Param("status") BookingStatus status,
            @Param("now") LocalDateTime now,
            @Param("legacyCutoff") LocalDateTime legacyCutoff
    );

    @Query("SELECT COALESCE(SUM(b.totalPrice), 0) FROM Booking b WHERE b.status = :status")
    java.math.BigDecimal sumTotalPriceByStatus(@Param("status") BookingStatus status);

    @Query("SELECT COALESCE(SUM(b.totalPrice), 0) FROM Booking b WHERE b.status = :status AND b.createdAt >= :from")
    java.math.BigDecimal sumTotalPriceByStatusSince(@Param("status") BookingStatus status, @Param("from") LocalDateTime from);

    @Query("SELECT COALESCE(COUNT(DISTINCT b.user.id), 0) FROM Booking b WHERE b.createdAt >= :from")
    long countDistinctUserByCreatedAtAfter(@Param("from") LocalDateTime from);

    @Query("SELECT b.event.title FROM Booking b WHERE b.status = :status GROUP BY b.event.id, b.event.title ORDER BY SUM(b.quantity) DESC")
    List<String> findTopEventTitleByStatus(@Param("status") BookingStatus status, Pageable pageable);

    List<Booking> findByStatusAndQrCodeValueIsNull(BookingStatus status);

    @Query("SELECT b FROM Booking b WHERE b.status = :status AND b.tickets IS EMPTY")
    List<Booking> findByStatusAndTicketsEmpty(@Param("status") BookingStatus status);

    boolean existsByEventIdAndStatusIn(Long eventId, List<BookingStatus> statuses);

    boolean existsByTicketTypeId(Long ticketTypeId);
}
