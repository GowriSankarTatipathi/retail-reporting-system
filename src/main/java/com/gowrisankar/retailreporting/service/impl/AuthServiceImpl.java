package com.gowrisankar.retailreporting.service.impl;

import com.gowrisankar.retailreporting.domain.entity.Role;
import com.gowrisankar.retailreporting.domain.entity.User;
import com.gowrisankar.retailreporting.dto.request.LoginRequest;
import com.gowrisankar.retailreporting.dto.request.RefreshRequest;
import com.gowrisankar.retailreporting.dto.request.RegisterRequest;
import com.gowrisankar.retailreporting.dto.response.AuthResponse;
import com.gowrisankar.retailreporting.exception.DuplicateResourceException;
import com.gowrisankar.retailreporting.exception.InvalidCredentialsException;
import com.gowrisankar.retailreporting.mapper.UserMapper;
import com.gowrisankar.retailreporting.repository.UserRepository;
import com.gowrisankar.retailreporting.security.CustomUserDetailsService;
import com.gowrisankar.retailreporting.security.JwtService;
import com.gowrisankar.retailreporting.security.SecurityUser;
import com.gowrisankar.retailreporting.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;

    public AuthServiceImpl(UserRepository userRepository,
                            PasswordEncoder passwordEncoder,
                            JwtService jwtService,
                            AuthenticationManager authenticationManager,
                            CustomUserDetailsService userDetailsService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email().toLowerCase())) {
            throw new DuplicateResourceException("An account with email " + request.email() + " already exists");
        }

        User user = User.builder()
                .email(request.email().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.password()))
                .fullName(request.fullName())
                .role(Role.VIEWER) // self-registration always starts least-privileged (FR-1)
                .enabled(true)
                .build();
        user = userRepository.save(user);
        log.info("New user registered: {} (role={})", user.getEmail(), user.getRole());

        SecurityUser securityUser = new SecurityUser(user);
        return issueTokens(securityUser);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email().toLowerCase(), request.password()));
        SecurityUser securityUser = (SecurityUser) userDetailsService.loadUserByUsername(request.email().toLowerCase());
        log.info("User logged in: {}", securityUser.getUsername());
        return issueTokens(securityUser);
    }

    @Override
    public AuthResponse refresh(RefreshRequest request) {
        String token = request.refreshToken();
        String email;
        try {
            email = jwtService.extractUsername(token);
        } catch (Exception ex) {
            throw new InvalidCredentialsException("Invalid or expired refresh token");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        if (!jwtService.isRefreshToken(token) || !jwtService.isTokenValid(token, userDetails)) {
            throw new InvalidCredentialsException("Invalid or expired refresh token");
        }

        return issueTokens((SecurityUser) userDetails);
    }

    private AuthResponse issueTokens(SecurityUser securityUser) {
        String accessToken = jwtService.generateAccessToken(securityUser);
        String refreshToken = jwtService.generateRefreshToken(securityUser);
        return AuthResponse.bearer(
                accessToken,
                refreshToken,
                jwtService.getAccessTokenTtlSeconds(),
                UserMapper.toResponse(securityUser.getUser())
        );
    }
}
