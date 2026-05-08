const API_URL = "https://projeto-mercadomais-production.up.railway.app/clientes";

let allClients = [];
let idParaExcluir = null;
let currentPage = 1;
let currentFiltered = [];
const ITEMS_PER_PAGE = 10;

document.addEventListener('DOMContentLoaded', () => {
    carregarClientes();

    document.getElementById('btn-add-product').addEventListener('click', () => openModal(false));
    document.getElementById('product-form').addEventListener('submit', handleFormSubmit);
    document.getElementById('confirm-delete-btn').addEventListener('click', confirmDelete);

    // Máscaras
    document.getElementById('cpf').addEventListener('input', e => {
        e.target.value = mascaraCPF(e.target.value);
    });

    document.getElementById('telefone').addEventListener('input', e => {
        e.target.value = mascaraTelefone(e.target.value);
    });

    // Busca em tempo real (Nome ou CPF)
    document.getElementById('search-input').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        const filtered = allClients.filter(c =>
            c.nome.toLowerCase().includes(term) || c.cpf.includes(term)
        );
        currentPage = 1;
        renderTable(filtered);
    });
});

// --- API ---
async function carregarClientes() {
    try {
        const res = await fetch(API_URL);
        allClients = await res.json();
        renderTable();
    } catch (e) {
        showToast("❌ Erro ao carregar clientes.");
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const idExistente = document.getElementById('edit-id').value;
    const cpfValor = document.getElementById('cpf').value;

    if (cpfValor.replace(/\D/g, '').length < 11) {
        showToast("❌ CPF informado é inválido!");
        return;
    }

    const dados = {
        nome: document.getElementById('nome').value,
        cpf: cpfValor.replace(/\D/g, ''),
        email: document.getElementById('email').value,
        telefone: document.getElementById('telefone').value,
        dataNascimento: document.getElementById('data-nascimento').value || null,
        ativo: document.getElementById('input-status').value === "Ativo"
    };

    try {
        if (idExistente) {
            const res = await fetch(`${API_URL}/${idExistente}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
            if (!res.ok) throw new Error();
            showToast("✅ Cliente atualizado com sucesso!");
        } else {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
            if (!res.ok) throw new Error();
            showToast("✅ Cliente cadastrado com sucesso!");
        }

        await carregarClientes();
        closeModal();
    } catch (e) {
        showToast("❌ Erro ao salvar cliente.");
    }
}

async function confirmDelete() {
    try {
        const res = await fetch(`${API_URL}/${idParaExcluir}`, { method: 'DELETE' });
        if (!res.ok) throw new Error();
        showToast("🗑️ Cliente excluído com sucesso!");
        await carregarClientes();
    } catch (e) {
        showToast("❌ Erro ao excluir cliente.");
    }
    closeDeleteModal();
}

// --- FUNÇÕES DE MÁSCARA ---
function mascaraCPF(valor) {
    return valor
        .replace(/\D/g, "")
        .replace(/(\d{3})(\d)/, "$1.$2") // Coloca ponto após os 3 primeiros números
        .replace(/(\d{3})(\d)/, "$1.$2") // Coloca ponto após os 6 primeiros números
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2") // Coloca hífen antes dos 2 últimos
        .slice(0, 14); // Limite
}

function mascaraTelefone(valor) {
    return valor
        .replace(/\D/g, "")
        .replace(/^(\d{2})(\d)/g, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .slice(0, 15);
}

// --- LÓGICA DO MODAL ---
function openModal(isEdit = false, id = null) {
    const modal = document.getElementById('product-modal');
    const cpfInput = document.getElementById('cpf');
    modal.style.display = 'flex';
    document.getElementById('product-form').reset();

    if (isEdit) {
        document.getElementById('modal-title').textContent = "Editar Cliente";
        const c = allClients.find(client => client.id == id);
        if (c) {
            document.getElementById('edit-id').value = c.id;
            document.getElementById('nome').value = c.nome;
            document.getElementById('cpf').value = mascaraCPF(c.cpf);
            document.getElementById('email').value = c.email;
            document.getElementById('telefone').value = c.telefone || '';
            document.getElementById('data-nascimento').value = c.dataNascimento || '';
            document.getElementById('input-status').value = c.ativo ? "Ativo" : "Inativo";

            // CPF não editável no modo edição
            cpfInput.disabled = true;
            cpfInput.classList.add('bg-slate-100', 'cursor-not-allowed');
        }
    } else {
        document.getElementById('modal-title').textContent = "Novo Cliente";
        document.getElementById('edit-id').value = '';
        cpfInput.disabled = false;
        cpfInput.classList.remove('bg-slate-100', 'cursor-not-allowed');
    }
}

// --- RENDERIZAÇÃO, PAGINAÇÃO E EXCLUSÃO ---
function renderTable(clients = allClients) {
    currentFiltered = clients;
    const tbody = document.getElementById('products-table-body');
    const emptyState = document.getElementById('empty-state');
    tbody.innerHTML = '';

    if (clients.length === 0) {
        emptyState.classList.remove('hidden');
        emptyState.textContent = "Nenhum cliente encontrado.";
        renderPagination(0);
        return;
    }

    emptyState.classList.add('hidden');

    const totalPages = Math.ceil(clients.length / ITEMS_PER_PAGE);
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageClients = clients.slice(start, start + ITEMS_PER_PAGE);

    pageClients.forEach(c => {
        const row = document.createElement('tr');
        row.className = "hover:bg-slate-50 transition-colors border-b border-slate-100";
        row.innerHTML = `
            <td class="px-6 py-4 font-mono text-sm">${c.id}</td>
<td class="px-6 py-4 font-medium">${c.nome}</td>
            <td class="px-6 py-4 text-sm">${mascaraCPF(c.cpf)}</td>
            <td class="px-6 py-4 text-sm">${c.email}</td>
            <td class="px-6 py-4 text-sm">${c.telefone || '-'}</td>
            <td class="px-6 py-4">${c.ativo ? "Ativo" : "Inativo"}</td>
            <td class="px-6 py-4 text-center">
                <div class="flex justify-center gap-3">
                    <button onclick="openModal(true, ${c.id})" class="text-blue-600 hover:text-blue-800"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                    <button onclick="openDeleteModal(${c.id})" class="text-red-600 hover:text-red-800"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });

    renderPagination(clients.length);
}

function renderPagination(total) {
    const container = document.getElementById('pagination-container');
    if (!container) return;

    if (total === 0) {
        container.innerHTML = `
            <span class="pagination-info">0 clientes</span>
            <div class="pagination-controls">
                <button class="page-btn" disabled>&#8592; Anterior</button>
                <span class="page-indicator">Página 1 de 1</span>
                <button class="page-btn" disabled>Próxima &#8594;</button>
            </div>
        `;
        return;
    }

    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
    const start = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const end = Math.min(currentPage * ITEMS_PER_PAGE, total);

    container.innerHTML = `
        <span class="pagination-info">${start}–${end} de ${total} clientes</span>
        <div class="pagination-controls">
            <button onclick="changePage(${currentPage - 1})" class="page-btn" ${currentPage === 1 ? 'disabled' : ''}>&#8592; Anterior</button>
            <span class="page-indicator">Página ${currentPage} de ${totalPages}</span>
            <button onclick="changePage(${currentPage + 1})" class="page-btn" ${currentPage === totalPages ? 'disabled' : ''}>Próxima &#8594;</button>
        </div>
    `;
}

function changePage(page) {
    currentPage = page;
    renderTable(currentFiltered);
}

function closeModal() { document.getElementById('product-modal').style.display = 'none'; }
function openDeleteModal(id) { idParaExcluir = id; document.getElementById('delete-modal').style.display = 'flex'; }
function closeDeleteModal() { document.getElementById('delete-modal').style.display = 'none'; }

let toastTimer = null;

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    toastMessage.textContent = message;
    toast.classList.add('show');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

function closeToast() {
    clearTimeout(toastTimer);
    document.getElementById('toast').classList.remove('show');
}

function formatarData(dataString) {
    if (!dataString) return "-";
    const date = new Date(dataString);
    if (isNaN(date)) return "-";
    return date.toLocaleDateString('pt-BR');
}
