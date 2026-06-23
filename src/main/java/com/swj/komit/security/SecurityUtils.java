package com.swj.komit.security;

import com.swj.komit.entity.Commission;
import com.swj.komit.enums.Role;
import com.swj.komit.exception.ResourceNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {

    public CustomUserDetails getCurrentUserDetails() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof CustomUserDetails details)) {
            return null;
        }
        return details;
    }

    public boolean isArtist() {
        CustomUserDetails details = getCurrentUserDetails();
        return details != null && details.getRole() == Role.ARTIST;
    }

    public Long getCurrentClientId() {
        CustomUserDetails details = getCurrentUserDetails();
        if (details == null || details.getRole() != Role.CLIENT) {
            return null;
        }
        return details.getClientId();
    }

    /**
     * Ownership enforcement for CLIENT callers. Returns 404 (not 403) to avoid leaking
     * existence of commissions belonging to other clients. ARTIST callers always pass.
     */
    public void assertCommissionAccess(Commission commission) {
        if (isArtist()) return;
        Long clientId = getCurrentClientId();
        if (clientId == null || !commission.getClient().getId().equals(clientId)) {
            throw new ResourceNotFoundException("Commission with id " + commission.getId() + " not found");
        }
    }
}
