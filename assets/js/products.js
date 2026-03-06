// const API_URL = "http://localhost:8080/produtos" //endpoint do backend de produtos (Local)
// const CATEGORIAS_URL = "http://localhost:8080/categorias"; // endpoint do backend de categorias (Local)

const API_URL = "https://projeto-mercadomais-production.up.railway.app/produtos";  // endpoint do backend de produtos (Railway)
const CATEGORIAS_URL = "https://projeto-mercadomais-production.up.railway.app/categorias"; // endpoint do backend de categorias (Railway)


let allProducts = [];
let categorias = [];
let idParaExcluir = null;

// Inicialização da página
document.addEventListener('DOMContentLoaded', async () => {
    await carregarCategorias();
    await carregarProdutos();

    document.getElementById('btn-add-product').addEventListener('click', () => openModal(false));
    document.getElementById('search-input').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allProducts.filter(p =>
            p.nome.toLowerCase().includes(term) ||
            p.codigo.toLowerCase().includes(term)
        );
        renderTable(filtered);
    });

    document.getElementById('product-form').addEventListener('submit', handleFormSubmit);
    document.getElementById('confirm-delete-btn').addEventListener('click', confirmDelete);

    // Formatar preço automaticamente
    document.getElementById('input-preco').addEventListener('input', (e) => {
        let valor = e.target.value.replace(/\D/g, ''); // Remove tudo que não é número
        if (valor.length === 0) {
            e.target.value = '';
            return;
        }
        valor = valor.padStart(3, '0'); // Adiciona zeros à esquerda
        const inteiros = valor.slice(0, -2) || '0';
        const decimais = valor.slice(-2);
        e.target.value = parseInt(inteiros).toLocaleString('pt-BR') + ',' + decimais;
    });

    document.getElementById('input-estoque').addEventListener('input', (e) => {
    let valor = e.target.value.replace(/\D/g, ''); // Remove tudo que não é número
    
    // Remove zeros à esquerda (ex: 011 -> 11, 00 -> vazio)
    valor = valor.replace(/^0+/, '');
    
    // Formata com separador de milhar
    e.target.value = valor === '' ? '' : parseInt(valor).toLocaleString('pt-BR');
})
});

// Buscar categorias do backend e preencher select
async function carregarCategorias() {
    try {
        const res = await fetch(CATEGORIAS_URL);
        categorias = await res.json();

        const select = document.getElementById('input-categoria');
        select.innerHTML = ""; // limpa opções antigas
        categorias.forEach(c => {
            const option = document.createElement('option');
            option.value = c.idCategoria; // valor é o ID da categoria
            option.textContent = c.nome;
            select.appendChild(option);
        });
    } catch (err) {
        console.error("Erro ao carregar categorias:", err);
    }
}

// Buscar produtos do backend e renderizar
async function carregarProdutos() {
    try {
        const res = await fetch(API_URL);
        allProducts = await res.json();
        renderTable();
    } catch (err) {
        console.error("Erro ao carregar produtos:", err);
    }
}

