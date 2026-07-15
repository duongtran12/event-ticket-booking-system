package com.duong.eventticket.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserProfileResponse {

    private Long id;
    private String fullName;
    private String email;
    private String role;
    private String phone;
    private String cccd;
    private Integer age;
    private String gender;
    private String avatarUrl;
}
