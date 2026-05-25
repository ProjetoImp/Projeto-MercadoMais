// URL base herdada do seu ecossistema de produção do Railway
const PRODUTOS_URL = "https://projeto-mercadomais-production.up.railway.app/produtos";
const CATEGORIAS_URL = "https://projeto-mercadomais-production.up.railway.app/categorias";
const CLIENTES_URL = "https://projeto-mercadomais-production.up.railway.app/clientes";

// Estados da Aplicação
let bancoProdutos = [];
let bancoCategorias = [];
let bancoClientes = [];
let carrinho = [];
let clienteIdentificado = null;

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    await carregarDadosIniciais();

    // Eventos de busca na vitrine
    document.getElementById('search-input').addEventListener('input', filtrarVitrine);
    document.getElementById('filter-categoria').addEventListener('change', filtrarVitrine);

    // Máscara de CPF
    document.getElementById('cpf-cliente').addEventListener('input', (e) => {
        e.target.value = e.target.value
            .replace(/\D/g, "")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
            .slice(0, 14);
    });
});

// Busca dos dados da API/Banco
async function carregarDadosIniciais() {
    try {
        const [resProd, resCat, resCli] = await Promise.all([
            fetch(PRODUTOS_URL),
            fetch(CATEGORIAS_URL),
            fetch(CLIENTES_URL)
        ]);

        bancoProdutos = await resProd.json();
        bancoCategorias = await resCat.json();
        bancoClientes = await resCli.json();

        preencherFiltroCategorias();
        renderizarVitrine(bancoProdutos);
    } catch (err) {
        console.error("Erro na carga inicial do PDV:", err);
        mostrarToast("❌ Falha de comunicação com o servidor.");
    }
}

// Preenche opções de categorias
function preencherFiltroCategorias() {
    const select = document.getElementById('filter-categoria');
    bancoCategorias.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.nome; 
        opt.textContent = c.nome;
        select.appendChild(opt);
    });
}

// Renderiza a Vitrine de Produtos
function renderizarVitrine(produtos) {
    const grid = document.getElementById('grid-produtos');
    grid.innerHTML = '';

    if (produtos.length === 0) {
        grid.innerHTML = `<p class="col-span-full text-center py-12 text-slate-500 font-medium">Nenhum produto localizado.</p>`;
        return;
    }

    // Mapeamento por categoria
    const mapeamentoEmojis = {
        "Alimentos": "🍛",
        "Bebidas": "🥤",
        "Perfumaria": "🧼",
        "Higiene": "🧺",
        "Hortifruti": "🍉",
        "Variados": "🧹"
    };

    produtos.forEach(p => {
        // Regra de Negócio: Apenas produtos marcados como ativos entram na listagem
        if (!p.ativo) return;

        const itemNoCarrinho = carrinho.find(item => item.id === p.id);
        const qtdCarrinho = itemNoCarrinho ? itemNoCarrinho.quantidade : 0;
        
        // Calcula o estoque disponível subtraindo o que já foi pro carrinho
        const estoqueDisponivel = p.quantidadeEstoque - qtdCarrinho;

        // Identifica nome da categoria e associa ao emoji correto
        const nomeCategoria = p.categoria?.nome || 'Geral';
        const emojiCategoria = mapeamentoEmojis[nomeCategoria] || "📦";

        //ATENÇÃO
        // ALTERAR ESSA PARTE PARA ESTOQUE <= 0, QUANDO CRIAR O FETCH NO BACKEND
        const estaEsgotado = estoqueDisponivel <= 1;

        const card = document.createElement('div');
        card.className = `bg-white rounded-2xl p-5 border shadow-sm flex flex-col justify-between transition-all ${estaEsgotado ? 'opacity-60 border-slate-200' : 'border-slate-100 hover:shadow-md'}`;
        
        card.innerHTML = `
            <div class="space-y-2">
                <div class="flex items-center gap-1.5">
                    <span class="text-lg">${emojiCategoria}</span>
                    <span class="text-xs font-bold text-teal-600 tracking-wide uppercase">${nomeCategoria}</span>
                </div>
                
                <div class="space-y-1">
                    <h3 class="font-bold text-slate-800 text-base line-clamp-2" title="${p.nome}">${p.nome}</h3>
                    <p class="text-xs text-slate-400 line-clamp-2">${p.descricao || 'Sem descrição cadastrada'}</p>
                </div>
            </div>

            <div class="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                <div class="flex flex-col">
                    <span class="text-xs text-slate-400 font-medium">Preço à vista</span>
                    <span class="text-lg font-extrabold text-slate-900">R$ ${p.preco.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                </div>

                ${estaEsgotado 
                    ? `<span class="bg-red-50 text-red-600 px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide uppercase">Indisponível</span>`
                    : `<button onclick="adicionarAoCarrinho(${p.id})" class="px-3.5 py-2 bg-[#1e3a8a] hover:bg-[#1e40af] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all">
                        Adicionar ${qtdCarrinho > 0 ? `(${qtdCarrinho})` : ''}
                       </button>`
                }
            </div>
        `;
        grid.appendChild(card);
    });
}

