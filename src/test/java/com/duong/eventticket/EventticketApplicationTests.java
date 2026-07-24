package com.duong.eventticket;

import com.duong.eventticket.dto.request.BookingRequest;
import com.duong.eventticket.dto.request.EventRequest;
import com.duong.eventticket.dto.request.LoginRequest;
import com.duong.eventticket.dto.request.RegisterRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class EventticketApplicationTests {

	private static ValidatorFactory validatorFactory;
	private static Validator validator;

	@BeforeAll
	static void setUpValidator() {
		validatorFactory = Validation.buildDefaultValidatorFactory();
		validator = validatorFactory.getValidator();
	}

	@AfterAll
	static void closeValidatorFactory() {
		validatorFactory.close();
	}

	@Test
	void eventRequestShouldPassWhenInputIsValid() {
		EventRequest request = new EventRequest();
		request.setTitle("Spring Boot Workshop");
		request.setDescription("A practical backend workshop");
		request.setLocation("Ho Chi Minh City");
		request.setDateTime(LocalDateTime.now().plusDays(1));
		request.setTicketTypes(List.of(new com.duong.eventticket.dto.request.TicketTypeRequest() {{
			setName("General");
			setPrice(java.math.BigDecimal.valueOf(150000));
			setTotalTickets(100);
		}}));

		Set<ConstraintViolation<EventRequest>> violations = validator.validate(request);

		assertTrue(violations.isEmpty());
	}

	@Test
	void bookingRequestShouldRejectNonPositiveQuantity() {
		BookingRequest request = new BookingRequest();
		request.setEventId(1L);
		request.setQuantity(0);

		Set<ConstraintViolation<BookingRequest>> violations = validator.validate(request);

		assertFalse(violations.isEmpty());
	}

	@Test
	void loginRequestShouldRejectShortPassword() {
		LoginRequest request = new LoginRequest();
		request.setEmail("user@example.com");
		request.setPassword("123");

		Set<ConstraintViolation<LoginRequest>> violations = validator.validate(request);

		assertFalse(violations.isEmpty());
	}

	@Test
	void registerRequestShouldRejectInvalidEmail() {
		RegisterRequest request = new RegisterRequest();
		request.setFullName("Nguyen Van A");
		request.setEmail("invalid-email");
		request.setPassword("password123");

		Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(request);

		assertFalse(violations.isEmpty());
	}
}
