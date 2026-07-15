package com.duong.eventticket.service.impl;

import com.duong.eventticket.dto.request.UpdateUserProfileRequest;
import com.duong.eventticket.dto.response.UserProfileResponse;
import com.duong.eventticket.entity.User;
import com.duong.eventticket.exception.custom.ResourceNotFoundException;
import com.duong.eventticket.repository.UserRepository;
import com.duong.eventticket.security.UserDetailsImpl;
import com.duong.eventticket.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public UserProfileResponse getCurrentUser(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toResponse(user);
    }

    @Override
    public UserProfileResponse updateCurrentUser(String userEmail, UpdateUserProfileRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setCccd(request.getCccd());
        user.setAge(request.getAge());
        user.setGender(request.getGender());
        user.setAvatarUrl(request.getAvatarUrl());

        userRepository.save(user);
        return toResponse(user);
    }

    private UserProfileResponse toResponse(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().getName().name(),
                user.getPhone(),
                user.getCccd(),
                user.getAge(),
                user.getGender(),
                user.getAvatarUrl()
        );
    }
}
