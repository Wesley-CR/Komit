package com.swj.komit.mapper;

import com.swj.komit.dto.request.CreateClientRequest;
import com.swj.komit.dto.request.UpdateClientRequest;
import com.swj.komit.dto.response.ClientResponse;
import com.swj.komit.entity.Client;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

@Component
public class ClientMapper {

    public Client toEntity(CreateClientRequest req) {
        return Client.builder()
                .name(req.name())
                .contact(req.contact())
                .notes(req.notes())
                .build();
    }

    public void updateEntity(Client client, UpdateClientRequest req) {
        if (req.name() != null) client.setName(req.name());
        if (req.contact() != null) client.setContact(req.contact());
        if (req.notes() != null) client.setNotes(req.notes());
    }

    public ClientResponse toResponse(Client client, boolean claimed) {
        return new ClientResponse(
                client.getId(),
                client.getName(),
                client.getContact(),
                client.getNotes(),
                client.getInvitationToken(),
                claimed
        );
    }

    public List<ClientResponse> toResponseList(List<Client> clients, Set<Long> claimedIds) {
        return clients.stream()
                .map(c -> toResponse(c, claimedIds.contains(c.getId())))
                .toList();
    }
}
