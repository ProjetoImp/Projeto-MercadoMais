package com.example.supermercado.service;

import com.example.supermercado.entity.Categoria;
import com.example.supermercado.entity.Produto;
import com.example.supermercado.exceptions.RecursoNaoEncontradoException;
import com.example.supermercado.repository.CategoriaRepository;
import com.example.supermercado.repository.ProdutoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;

    private final CategoriaRepository categoriaRepository;

    public ProdutoService(ProdutoRepository produtoRepository,
                          CategoriaRepository categoriaRepository) {
        this.produtoRepository = produtoRepository;
        this.categoriaRepository = categoriaRepository;
    }

    public Produto salvar(Produto produto) {

        if (produto.getNome().isBlank()) {
            throw new RecursoNaoEncontradoException("O produto não pode ter um nome em branco.");
        }

        if (produto.getQuantidadeEstoque() <= 0) {
            throw new RecursoNaoEncontradoException("A quantidade não pode ser menor que 0");
        }

        if (!(produto.getPreco() > 0)) {
            throw new RecursoNaoEncontradoException("O preço deve ser maior que 0.");
        }

        Categoria categoria = categoriaRepository
                .findById(produto.getCategoria().getIdCategoria())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria não encontrada"));

        produto.setCategoria(categoria);

        return produtoRepository.save(produto);
    }

    public Produto atualizar(Produto produto) {

        if (produto.getId() == null) {
            throw new IllegalArgumentException("O ID do produto deve ser informado para a atualização.");
        }

        Produto produtoExistente = buscarPorId(produto.getId());

        if (produto.getNome().isBlank()) {
            throw new RecursoNaoEncontradoException("O produto não pode ter um nome em branco.");
        }

        if (produto.getQuantidadeEstoque() <= 0) {
            throw new RecursoNaoEncontradoException("A quantidade não pode ser menor que 0");
        }

        if (!(produto.getPreco() > 0)) {
            throw new RecursoNaoEncontradoException("O preço deve ser maior que 0.");
        }

        Categoria categoria = categoriaRepository
                .findById(produto.getCategoria().getIdCategoria())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria não encontrada"));

        produtoExistente.setNome(produto.getNome());
        produtoExistente.setQuantidadeEstoque(produto.getQuantidadeEstoque());
        produtoExistente.setPreco(produto.getPreco());
        produtoExistente.setCategoria(categoria);

        return produtoRepository.save(produtoExistente);
    }

    public void deletar(Long id) {

        Produto produto = buscarPorId(id);

        produtoRepository.delete(produto);
    }

    public List<Produto> buscarPorCategoria(Long idCategoria) {

        if (!categoriaRepository.existsById(idCategoria)) {
            throw new RecursoNaoEncontradoException("Categoria não encontrada.");
        }

        return produtoRepository.findByCategoriaIdCategoria(idCategoria);
    }

    public List<Produto> exibirProdutos() {
        return produtoRepository.findAll();
    }

    public Produto buscarPorId(Long id) {
        return produtoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produto com ID " + id + " não encontrado."));
    }

}
