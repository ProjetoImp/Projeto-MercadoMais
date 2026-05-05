let allClients = [
    { id: 1, dataCadastro: "2024-05-01", nome: "Ana Silva", cpf: "123.456.789-00", email: "ana.silva@email.com", telefone: "(11) 98888-7777", dataNascimento: "1990-01-01", ativo: true },
    { id: 2, dataCadastro: "2024-05-02", nome: "Bruno Oliveira", cpf: "234.567.890-11", email: "bruno.o@email.com", telefone: "(11) 97777-6666", dataNascimento: "1985-05-15", ativo: true }
];

let idParaExcluir = null;

document.addEventListener('DOMContentLoaded', () => {
    renderTable();

    // Eventos ByID
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
        renderTable(filtered);
    });
});

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
            document.getElementById('cpf').value = c.cpf;
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

function handleFormSubmit(e) {
    e.preventDefault();
    
    const idExistente = document.getElementById('edit-id').value;
    const cpfValor = document.getElementById('cpf').value;

    // Validação de formato de CPF (simples: checa tamanho)
    if (cpfValor.length < 14) {
        showToast("❌ CPF informado é inválido!");
        return;
    }

    // Validação de CPF Duplicado
    if (!idExistente && allClients.some(c => c.cpf === cpfValor)) {
        showToast("⚠️ Erro: Este CPF já está cadastrado!"); 
        return;
    }

    const dados = {
        nome: document.getElementById('nome').value,
        cpf: cpfValor,
        email: document.getElementById('email').value,
        telefone: document.getElementById('telefone').value,
        dataNascimento: document.getElementById('data-nascimento').value,
        ativo: document.getElementById('input-status').value === "Ativo"
    };

    if (idExistente) {
        const index = allClients.findIndex(c => c.id == idExistente);
        allClients[index] = { ...allClients[index], ...dados };
        showToast("✅ Cliente atualizado com sucesso!");
    } else {
        const novoCliente = {
            id: allClients.length > 0 ? Math.max(...allClients.map(c => c.id)) + 1 : 1,
            dataCadastro: new Date().toISOString().split('T')[0],
            ...dados
        };
        allClients.push(novoCliente);
        showToast("✅ Cliente cadastrado com sucesso!");
    }

    renderTable();
    closeModal();
}

// --- RENDERIZAÇÃO E EXCLUSÃO ---
function renderTable(clients = allClients) {
    const tbody = document.getElementById('products-table-body');
    const emptyState = document.getElementById('empty-state');
    tbody.innerHTML = '';
    
    if (clients.length === 0) {
        emptyState.classList.remove('hidden');
        emptyState.textContent = "Nenhum cliente encontrado.";
        return;
    }
    
    emptyState.classList.add('hidden');

    clients.forEach(c => {
        const row = document.createElement('tr');
        row.className = "hover:bg-slate-50 transition-colors border-b border-slate-100";
        row.innerHTML = `
            <td class="px-6 py-4 font-mono text-sm">${c.id}</td>
            <td class="px-6 py-4 text-sm">${formatarData(c.dataCadastro)}</td>
            <td class="px-6 py-4 font-medium">${c.nome}</td>
            <td class="px-6 py-4 text-sm">${c.cpf}</td>
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
}

function closeModal() { document.getElementById('product-modal').style.display = 'none'; }
function openDeleteModal(id) { idParaExcluir = id; document.getElementById('delete-modal').style.display = 'flex'; }
function closeDeleteModal() { document.getElementById('delete-modal').style.display = 'none'; }
function confirmDelete() {
    allClients = allClients.filter(c => c.id !== idParaExcluir);
    renderTable();
    showToast("🗑️ Cliente excluído com sucesso!");
    closeDeleteModal();
}

function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-message').textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function formatarData(dataString) {
    if (!dataString) return "";
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
}