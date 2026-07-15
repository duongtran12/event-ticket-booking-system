package com.duong.eventticket.service;

import com.duong.eventticket.dto.request.UpdateUserProfileRequest;
import com.duong.eventticket.dto.response.UserProfileResponse;

public interface UserService {

    UserProfileResponse getCurrentUser(String userEmail);

    UserProfileResponse updateCurrentUser(String userEmail, UpdateUserProfileRequest request);
}
