package com.duong.eventticket.repository;

import com.duong.eventticket.entity.PaymentTransaction;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM PaymentTransaction p JOIN FETCH p.booking WHERE p.transactionReference = :reference")
    Optional<PaymentTransaction> findByTransactionReferenceWithLock(@Param("reference") String reference);
}
