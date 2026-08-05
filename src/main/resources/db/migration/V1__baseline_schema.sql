CREATE TABLE roles (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name ENUM ('ROLE_ADMIN', 'ROLE_USER') NOT NULL,
    CONSTRAINT pk_roles PRIMARY KEY (id),
    CONSTRAINT uk_roles_name UNIQUE (name)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id BIGINT NULL,
    age INT NULL,
    avatar_url VARCHAR(2048) NULL,
    cccd VARCHAR(20) NULL,
    gender VARCHAR(20) NULL,
    phone VARCHAR(20) NULL,
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uk_users_email UNIQUE (email),
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE events (
    id BIGINT NOT NULL AUTO_INCREMENT,
    available_tickets INT NOT NULL,
    created_at DATETIME(6) NOT NULL,
    date_time DATETIME(6) NOT NULL,
    description TEXT NULL,
    location VARCHAR(255) NOT NULL,
    price DECIMAL(38, 2) NOT NULL,
    title VARCHAR(255) NOT NULL,
    total_tickets INT NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    image_url VARCHAR(2048) NULL,
    CONSTRAINT pk_events PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE ticket_types (
    id BIGINT NOT NULL AUTO_INCREMENT,
    available_tickets INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(38, 2) NOT NULL,
    total_tickets INT NOT NULL,
    event_id BIGINT NOT NULL,
    CONSTRAINT pk_ticket_types PRIMARY KEY (id),
    CONSTRAINT fk_ticket_types_event FOREIGN KEY (event_id) REFERENCES events (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE bookings (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL,
    quantity INT NOT NULL,
    status ENUM ('AVAILABLE', 'CANCELLED', 'CONFIRMED', 'EXPIRED', 'PENDING', 'REFUNDED', 'REFUND_REQUESTED', 'RESERVED', 'SOLD') NOT NULL,
    total_price DECIMAL(38, 2) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    event_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    cancel_reason VARCHAR(500) NULL,
    checked_in BIT(1) NOT NULL,
    checked_in_at DATETIME(6) NULL,
    checked_in_by VARCHAR(255) NULL,
    qr_code_value VARCHAR(500) NULL,
    ticket_type_id BIGINT NULL,
    refund_reason VARCHAR(500) NULL,
    expires_at DATETIME(6) NULL,
    version BIGINT NULL,
    CONSTRAINT pk_bookings PRIMARY KEY (id),
    CONSTRAINT fk_bookings_event FOREIGN KEY (event_id) REFERENCES events (id),
    CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_bookings_ticket_type FOREIGN KEY (ticket_type_id) REFERENCES ticket_types (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE tickets (
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

CREATE TABLE payment_transactions (
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
