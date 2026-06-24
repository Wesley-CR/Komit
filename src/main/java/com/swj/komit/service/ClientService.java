package com.swj.komit.service;

import com.swj.komit.dto.request.CreateClientRequest;
import com.swj.komit.dto.request.UpdateClientRequest;
import com.swj.komit.dto.response.ClientResponse;
import com.swj.komit.entity.Client;
import com.swj.komit.exception.ResourceNotFoundException;
import com.swj.komit.mapper.ClientMapper;
import com.swj.komit.repository.ClientRepository;
import com.swj.komit.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class ClientService {

    private final ClientRepository clientRepository;
    private final UserRepository userRepository;
    private final ClientMapper clientMapper;

    @Transactional(readOnly = true)
    public List<ClientResponse> findAll() {
        List<Client> clients = clientRepository.findAll();
        Set<Long> claimedIds = userRepository.findAllClaimedClientIds();
        return clientMapper.toResponseList(clients, claimedIds);
    }

    @Transactional(readOnly = true)
    public ClientResponse findById(Long id) {
        Client client = getClientOrThrow(id);
        boolean claimed = userRepository.existsByClientId(id);
        return clientMapper.toResponse(client, claimed);
    }

    public ClientResponse create(CreateClientRequest req) {
        Client client = clientMapper.toEntity(req);
        client.setInvitationToken(UUID.randomUUID().toString());
        Client saved = clientRepository.save(client);
        return clientMapper.toResponse(saved, false);
    }

    public ClientResponse update(Long id, UpdateClientRequest req) {
        Client client = getClientOrThrow(id);
        clientMapper.updateEntity(client, req);
        boolean claimed = userRepository.existsByClientId(id);
        return clientMapper.toResponse(clientRepository.save(client), claimed);
    }

    public void delete(Long id) {
        getClientOrThrow(id);
        clientRepository.deleteById(id);
    }

    Client getClientOrThrow(Long id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client with id " + id + " not found"));
    }
}
