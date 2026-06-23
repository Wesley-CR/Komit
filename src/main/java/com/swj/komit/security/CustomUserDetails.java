package com.swj.komit.security;

import com.swj.komit.entity.User;
import com.swj.komit.enums.Role;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class CustomUserDetails implements UserDetails {

    @Getter
    private final Long userId;
    @Getter
    private final Role role;
    @Getter
    private final Long clientId;

    private final String email;
    private final String passwordHash;

    public CustomUserDetails(User user) {
        this.userId = user.getId();
        this.role = user.getRole();
        this.email = user.getEmail();
        this.passwordHash = user.getPasswordHash();
        // Access client while still within the calling @Transactional scope
        this.clientId = (user.getClient() != null) ? user.getClient().getId() : null;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }
}
