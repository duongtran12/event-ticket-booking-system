package com.duong.eventticket.repository;

import com.duong.eventticket.entity.Booking;
import com.duong.eventticket.entity.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Page<Booking> findByUserId(Long userId, Pageable pageable);

    long countByStatus(BookingStatus status);

    List<Booking> findByStatusAndCreatedAtBefore(BookingStatus status, LocalDateTime createdAtBefore);

    @Query("SELECT COALESCE(SUM(b.totalPrice), 0) FROM Booking b WHERE b.status = :status")
    java.math.BigDecimal sumTotalPriceByStatus(@Param("status") BookingStatus status);

    @Query("SELECT COALESCE(SUM(b.totalPrice), 0) FROM Booking b WHERE b.status = :status AND b.createdAt >= :from")
    java.math.BigDecimal sumTotalPriceByStatusSince(@Param("status") BookingStatus status, @Param("from") LocalDateTime from);

    @Query("SELECT COALESCE(COUNT(DISTINCT b.user.id), 0) FROM Booking b WHERE b.createdAt >= :from")
    long countDistinctUserByCreatedAtAfter(@Param("from") LocalDateTime from);

    @Query("SELECT b.event.title FROM Booking b WHERE b.status = :status GROUP BY b.event.id, b.event.title ORDER BY SUM(b.quantity) DESC")
    List<String> findTopEventTitleByStatus(@Param("status") BookingStatus status, Pageable pageable);

    List<Booking> findByStatusAndQrCodeValueIsNull(BookingStatus status);
}
