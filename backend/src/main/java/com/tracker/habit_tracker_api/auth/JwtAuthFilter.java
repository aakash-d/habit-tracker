package com.tracker.habit_tracker_api.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                String username = jwtUtil.extractUsername(token);
                if (username != null
                        && SecurityContextHolder.getContext().getAuthentication() == null) {
                    userRepository.findByUsername(username).ifPresent(user -> {
                        var authentication = new UsernamePasswordAuthenticationToken(
                                user, null, List.of());
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    });
                }
            } catch (Exception e) {
                // Invalid/expired token — leave the request unauthenticated
                SecurityContextHolder.clearContext();
            }
        }

        chain.doFilter(request, response);
    }
}