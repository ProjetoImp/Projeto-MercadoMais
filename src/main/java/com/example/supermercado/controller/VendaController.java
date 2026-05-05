package com.example.supermercado.controller;

import com.example.supermercado.dto.VendaRequestDTO;
import com.example.supermercado.dto.VendaResponseDTO;
import com.example.supermercado.service.VendaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/vendas")
@CrossOrigin(origins = "*")
public class VendaController {

    private final VendaService vendaService;

    @Autowired
    public VendaController(VendaService vendaService) {
        this.vendaService = vendaService;
    }

    @PostMapping
    public ResponseEntity<VendaResponseDTO> registrarVenda(@RequestBody VendaRequestDTO dto) {
        VendaResponseDTO novaVenda = vendaService.registrarVenda(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(novaVenda);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VendaResponseDTO> buscarVenda(@PathVariable Long id) {
        VendaResponseDTO venda = vendaService.buscarPorId(id);
        return ResponseEntity.ok(venda);
    }
}