// Renderiza tabela
function renderTable(products = allProducts) {
    const tbody = document.getElementById('products-table-body');
    const emptyState = document.getElementById('empty-state');

    tbody.innerHTML = '';
    if (products.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    emptyState.style.display = 'none';

    products.forEach(p => {
        const row = document.createElement('tr');
        row.className = "hover:bg-slate-50 transition-colors border-b border-slate-100";
        row.innerHTML = `
            <td class="px-6 py-4 font-mono text-sm">${p.id || ""}</td>
            <td class="px-6 py-4 font-mono">${formatarData(p.dataCadastro)}</td>
            <td class="px-6 py-4">${p.categoria?.nome || ""}</td>
            <td class="px-6 py-4 font-medium">${p.nome}</td>
            <td class="px-6 py-4">${p.descricao}</td>
            <td class="px-6 py-4">R$ ${p.preco.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
            <td class="px-6 py-4 text-slate-800">${p.quantidadeEstoque} un</td>
            <td class="px-6 py-4">${p.ativo ? "Ativo" : "Inativo"}</td>
        `;
        tbody.appendChild(row);
    });
}

// Abrir modal
function openModal(isEdit = false, id = null) {
    const modal = document.getElementById('product-modal');
    modal.style.display = 'flex';

    if (isEdit) {
        document.getElementById('modal-title').textContent = "Editar Produto";
        const p = allProducts.find(prod => prod.id === id);
        document.getElementById('edit-id').value = p.id;
        //document.getElementById('input-codigo').value = p.codigo;
        document.getElementById('input-data').value = p.dataCadastro.split('T')[0];
        document.getElementById('input-nome').value = p.nome;
        document.getElementById('input-categoria').value = p.categoria?.idCategoria || "";
        document.getElementById('input-descricao').value = p.descricao;
        // Formata o preço para exibição
        document.getElementById('input-preco').value = p.preco.toLocaleString('pt-BR', {minimumFractionDigits: 2});
        // Formata o estoque com duas casas decimais para exibição
        document.getElementById('input-estoque').value = String(p.quantidadeEstoque);
        document.getElementById('input-status').value = p.ativo ? "Ativo" : "Inativo";
    } else {
        document.getElementById('modal-title').textContent = "Novo Produto";
        document.getElementById('product-form').reset();
        document.getElementById('edit-id').value = '';
    }
}

// Fechar modal
function closeModal() {
    document.getElementById('product-modal').style.display = 'none';
}

// Abrir modal de exclusão
function openDeleteModal(id) {
    idParaExcluir = id;
    document.getElementById('delete-modal').style.display = 'flex';
}

function closeDeleteModal() {
    idParaExcluir = null;
    document.getElementById('delete-modal').style.display = 'none';
}

// Salvar produto
async function handleFormSubmit(e) {
    e.preventDefault();

    // Captura dos valores e remove formatação do preço
    const precoFormatado = document.getElementById('input-preco').value;
    const preco = parseFloat(precoFormatado.replace(/\./g, '').replace(',', '.'));
    
    // Captura do estoque e remove formatação (zeros à esquerda)
    const estoqueFormatado = document.getElementById('input-estoque').value;
    const estoque = parseInt(estoqueFormatado);

    // Validação de Preço: deve ser maior que 0
    if (isNaN(preco) || preco <= 0) {
        showToast("❌ O preço deve ser maior que zero");
        return; // Interrompe a execução
    }

    // Validação de Estoque: deve ser superior a 0
    if (isNaN(estoque) || estoque <= 0) {
        showToast("❌ O estoque deve ser superior a zero");
        return; // Interrompe a execução
    }

    const idExistente = document.getElementById('edit-id').value;

    const dados = {
        //codigo: document.getElementById('input-codigo').value,
        nome: document.getElementById('input-nome').value,
        categoria: { idCategoria: parseInt(document.getElementById('input-categoria').value) },
        descricao: document.getElementById('input-descricao').value,
        preco: preco,
        quantidadeEstoque: estoque,
        ativo: document.getElementById('input-status').value === "Ativo"
    };

    try {
        if (idExistente) {
            await fetch(`${API_URL}/${idExistente}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dados)
            });
            showToast("✅ Produto atualizado!");
        } else {
            await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dados)
            });
            showToast("✅ Produto cadastrado!");
        }

        await carregarProdutos();
        closeModal();
    } catch (err) {
        console.error("Erro ao salvar produto:", err);
        showToast("❌ Erro ao salvar produto");
    }
}

// Deletar produto
async function confirmDelete() {
    try {
        await fetch(`${API_URL}/${idParaExcluir}`, { method: "DELETE" });
        showToast("🗑️ Produto excluído!");
        await carregarProdutos();
        closeDeleteModal();
    } catch (err) {
        console.error("Erro ao deletar produto:", err);
        showToast("❌ Erro ao deletar produto");
    }
}

// Toast
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    toastMessage.textContent = message;
    toast.classList.add('show');

    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Formatar data
function formatarData(dataString) {
    if (!dataString) return "";
    const data = new Date(dataString);
    if (isNaN(data.getTime())) return dataString;
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}