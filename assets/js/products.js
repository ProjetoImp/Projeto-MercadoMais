console.log("JS carregou");

// Base de dados teste
let allProducts = [
    { id: 1, codigo: 'PRD001', dataCadastro: '2026-01-15', categoria: 'Alimentos', nome: 'Arroz', descricao: "Camil", preco: 25.90, estoque: 50, statusProduto: "Ativo" },
    { id: 2, codigo: 'PRD002', dataCadastro: '2026-02-06', categoria: 'Bebidas', nome: 'Leite', descricao: "Jussara", preco: 5.50, estoque: 8, statusProduto: "Ativo" },
    { id: 3, codigo: 'PRD003', dataCadastro: '2026-02-22', categoria: 'Perfumaria', nome: 'Sabonete', descricao: "Dove", preco: 2.50, estoque: 15, statusProduto: "Ativo" },
    { id: 4, codigo: 'PRD004', dataCadastro: '2026-03-02', categoria: 'Limpeza', nome: 'Sabão em pó', descricao: "Omo", preco: 25.90, estoque: 20, statusProduto: "Inativo" }
];

let idParaExcluir = null;

// Renderização tabela
document.addEventListener('DOMContentLoaded', () => {
    renderTable();

    document.getElementById('btn-add-product').addEventListener('click', () => openModal(false));

    // Pesquisar produto por codigo e nome
    document.getElementById('search-input').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allProducts.filter(p => 
            p.nome.toLowerCase().includes(term) || 
            p.codigo.toLowerCase().includes(term)
        );
        renderTable(filtered);
    });

    // Salvar e deletar
    document.getElementById('product-form').addEventListener('submit', handleFormSubmit);
    document.getElementById('confirm-delete-btn').addEventListener('click', confirmDelete);
});

// Função da Tabela
function renderTable(products = allProducts) {
    const tbody = document.getElementById('products-table-body');
    const emptyState = document.getElementById('empty-state');
    
    tbody.innerHTML = '';

    if (products.length === 0) {
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    
    const rows = products.map(p => `
        <tr class="hover:bg-slate-50 transition-colors border-b border-slate-100">
            <td class="px-6 py-4 font-mono text-sm">${p.codigo}</td>
            <td class="px-6 py-4 font-mono">${formatarData(p.dataCadastro)}</td>
            <td class="px-6 py-4">${p.categoria}</td>
            <td class="px-6 py-4 font-medium">${p.nome}</td>
            <td class="px-6 py-4">${p.descricao}</td>
            <td class="px-6 py-4">R$ ${p.preco.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
            <td class="px-6 py-4 text-slate-800">${p.estoque} un</td>
            <td class="px-6 py-4">${p.statusProduto}</td>
            <!-- Botões de ação e remover comentados -->
            <!-- <td class="px-6 py-4 text-center">
                <div class="flex justify-center gap-3">
                    <button onclick="openModal(true, ${p.id})" class="text-blue-600 hover:text-blue-800" title="Editar">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    <button onclick="openDeleteModal(${p.id})" class="text-red-600 hover:text-red-800" title="Excluir">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                </div>
            </td> -->
        </tr>
    `).join('');

    tbody.innerHTML = rows;
}

// Funções dos Modais
function openModal(isEdit = false, id = null) {
    const modal = document.getElementById('product-modal');
    modal.style.display = 'flex';

    if (isEdit) {
        document.getElementById('modal-title').textContent = "Editar Produto";
        const p = allProducts.find(prod => prod.id === id);
        document.getElementById('edit-id').value = p.id;
        document.getElementById('input-categoria').value = p.categoria;
        document.getElementById('input-nome').value = p.nome;
        document.getElementById('input-descricao').value = p.descricao;
        document.getElementById('input-preco').value = p.preco;
        document.getElementById('input-estoque').value = p.estoque;
        document.getElementById('input-status').value = p.statusProduto;
    } else {
        document.getElementById('modal-title').textContent = "Novo Produto";
        document.getElementById('product-form').reset();
        document.getElementById('edit-id').value = '';
    }
}

function closeModal() {
    document.getElementById('product-modal').style.display = 'none';
}

function openDeleteModal(id) {
    idParaExcluir = id;
    document.getElementById('delete-modal').style.display = 'flex';
}

function closeDeleteModal() {
    idParaExcluir = null;
    document.getElementById('delete-modal').style.display = 'none';
}

// Forms modais
function handleFormSubmit(e) {
    e.preventDefault();
    const idExistente = document.getElementById('edit-id').value;
    
    // Captura campos do forms
    const dados = {
        codigo: document.getElementById('input-codigo').value,
        dataCadastro: document.getElementById('input-data').value || new Date().toLocaleDateString('pt-BR'),
        nome: document.getElementById('input-nome').value,
        categoria: document.getElementById('input-categoria').value,
        descricao: document.getElementById('input-descricao').value,
        preco: parseFloat(document.getElementById('input-preco').value),
        estoque: parseInt(document.getElementById('input-estoque').value),
        statusProduto: document.getElementById('input-status').value
    };

    if (idExistente) {
        const index = allProducts.findIndex(p => p.id == idExistente);
        allProducts[index] = { ...allProducts[index], ...dados };
        showToast("✅ Produto atualizado!");
    } else {
        allProducts.push({ id: Date.now(), ...dados });
        showToast("✅ Produto cadastrado!");
    }

    renderTable();
    closeModal();
}

function confirmDelete() {
    allProducts = allProducts.filter(p => p.id !== idParaExcluir);
    renderTable();
    closeDeleteModal();
    showToast("🗑️ Produto excluído!");
}

// Mensagem de salvar, editar, excluir
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    toastMessage.textContent = message;
    toast.classList.add('show'); 
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Função de formatar a data
function formatarData(dataString) {
    if (!dataString) return "";

    const data = new Date(dataString);

    if (isNaN(data.getTime())) {
        return dataString;
    }

    return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
    });
}