package com.duong.eventticket.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Map;

@Getter
@AllArgsConstructor
public class ApiErrorResponse {

    private String message;
    private Map<String, String> errors;
}