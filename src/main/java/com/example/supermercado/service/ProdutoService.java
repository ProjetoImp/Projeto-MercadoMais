package com.example.supermercado.service;

import com.example.supermercado.entity.Categoria;
import com.example.supermercado.entity.Produto;
import com.example.supermercado.exceptions.RecursoNaoEncontradoException;
import com.example.supermercado.repository.CategoriaRepository;
import com.example.supermercado.repository.ProdutoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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

        validarProduto(produto);

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

        validarProduto(produto);

        Categoria categoria = categoriaRepository
                .findById(produto.getCategoria().getIdCategoria())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria não encontrada"));

        produtoExistente.setNome(produto.getNome());
        produtoExistente.setDescricao(produto.getDescricao());
        produtoExistente.setQuantidadeEstoque(produto.getQuantidadeEstoque());
        produtoExistente.setPreco(produto.getPreco());
        produtoExistente.setCategoria(categoria);
        if (produto.getAtivo() != null) {
            produtoExistente.setAtivo(produto.getAtivo());
        }

        return produtoRepository.save(produtoExistente);
    }

    private void validarProduto(Produto produto) {
        if (produto.getNome() == null || produto.getNome().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O produto não pode ter um nome em branco.");
        }

        if (produto.getQuantidadeEstoque() == null || produto.getQuantidadeEstoque() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A quantidade em estoque não pode ser negativa.");
        }

        if (produto.getPreco() == null || produto.getPreco() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O preço deve ser maior que 0.");
        }

        if (produto.getCategoria() == null || produto.getCategoria().getIdCategoria() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A categoria do produto é obrigatória.");
        }
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
