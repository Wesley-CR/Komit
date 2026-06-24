package com.swj.komit.controller;

import com.swj.komit.dto.request.LoginRequest;
import com.swj.komit.dto.request.SignupRequest;
import com.swj.komit.dto.response.AuthResponse;
import com.swj.komit.entity.Client;
import com.swj.komit.entity.User;
import com.swj.komit.enums.Role;
import com.swj.komit.exception.BusinessRuleException;
import com.swj.komit.repository.ClientRepository;
import com.swj.komit.repository.UserRepository;
import com.swj.komit.security.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new BusinessRuleException("Email already registered: " + req.email());
        }

        Client client;

        if (req.invitationToken() != null && !req.invitationToken().isBlank()) {
            client = clientRepository.findByInvitationToken(req.invitationToken())
                    .orElseThrow(() -> new BusinessRuleException("Invalid or already-used invitation code."));

            if (userRepository.existsByClientId(client.getId())) {
                throw new BusinessRuleException("Invalid or already-used invitation code.");
            }

            client.setInvitationToken(null);
            clientRepository.save(client);
        } else {
            client = clientRepository.save(Client.builder()
                    .name(req.name())
                    .contact(req.contact())
                    .build());
        }

        User user = userRepository.save(User.builder()
                .email(req.email())
                .passwordHash(passwordEncoder.encode(req.password()))
                .role(Role.CLIENT)
                .client(client)
                .build());

        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(toAuthResponse(token, user));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password()));

        User user = userRepository.findByEmailWithClient(req.email())
                .orElseThrow(() -> new RuntimeException("User not found after authentication"));

        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(toAuthResponse(token, user));
    }

    private AuthResponse toAuthResponse(String token, User user) {
        Long clientId = user.getClient() != null ? user.getClient().getId() : null;
        return new AuthResponse(token, user.getEmail(), user.getRole().name(), user.getId(), clientId);
    }
}
