package com.gowrisankar.retailreporting.service;

import com.gowrisankar.retailreporting.domain.entity.Role;
import com.gowrisankar.retailreporting.dto.response.PageResponse;
import com.gowrisankar.retailreporting.dto.response.UserResponse;
import org.springframework.data.domain.Pageable;

public interface UserService {

    PageResponse<UserResponse> listUsers(Pageable pageable);

    UserResponse updateRole(Long userId, Role newRole);

    UserResponse setEnabled(Long userId, boolean enabled);
}
