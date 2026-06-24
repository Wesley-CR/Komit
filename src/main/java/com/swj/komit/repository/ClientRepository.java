package com.swj.komit.repository;

import com.swj.komit.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClientRepository extends JpaRepository<Client, Long> {
    Optional<Client> findByInvitationToken(String invitationToken);
}
