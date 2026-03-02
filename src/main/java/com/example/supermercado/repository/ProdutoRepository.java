package com.example.supermercado.repository;


import com.example.supermercado.entity.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository()
public interface ProdutoRepository  extends JpaRepository<Produto, Long> {
    List<Produto> findByCategoriaIdCategoria(Long idCategoria);
}
