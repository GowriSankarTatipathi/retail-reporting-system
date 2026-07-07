package com.gowrisankar.retailreporting.service.impl;

import com.gowrisankar.retailreporting.domain.entity.Role;
import com.gowrisankar.retailreporting.domain.entity.User;
import com.gowrisankar.retailreporting.dto.response.PageResponse;
import com.gowrisankar.retailreporting.dto.response.UserResponse;
import com.gowrisankar.retailreporting.exception.ResourceNotFoundException;
import com.gowrisankar.retailreporting.mapper.UserMapper;
import com.gowrisankar.retailreporting.repository.UserRepository;
import com.gowrisankar.retailreporting.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@PreAuthorize("hasRole('ADMIN')")
public class UserServiceImpl implements UserService {

    private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public PageResponse<UserResponse> listUsers(Pageable pageable) {
        return PageResponse.from(userRepository.findAll(pageable).map(UserMapper::toResponse));
    }

    @Override
    @Transactional
    public UserResponse updateRole(Long userId, Role newRole) {
        User user = findOrThrow(userId);
        Role previous = user.getRole();
        user.setRole(newRole);
        User saved = userRepository.save(user);
        log.info("Role changed for user {}: {} -> {}", saved.getEmail(), previous, newRole);
        return UserMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public UserResponse setEnabled(Long userId, boolean enabled) {
        User user = findOrThrow(userId);
        user.setEnabled(enabled);
        User saved = userRepository.save(user);
        log.info("User {} {}", saved.getEmail(), enabled ? "enabled" : "disabled");
        return UserMapper.toResponse(saved);
    }

    private User findOrThrow(Long id) {
        return userRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("User", id));
    }
}
