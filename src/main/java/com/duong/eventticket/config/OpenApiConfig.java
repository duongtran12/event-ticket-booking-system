package com.duong.eventticket.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI eventTicketOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Event Ticket Booking System API")
                        .description("REST API for managing events, bookings, authentication, and payments")
                        .version("v1.0.0")
                        .contact(new Contact().name("Duong")));
    }
}