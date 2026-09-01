package com.tracker.habit_tracker_api.auth;


import com.tracker.habit_tracker_api.auth.dto.AuthResponse;
import com.tracker.habit_tracker_api.auth.dto.LoginRequest;
import com.tracker.habit_tracker_api.auth.dto.RegisterRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Auth", description = "Registration and login")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Register a new user (requires invite code)")
    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @Operation(summary = "Log in and receive a JWT")
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @Operation(summary = "Get the currently authenticated user")
    @GetMapping("/me")
    public AuthResponse me(@RequestAttribute(required = false) Object ignored,
                           org.springframework.security.core.Authentication auth) {
        User user = (User) auth.getPrincipal();
        return AuthResponse.builder().username(user.getUsername()).build();
    }
}