-- Upgrade databases created by the pre-Flyway application without deleting data.
-- Fresh databases already contain these objects from V1, so every schema change
-- below is either conditional or idempotent.

SET @add_expires_at = IF(
    (SELECT COUNT(*) FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = 'bookings'
       AND column_name = 'expires_at') = 0,
    'ALTER TABLE bookings ADD COLUMN expires_at DATETIME(6) NULL AFTER refund_reason',
    'SELECT 1'
);
PREPARE add_expires_at_stmt FROM @add_expires_at;
EXECUTE add_expires_at_stmt;
DEALLOCATE PREPARE add_expires_at_stmt;

SET @add_booking_version = IF(
    (SELECT COUNT(*) FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = 'bookings'
       AND column_name = 'version') = 0,
    'ALTER TABLE bookings ADD COLUMN version BIGINT NULL AFTER expires_at',
    'SELECT 1'
);
PREPARE add_booking_version_stmt FROM @add_booking_version;
EXECUTE add_booking_version_stmt;
DEALLOCATE PREPARE add_booking_version_stmt;

ALTER TABLE bookings MODIFY COLUMN status ENUM (
    'AVAILABLE',
    'CANCELLED',
    'CONFIRMED',
    'EXPIRED',
    'PENDING',
    'REFUNDED',
    'REFUND_REQUESTED',
    'RESERVED',
    'SOLD'
) NOT NULL;

CREATE TABLE IF NOT EXISTS tickets (
    id BIGINT NOT NULL AUTO_INCREMENT,
    checked_in BIT(1) NOT NULL,
    checked_in_at DATETIME(6) NULL,
    checked_in_by VARCHAR(255) NULL,
    qr_code_value VARCHAR(500) NOT NULL,
    version BIGINT NULL,
    booking_id BIGINT NOT NULL,
    CONSTRAINT pk_tickets PRIMARY KEY (id),
    CONSTRAINT uk_tickets_qr_code_value UNIQUE (qr_code_value),
    CONSTRAINT fk_tickets_booking FOREIGN KEY (booking_id) REFERENCES bookings (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payment_transactions (
    id BIGINT NOT NULL AUTO_INCREMENT,
    amount DECIMAL(14, 2) NOT NULL,
    bank_code VARCHAR(50) NULL,
    created_at DATETIME(6) NOT NULL,
    gateway_transaction_number VARCHAR(100) NULL,
    paid_at DATETIME(6) NULL,
    response_code VARCHAR(10) NULL,
    status ENUM ('FAILED', 'PENDING', 'REVIEW_REQUIRED', 'SUCCESS') NOT NULL,
    transaction_reference VARCHAR(100) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    version BIGINT NULL,
    booking_id BIGINT NOT NULL,
    CONSTRAINT pk_payment_transactions PRIMARY KEY (id),
    CONSTRAINT uk_payment_transactions_reference UNIQUE (transaction_reference),
    CONSTRAINT fk_payment_transactions_booking FOREIGN KEY (booking_id) REFERENCES bookings (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- The legacy model stored one QR on the booking. Preserve that QR for the first
-- migrated ticket and create stable unique values for any additional tickets.
INSERT INTO tickets (
    checked_in,
    checked_in_at,
    checked_in_by,
    qr_code_value,
    version,
    booking_id
)
SELECT
    b.checked_in,
    b.checked_in_at,
    b.checked_in_by,
    CASE
        WHEN numbers.ticket_number = 1 AND NULLIF(b.qr_code_value, '') IS NOT NULL
            THEN b.qr_code_value
        ELSE CONCAT(
            'MIGRATED-', b.id, '-', numbers.ticket_number, '-',
            REPLACE(UUID(), '-', '')
        )
    END,
    0,
    b.id
FROM bookings b
JOIN (
    SELECT ones.n + (tens.n * 10) + (hundreds.n * 100) + 1 AS ticket_number
    FROM
        (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
         UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) ones
    CROSS JOIN
        (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
         UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) tens
    CROSS JOIN
        (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
         UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) hundreds
) numbers ON numbers.ticket_number <= b.quantity
WHERE b.status IN ('SOLD', 'REFUNDED', 'REFUND_REQUESTED')
  AND NOT EXISTS (
      SELECT 1
      FROM tickets existing_ticket
      WHERE existing_ticket.booking_id = b.id
  );