// Filtro Combinado de Caixa de Busca + Dropdown Categoria
function filtrarVitrine() {
    const termoBusca = document.getElementById('search-input').value.toLowerCase().trim();
    const categoriaSelecionada = document.getElementById('filter-categoria').value;

    const produtosFiltrados = bancoProdutos.filter(p => {
        const bateNome = p.nome.toLowerCase().includes(termoBusca) || String(p.id).includes(termoBusca);
        const bateCategoria = categoriaSelecionada === "" || (p.categoria && p.categoria.nome === categoriaSelecionada);
        return bateNome && bateCategoria;
    });

    renderizarVitrine(produtosFiltrados);
}

// Adiciona ou Incrementa item no carrinho respeitando as travas de estoque
function adicionarAoCarrinho(idProduto) {
    const produto = bancoProdutos.find(p => p.id === idProduto);
    if (!produto) return;

    const itemCarrinho = carrinho.find(item => item.id === idProduto);
    
    if (itemCarrinho) {
        if (itemCarrinho.quantidade >= produto.quantidadeEstoque) {
            mostrarToast(`⚠️ Limite máximo atingido! Estoque atual: ${produto.quantidadeEstoque} un.`);
            return;
        }
        itemCarrinho.quantidade++;
    } else {
        carrinho.push({
            id: produto.id,
            nome: produto.nome,
            preco: produto.preco,
            quantidade: 1,
            estoqueMaximo: produto.quantidadeEstoque
        });
    }

    mostrarToast(`✅ ${produto.nome} inserido no carrinho!`);
    atualizarIndicadoresInterface();
    filtrarVitrine(); 
}

// Altera quantidades (+ e -) dentro da tela do Carrinho
function alterarQuantidadeItem(idProduto, mudanca) {
    const item = carrinho.find(i => i.id === idProduto);
    if (!item) return;

    if (mudanca > 0 && item.quantidade >= item.estoqueMaximo) {
        mostrarToast(`⚠️ Limite máximo atingido! Apenas ${item.estoqueMaximo} un. disponíveis em estoque.`);
        return;
    }

    item.quantidade += mudanca;

    if (item.quantidade <= 0) {
        carrinho = carrinho.filter(i => i.id !== idProduto);
    }

    atualizarIndicadoresInterface();
    renderizarListaCarrinho();
    filtrarVitrine(); 
}

// Remove o item completo
function removerItemCarrinho(idProduto) {
    carrinho = carrinho.filter(i => i.id !== idProduto);
    atualizarIndicadoresInterface();
    renderizarListaCarrinho();
    filtrarVitrine();
    mostrarToast("🗑️ Item removido do carrinho.");
}

