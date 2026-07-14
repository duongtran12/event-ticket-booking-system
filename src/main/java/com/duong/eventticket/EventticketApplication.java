package com.duong.eventticket;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class EventticketApplication {

	public static void main(String[] args) {
		SpringApplication.run(EventticketApplication.class, args);
	}

}
