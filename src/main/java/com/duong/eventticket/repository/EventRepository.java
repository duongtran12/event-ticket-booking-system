package com.duong.eventticket.repository;

import com.duong.eventticket.entity.Event;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    @Query("SELECT e FROM Event e WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR " +
           "LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(e.location) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Event> searchEvents(@Param("keyword") String keyword, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM Event e WHERE e.id = :id")
    Optional<Event> findByIdWithLock(@Param("id") Long id);

    @Query("SELECT COALESCE(SUM(e.availableTickets), 0) FROM Event e")
    long sumAvailableTickets();

    List<Event> findTop5ByTitleContainingIgnoreCaseOrLocationContainingIgnoreCase(String titleKeyword, String locationKeyword);

    Optional<Event> findFirstByTitleIgnoreCase(String title);

    Optional<Event> findFirstByAvailableTicketsGreaterThanOrderByPriceAsc(Integer availableTickets);

    Optional<Event> findFirstByAvailableTicketsGreaterThanOrderByAvailableTicketsDesc(Integer availableTickets);

    List<Event> findByAvailableTicketsEquals(Integer availableTickets);

    List<Event> findTop5ByPriceLessThanEqualAndAvailableTicketsGreaterThanOrderByPriceAsc(BigDecimal price, Integer availableTickets);

    List<Event> findByDateTimeBefore(LocalDateTime dateTime);

    List<Event> findTop5ByPriceGreaterThanAndAvailableTicketsGreaterThanOrderByPriceAsc(BigDecimal price, Integer availableTickets);

    Optional<Event> findFirstByOrderByDateTimeDesc();
}