// Atualiza Indicadores
function atualizarIndicadoresInterface() {
    const totalItens = carrinho.reduce((acc, curr) => acc + curr.quantidade, 0);
    const valorGeral = carrinho.reduce((acc, curr) => acc + (curr.preco * curr.quantidade), 0);

    document.getElementById('badge-contador-carrinho').textContent = totalItens;
    document.getElementById('total-itens-carrinho').textContent = totalItens;
    document.getElementById('valor-total-carrinho').textContent = `R$ ${valorGeral.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
}

// Renderização Lista do Carrinho
function renderizarListaCarrinho() {
    const container = document.getElementById('lista-carrinho');
    container.innerHTML = '';

    if (carrinho.length === 0) {
        container.innerHTML = `<p class="text-center py-8 text-slate-400">Seu carrinho está vazio no momento.</p>`;
        document.getElementById('btn-finalizar').disabled = true;
        document.getElementById('btn-finalizar').classList.add('opacity-50', 'cursor-not-allowed');
        return;
    }

    document.getElementById('btn-finalizar').disabled = false;
    document.getElementById('btn-finalizar').classList.remove('opacity-50', 'cursor-not-allowed');

    carrinho.forEach(item => {
        const subtotal = item.preco * item.quantidade;
        const row = document.createElement('div');
        row.className = "py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2";
        row.innerHTML = `
            <div class="flex-1">
                <h4 class="font-bold text-slate-800 text-sm">${item.nome}</h4>
                <p class="text-xs text-slate-400">Unitário: R$ ${item.preco.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
            </div>
            
            <div class="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div class="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                    <button onclick="alterarQuantidadeItem(${item.id}, -1)" class="px-2.5 py-1 text-slate-600 hover:bg-slate-200 font-bold">-</button>
                    <span class="px-3 py-1 font-mono text-sm font-semibold bg-white border-x border-slate-200 min-w-[40px] text-center">${item.quantidade}</span>
                    <button onclick="alterarQuantidadeItem(${item.id}, 1)" class="px-2.5 py-1 text-slate-600 hover:bg-slate-200 font-bold ${item.quantidade >= item.estoqueMaximo ? 'opacity-30 cursor-not-allowed' : ''}">+</button>
                </div>

                <div class="text-right min-w-[90px]">
                    <span class="text-sm font-bold text-slate-800 block">R$ ${subtotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                </div>

                <button onclick="removerItemCarrinho(${item.id})" class="text-red-500 hover:text-red-700 p-1" title="Remover item">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
        `;
        container.appendChild(row);
    });
}

// Validação e busca de Clientes pelo CPF
function buscarCliente() {
    const cpfDigitado = document.getElementById('cpf-cliente').value.replace(/\D/g, '');
    const msg = document.getElementById('msg-cliente');

    if (cpfDigitado.length < 11) {
        msg.textContent = "❌ CPF inválido ou incompleto.";
        msg.className = "text-xs font-medium text-red-500 mt-1";
        clienteIdentificado = null;
        return;
    }

    const cliente = bancoClientes.find(c => c.cpf === cpfDigitado && c.ativo);

    if (cliente) {
        clienteIdentificado = cliente;
        msg.textContent = `✅ Cliente Confirmado: ${cliente.nome}`;
        msg.className = "text-xs font-medium text-emerald-600 mt-1";
    } else {
        clienteIdentificado = null;
        msg.textContent = "⚠️ CPF não encontrado — a compra será registrada como anônima.";
        msg.className = "text-xs font-medium text-amber-600 mt-1";
    }
}

// Navegação de telas do PDV
function mudarTela(destino) {
    document.getElementById('secao-vitrine').classList.add('hidden');
    document.getElementById('secao-carrinho').classList.add('hidden');
    document.getElementById('secao-notinha').classList.add('hidden');
    document.getElementById('btn-flutuante-carrinho').classList.add('hidden');

    if (destino === 'vitrine') {
        document.getElementById('secao-vitrine').classList.remove('hidden');
        document.getElementById('btn-flutuante-carrinho').classList.remove('hidden');
    } else if (destino === 'carrinho') {
        document.getElementById('secao-carrinho').classList.remove('hidden');
        renderizarListaCarrinho();
    } else if (destino === 'notinha') {
        document.getElementById('secao-notinha').classList.remove('hidden');
    }
}

// Finaliza a transação montando o Cupom Fiscal / Notinha
function finalizarCompra() {
    if (carrinho.length === 0) return;

    const agora = new Date();
    document.getElementById('notinha-data').textContent = agora.toLocaleString('pt-BR');

    const targetNome = document.getElementById('notinha-cliente');
    const targetCpfRow = document.getElementById('notinha-cpf-row');
    const targetCpf = document.getElementById('notinha-cpf');

    if (clienteIdentificado) {
        targetNome.textContent = clienteIdentificado.nome.toUpperCase();
        targetCpf.textContent = document.getElementById('cpf-cliente').value;
        targetCpfRow.classList.remove('hidden');
    } else {
        targetNome.textContent = "COMPRA ANÔNIMA";
        targetCpfRow.classList.add('hidden');
    }

    const containerItens = document.getElementById('notinha-itens');
    containerItens.innerHTML = '';

    let valorTotalGeral = 0;

    carrinho.forEach((item, index) => {
        const subtotal = item.preco * item.quantidade;
        valorTotalGeral += subtotal;

        const numItem = String(index + 1).padStart(3, '0');
        const itemRow = document.createElement('div');
        itemRow.className = "space-y-0.5 text-[11px]";
        itemRow.innerHTML = `
            <div class="flex justify-between font-bold">
                <span class="w-1/2 truncate">${numItem} ${item.nome.toUpperCase()}</span>
                <span class="w-1/6 text-center">${item.quantidade} un</span>
                <span class="w-1/6 text-right">${item.preco.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                <span class="w-1/6 text-right">${subtotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
            </div>
        `;
        containerItens.appendChild(itemRow);
    });

    document.getElementById('notinha-total').textContent = `R$ ${valorTotalGeral.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;

    mudarTela('notinha');
    mostrarToast("🚀 Venda realizada com sucesso!");
}

// Reseta o estado do PDV e reinicia o fluxo
function novaCompra() {
    carrinho = [];
    clienteIdentificado = null;
    
    document.getElementById('cpf-cliente').value = '';
    document.getElementById('msg-cliente').textContent = '';
    document.getElementById('search-input').value = '';
    document.getElementById('filter-categoria').value = '';

    atualizarIndicadoresInterface();
    carregarDadosIniciais(); 
    
    mudarTela('vitrine'); 
}

// Helper para exibição de toasts
function mostrarToast(mensagem) {
    const toast = document.getElementById('toast');
    const msg = document.getElementById('toast-message');

    msg.textContent = mensagem;
    toast.classList.remove('translate-y-24', 'opacity-0');
    
    setTimeout(() => {
        toast.classList.add('translate-y-24', 'opacity-0');
    }, 3500);
}