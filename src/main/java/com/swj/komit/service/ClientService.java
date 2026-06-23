package com.swj.komit.service;

import com.swj.komit.dto.request.CreateClientRequest;
import com.swj.komit.dto.request.UpdateClientRequest;
import com.swj.komit.dto.response.ClientResponse;
import com.swj.komit.entity.Client;
import com.swj.komit.exception.ResourceNotFoundException;
import com.swj.komit.mapper.ClientMapper;
import com.swj.komit.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class ClientService {

    private final ClientRepository clientRepository;
    private final ClientMapper clientMapper;

    @Transactional(readOnly = true)
    public List<ClientResponse> findAll() {
        return clientMapper.toResponseList(clientRepository.findAll());
    }

    @Transactional(readOnly = true)
    public ClientResponse findById(Long id) {
        return clientMapper.toResponse(getClientOrThrow(id));
    }

    public ClientResponse create(CreateClientRequest req) {
        Client client = clientMapper.toEntity(req);
        return clientMapper.toResponse(clientRepository.save(client));
    }

    public ClientResponse update(Long id, UpdateClientRequest req) {
        Client client = getClientOrThrow(id);
        clientMapper.updateEntity(client, req);
        return clientMapper.toResponse(clientRepository.save(client));
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
