package com.example.supermercado.entity;


import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "produtos")
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    private String descricao;

    private Double preco;

    @Column(name = "quantidade_estoque")
    private Integer quantidadeEstoque;

    @Column(name = "data_cadastro")
    private LocalDateTime dataCadastro;

    private Boolean ativo;

    @ManyToOne
    @JoinColumn(name = "ID_Categoria", nullable = false)
    private Categoria categoria;

    @PrePersist
    public void prePersist() {
        this.dataCadastro = LocalDateTime.now();
    }

    public Produto() {}

    public Produto(String nome, Double preco, Integer quantidade, Categoria categoria) {
        this.nome = nome;
        this.preco = preco;
        this.quantidadeEstoque = quantidade;
        this.categoria = categoria;

    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public Double getPreco() {
        return preco;
    }

    public void setPreco(Double preco) {
        this.preco = preco;
    }

    public Integer getQuantidadeEstoque() {
        return quantidadeEstoque;
    }

    public void setQuantidadeEstoque(Integer quantidade) {
        this.quantidadeEstoque = quantidade;
    }

    public Categoria getCategoria() {
        return categoria;
    }

    public void setCategoria(Categoria categoria) {
        this.categoria = categoria;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    public LocalDateTime getDataCadastro() {
        return dataCadastro;
    }
}
