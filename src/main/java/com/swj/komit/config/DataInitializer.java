package com.swj.komit.config;

import com.swj.komit.entity.User;
import com.swj.komit.enums.Role;
import com.swj.komit.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${ARTIST_EMAIL:artist@komit.local}")
    private String artistEmail;

    @Value("${ARTIST_PASSWORD:changeme123}")
    private String artistPassword;

    @Override
    public void run(String... args) {
        boolean hasArtist = userRepository.findAll().stream()
                .anyMatch(u -> u.getRole() == Role.ARTIST);
        if (!hasArtist) {
            if ("changeme123".equals(artistPassword)) {
                log.warn("Default artist password in use — set ARTIST_PASSWORD environment variable");
            }
            userRepository.save(User.builder()
                    .email(artistEmail)
                    .passwordHash(passwordEncoder.encode(artistPassword))
                    .role(Role.ARTIST)
                    .client(null)
                    .build());
            log.info("Seeded artist user: {}", artistEmail);
        }
    }
}
