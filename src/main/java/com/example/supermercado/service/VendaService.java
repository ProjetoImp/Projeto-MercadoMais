package com.example.supermercado.service;

import com.example.supermercado.dto.* ;
import com.example.supermercado.entity.* ;
import com.example.supermercado.repository.* ;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.stream.Collectors;

@Service
public class VendaService {

    @Autowired
    private VendaRepository vendaRepository;
    @Autowired
    private ProdutoRepository produtoRepository;
    @Autowired
    private ClienteService clienteService;

    @Transactional
    public VendaResponseDTO registrarVenda(VendaRequestDTO dto) {
        if (dto.getItens() == null || dto.getItens().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A venda deve conter pelo menos um item.");
        }

        Venda venda = new Venda();
        double valorTotalVenda = 0.0;

        if (dto.getCpfCliente() != null && !dto.getCpfCliente().isBlank()) {
            Cliente cliente = clienteService.buscarPorCpf(dto.getCpfCliente())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente com o CPF informado não encontrado."));
            venda.setCliente(cliente);
        }

        for (ItemVendaRequestDTO itemDto : dto.getItens()) {
            Produto produto = produtoRepository.findById(itemDto.getIdProduto())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto ID " + itemDto.getIdProduto() + " não encontrado."));

            if (produto.getQuantidadeEstoque() < itemDto.getQuantidade()) {
                throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                        "Estoque insuficiente para o produto: " + produto.getNome() + ". Disponível: " + produto.getQuantidadeEstoque());
            }

            ItemVenda itemVenda = new ItemVenda();
            itemVenda.setProduto(produto);
            itemVenda.setQuantidade(itemDto.getQuantidade());
            itemVenda.setPrecoUnitario(produto.getPreco());
            itemVenda.setSubtotal(produto.getPreco() * itemDto.getQuantidade());
            itemVenda.setVenda(venda);

            produto.setQuantidadeEstoque(produto.getQuantidadeEstoque() - itemDto.getQuantidade());
            produtoRepository.save(produto);

            valorTotalVenda += itemVenda.getSubtotal();
            venda.getItens().add(itemVenda);
        }

        venda.setValorTotal(valorTotalVenda);
        Venda vendaSalva = vendaRepository.save(venda);

        return converterParaResponseDTO(vendaSalva);
    }

    public VendaResponseDTO buscarPorId(Long id) {
        Venda venda = vendaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Venda não encontrada."));
        return converterParaResponseDTO(venda);
    }

    private VendaResponseDTO converterParaResponseDTO(Venda venda) {
        VendaResponseDTO dto = new VendaResponseDTO();
        dto.setIdVenda(venda.getId());
        dto.setDataVenda(venda.getDataVenda());
        dto.setTotal(venda.getValorTotal());

        if (venda.getCliente() != null) {
            dto.setNomeCliente(venda.getCliente().getNome());
        }

        dto.setItens(venda.getItens().stream().map(item -> {
            ItemVendaResponseDTO itemDto = new ItemVendaResponseDTO();
            itemDto.setNomeProduto(item.getProduto().getNome());
            itemDto.setQuantidade(item.getQuantidade());
            itemDto.setPrecoUnitario(item.getPrecoUnitario());
            itemDto.setSubtotal(item.getSubtotal());
            return itemDto;
        }).collect(Collectors.toList()));

        return dto;
    }
}