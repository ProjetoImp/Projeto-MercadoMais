package com.example.supermercado.dto;

import java.time.LocalDateTime;
import java.util.List;

public class VendaResponseDTO {
    private Long idVenda;
    private LocalDateTime dataVenda;
    private String nomeCliente; // Se for anônima, fica null ou não aparece
    private List<ItemVendaResponseDTO> itens;
    private Double total;

    public Long getIdVenda() { return idVenda; }
    public void setIdVenda(Long idVenda) { this.idVenda = idVenda; }
    public LocalDateTime getDataVenda() { return dataVenda; }
    public void setDataVenda(LocalDateTime dataVenda) { this.dataVenda = dataVenda; }
    public String getNomeCliente() { return nomeCliente; }
    public void setNomeCliente(String nomeCliente) { this.nomeCliente = nomeCliente; }
    public List<ItemVendaResponseDTO> getItens() { return itens; }
    public void setItens(List<ItemVendaResponseDTO> itens) { this.itens = itens; }
    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }
}