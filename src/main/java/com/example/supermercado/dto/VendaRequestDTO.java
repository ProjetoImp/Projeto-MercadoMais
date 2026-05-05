package com.example.supermercado.dto;
import java.util.List;

public class VendaRequestDTO {
    private String cpfCliente; // Opcional
    private List<ItemVendaRequestDTO> itens;
    
    public String getCpfCliente() { return cpfCliente; }
    public void setCpfCliente(String cpfCliente) { this.cpfCliente = cpfCliente; }
    public List<ItemVendaRequestDTO> getItens() { return itens; }
    public void setItens(List<ItemVendaRequestDTO> itens) { this.itens = itens; }
}