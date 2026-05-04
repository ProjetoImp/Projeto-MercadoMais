package com.example.supermercado.service;

import com.example.supermercado.entity.Cliente;
import com.example.supermercado.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    public List<Cliente> listarTodos() {
        return clienteRepository.findAll();
    }

    public Optional<Cliente> buscarPorId(Long id) {
        return clienteRepository.findById(id);
    }

    public Optional<Cliente> buscarPorCpf(String cpf) {
        String cpfLimpo = limparCpf(cpf);
        return clienteRepository.findByCpf(cpfLimpo);
    }

    public Cliente salvar(Cliente cliente) {

        cliente.setCpf(limparCpf(cliente.getCpf()));

        if (!isCpfValido(cliente.getCpf())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CPF inválido: formato ou dígitos verificadores incorretos.");
        }

        if (clienteRepository.existsByCpf(cliente.getCpf())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe um cliente cadastrado com este CPF.");
        }

        return clienteRepository.save(cliente);
    }

    public Cliente atualizar(Long id, Cliente dadosNovos) {
        return clienteRepository.findById(id).map(clienteExistente -> {

            String cpfNovoLimpo = limparCpf(dadosNovos.getCpf());
            if (!clienteExistente.getCpf().equals(cpfNovoLimpo)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O CPF de um cliente não pode ser alterado.");
            }

            clienteExistente.setNome(dadosNovos.getNome());
            clienteExistente.setEmail(dadosNovos.getEmail());
            clienteExistente.setTelefone(dadosNovos.getTelefone());
            clienteExistente.setDataNascimento(dadosNovos.getDataNascimento());
            clienteExistente.setAtivo(dadosNovos.getAtivo());

            return clienteRepository.save(clienteExistente);
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado."));
    }

    public void deletar(Long id) {
        if (!clienteRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado.");
        }
        clienteRepository.deleteById(id);
    }

    private String limparCpf(String cpf) {
        return (cpf == null) ? null : cpf.replaceAll("\\D", "");
    }

    private boolean isCpfValido(String cpf) {
        if (cpf == null || cpf.length() != 11 || cpf.matches("(\\d)\\1{10}")) return false;

        try {
            int soma = 0, peso = 10;
            for (int i = 0; i < 9; i++) soma += Character.getNumericValue(cpf.charAt(i)) * peso--;
            int r = 11 - (soma % 11);
            int d1 = (r > 9) ? 0 : r;

            soma = 0; peso = 11;
            for (int i = 0; i < 10; i++) soma += Character.getNumericValue(cpf.charAt(i)) * peso--;
            r = 11 - (soma % 11);
            int d2 = (r > 9) ? 0 : r;

            return (d1 == Character.getNumericValue(cpf.charAt(9)) && d2 == Character.getNumericValue(cpf.charAt(10)));
        } catch (Exception e) { return false; }
    }
}