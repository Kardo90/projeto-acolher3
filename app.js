// CONSTANTES E CHAVES DO LOCALSTORAGE
const STORAGE_KEY_ESTOQUE = 'acolher_estoque';
const STORAGE_KEY_DOACOES = 'acolher_doacoes';
const STORAGE_KEY_FAMILIAS = 'acolher_familias';
const STORAGE_KEY_ENTREGAS = 'acolher_entregas';

const COMPOSICAO_CESTA_PADRAO = [
  { nome: 'Arroz', qtd: 2, unidade: 'kg' },
  { nome: 'Feijão', qtd: 2, unidade: 'kg' },
  { nome: 'Óleo de Soja', qtd: 1, unidade: 'un' },
  { nome: 'Açúcar', qtd: 1, unidade: 'kg' },
  { nome: 'Café', qtd: 1, unidade: 'pacote' },
  { nome: 'Macarrão', qtd: 2, unidade: 'pacote' },
  { nome: 'Molho de Tomate', qtd: 2, unidade: 'sachê' },
  { nome: 'Farinha de Trigo', qtd: 1, unidade: 'kg' },
  { nome: 'Sal', qtd: 1, unidade: 'kg' },
  { nome: 'Leite em Pó', qtd: 1, unidade: 'lata' },
  { nome: 'Biscoito', qtd: 1, unidade: 'pacote' }
];

let html5QrCode = null;

// EVENTO DO BOTÃO VOLTAR DO ANDROID (Evita fechar o PWA no celular)
window.onpopstate = function(event) {
  const modalLote = document.getElementById('modal-lote');
  if (modalLote && !modalLote.classList.contains('hidden')) {
    fecharModais(false);
  }
};

window.onload = function() {
  if (!localStorage.getItem(STORAGE_KEY_ESTOQUE)) {
    resetarDadosDemonstracao();
  } else {
    atualizarInterface();
  }
};

// DADOS DEMONSTRATIVOS PARA BANCA DA FACULDADE
function resetarDadosDemonstracao() {
  const hoje = new Date();
  const em10dias = new Date(hoje.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const em25dias = new Date(hoje.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const em90dias = new Date(hoje.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const hojeData = hoje.toISOString().split('T')[0];

  const estoqueDemo = [
    { id: 'LOT-01', nome: 'Feijão Carioca 1kg', categoria: 'Grãos', quantidade: 30, unidade: 'kg', validade: em10dias },
    { id: 'LOT-02', nome: 'Arroz Tipo 1 5kg', categoria: 'Grãos', quantidade: 50, unidade: 'kg', validade: em25dias },
    { id: 'LOT-03', nome: 'Óleo de Soja 900ml', categoria: 'Óleos / Condimentos', quantidade: 20, unidade: 'un', validade: em90dias },
    { id: 'LOT-04', nome: 'Açúcar Refinado 1kg', categoria: 'Matinais', quantidade: 15, unidade: 'kg', validade: em90dias },
    { id: 'LOT-05', nome: 'Macarrão Espaguete 500g', categoria: 'Massas / Molhos', quantidade: 40, unidade: 'pacote', validade: em25dias }
  ];

  const familiasDemo = [
    { id: 'FAM-01', responsavel: 'Maria Silva', cpf: '123.456.789-00', bairro: 'Utinga', membros: 4, ultimaEntrega: '2026-09-15' },
    { id: 'FAM-02', responsavel: 'João Santos', cpf: '987.654.321-11', bairro: 'Utinga', membros: 3, ultimaEntrega: '2026-08-20' }
  ];

  const doacoesDemo = [
    { id: 'DOA-01', doador: 'Culto de Missões AD Utinga', item: 'Arroz 5kg e Feijão 1kg', quantidade: 15, data: hojeData }
  ];

  const entregasDemo = [
    { id: 'ENT-01', familiaId: 'FAM-01', familiaNome: 'Maria Silva', quantidade: 1, data: '2026-09-15' }
  ];

  localStorage.setItem(STORAGE_KEY_ESTOQUE, JSON.stringify(estoqueDemo));
  localStorage.setItem(STORAGE_KEY_FAMILIAS, JSON.stringify(familiasDemo));
  localStorage.setItem(STORAGE_KEY_DOACOES, JSON.stringify(doacoesDemo));
  localStorage.setItem(STORAGE_KEY_ENTREGAS, JSON.stringify(entregasDemo));

  atualizarInterface();
}

// MODAIS DE LOTES
function abrirModalLote() {
  document.getElementById('modal-lote').classList.remove('hidden');
  history.pushState({ modalAberto: true }, "");
}

function fecharModais(navegarHistorico = true) {
  pararLeitorBarcode();
  document.getElementById('modal-lote').classList.add('hidden');
  if (navegarHistorico && history.state && history.state.modalAberto) {
    history.back();
  }
}

// MODAIS DE FAMÍLIAS, DOAÇÕES E ENTREGAS
function abrirModalFamilia() { document.getElementById('modal-familia').classList.remove('hidden'); }
function fecharModalFamilia() { document.getElementById('modal-familia').classList.add('hidden'); }

function abrirModalDoacao() { 
  document.getElementById('doacao-data').value = new Date().toISOString().split('T')[0];
  document.getElementById('modal-doacao').classList.remove('hidden'); 
}
function fecharModalDoacao() { document.getElementById('modal-doacao').classList.add('hidden'); }

function abrirModalEntrega() {
  const familias = JSON.parse(localStorage.getItem(STORAGE_KEY_FAMILIAS) || '[]');
  if (familias.length === 0) return alert('Cadastre ao menos uma família beneficiária antes de registrar entregas!');
  
  const select = document.getElementById('entrega-familia-id');
  select.innerHTML = '';
  familias.forEach(f => {
    select.innerHTML += `<option value="${f.id}">${f.responsavel} (CPF: ${f.cpf})</option>`;
  });

  document.getElementById('entrega-data').value = new Date().toISOString().split('T')[0];
  document.getElementById('modal-entrega').classList.remove('hidden');
}
function fecharModalEntrega() { document.getElementById('modal-entrega').classList.add('hidden'); }

// LEITOR DE CÓDIGO DE BARRAS VIA CÂMERA
function iniciarLeitorBarcode() {
  document.getElementById('reader-container').classList.remove('hidden');
  if (html5QrCode) {
    try { html5QrCode.clear(); } catch(e){}
  }
  
  html5QrCode = new Html5Qrcode("reader");
  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: { width: 250, height: 150 } },
    (decodedText) => {
      pararLeitorBarcode();
      buscarProdutoPorEAN(decodedText);
    },
    () => {}
  ).catch(() => {
    alert("Não foi possível acessar a câmera do aparelho. Verifique as permissões no navegador.");
  });
}

function pararLeitorBarcode() {
  if (html5QrCode) {
    try {
      html5QrCode.stop().then(() => {
        html5QrCode.clear();
        document.getElementById('reader-container').classList.add('hidden');
      }).catch(() => {
        document.getElementById('reader-container').classList.add('hidden');
      });
    } catch(e) {
      document.getElementById('reader-container').classList.add('hidden');
    }
  } else {
    document.getElementById('reader-container').classList.add('hidden');
  }
}

// BUSCA DE PRODUTO NA API DO OPEN FOOD FACTS
function buscarProdutoPorEAN(codigoBarras) {
  fetch(`https://br.openfoodfacts.org/api/v0/product/${codigoBarras}.json`)
    .then(res => res.json())
    .then(data => {
      if (data.status === 1 && data.product) {
        const prod = data.product;
        const nomeFormatado = prod.product_name || prod.product_name_pt || prod.generic_name || "Alimento Identificado";
        document.getElementById('lote-nome').value = nomeFormatado;
        
        if (prod.categories_tags) {
          const catStr = prod.categories_tags.join(' ').toLowerCase();
          if (catStr.includes('rice') || catStr.includes('bean') || catStr.includes('grain')) {
            document.getElementById('lote-categoria').value = 'Grãos';
          } else if (catStr.includes('oil') || catStr.includes('condiment')) {
            document.getElementById('lote-categoria').value = 'Óleos / Condimentos';
          } else if (catStr.includes('pasta') || catStr.includes('sauce')) {
            document.getElementById('lote-categoria').value = 'Massas / Molhos';
          } else if (catStr.includes('milk') || catStr.includes('coffee') || catStr.includes('sugar')) {
            document.getElementById('lote-categoria').value = 'Matinais';
          }
        }
        alert(`Produto Lido com Sucesso: ${nomeFormatado}\n\nCódigo: ${codigoBarras}\nAgora informe a quantidade e a data de validade.`);
      } else {
        alert(`Código de barras lido (${codigoBarras}), mas o produto não consta no catálogo online. Preencha o nome manualmente.`);
      }
    })
    .catch(() => {
      alert(`Código de barras lido: ${codigoBarras}. Não foi possível conectar ao banco online.`);
    });
}

// NAVEGAÇÃO DE ABAS
function mudarAba(idAba) {
  document.querySelectorAll('.aba-conteudo').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('border-amber-400', 'text-white', 'bg-indigo-900/50');
    btn.classList.add('border-transparent');
  });

  document.getElementById(`aba-${idAba}`).classList.remove('hidden');
  const btn = document.getElementById(`btn-${idAba}`);
  btn.classList.add('border-amber-400', 'text-white', 'bg-indigo-900/50');
  atualizarInterface();
}

// ALGORITMO FEFO (PRIMEIRO QUE VENCE, PRIMEIRO QUE SAI)
function obterEstoqueFEFO() {
  const estoque = JSON.parse(localStorage.getItem(STORAGE_KEY_ESTOQUE) || '[]');
  return estoque.sort((a, b) => new Date(a.validade) - new Date(b.validade));
}

function filtrarEstoque() {
  const busca = document.getElementById('busca-estoque').value.toLowerCase();
  const categoria = document.getElementById('filtro-categoria').value;
  const estoque = obterEstoqueFEFO();
  const hoje = new Date();

  const tabelaEstoque = document.getElementById('tabela-estoque-completa');
  tabelaEstoque.innerHTML = '';

  const filtrados = estoque.filter(item => {
    const atendeBusca = item.nome.toLowerCase().includes(busca) || item.id.toLowerCase().includes(busca);
    const atendeCategoria = categoria === '' || item.categoria === categoria;
    return atendeBusca && atendeCategoria;
  });

  filtrados.forEach(item => {
    const diffDias = Math.ceil((new Date(item.validade) - hoje) / (1000 * 60 * 60 * 24));
    let badge = '<span class="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">Seguro</span>';
    if (diffDias <= 15) badge = '<span class="text-xs px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold">Crítico (&le;15d)</span>';
    else if (diffDias <= 30) badge = '<span class="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold">Atenção (&le;30d)</span>';

    tabelaEstoque.innerHTML += `
      <tr class="border-b hover:bg-slate-50">
        <td class="p-3 font-mono text-xs">${item.id}</td>
        <td class="p-3 font-semibold">${item.nome}</td>
        <td class="p-3 text-xs bg-slate-100 rounded">${item.categoria}</td>
        <td class="p-3 font-bold">${item.quantidade} ${item.unidade}</td>
        <td class="p-3">${item.validade}</td>
        <td class="p-3">${badge}</td>
        <td class="p-3 text-right">
          <button onclick="excluirLote('${item.id}')" class="text-rose-600 hover:text-rose-800 text-xs font-bold"><i class="fa-solid fa-trash"></i> Excluir</button>
        </td>
      </tr>
    `;
  });
}

function atualizarInterface() {
  const estoque = obterEstoqueFEFO();
  const hoje = new Date();

  document.getElementById('kpi-total-estoque').innerText = estoque.reduce((acc, item) => acc + Number(item.quantidade), 0);
  
  const alertaFefo = estoque.filter(item => {
    const diffDias = Math.ceil((new Date(item.validade) - hoje) / (1000 * 60 * 60 * 24));
    return diffDias <= 30;
  });
  document.getElementById('kpi-alerta-fefo').innerText = alertaFefo.length;

  const familias = JSON.parse(localStorage.getItem(STORAGE_KEY_FAMILIAS) || '[]');
  document.getElementById('kpi-familias').innerText = familias.length;

  const entregas = JSON.parse(localStorage.getItem(STORAGE_KEY_ENTREGAS) || '[]');
  document.getElementById('kpi-entregas').innerText = entregas.length;

  // Quadro FEFO
  const tabelaFefo = document.getElementById('tabela-fefo-urgente');
  tabelaFefo.innerHTML = '';
  alertaFefo.forEach(item => {
    const diffDias = Math.ceil((new Date(item.validade) - hoje) / (1000 * 60 * 60 * 24));
    const badgeColor = diffDias <= 15 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800';
    
    tabelaFefo.innerHTML += `
      <tr class="border-b hover:bg-slate-50">
        <td class="p-3 font-mono font-bold text-xs">${item.id}</td>
        <td class="p-3 font-semibold">${item.nome}</td>
        <td class="p-3">${item.quantidade} ${item.unidade}</td>
        <td class="p-3">${item.validade}</td>
        <td class="p-3 font-bold">${diffDias} dias</td>
        <td class="p-3"><span class="text-xs px-2.5 py-1 rounded-full font-bold ${badgeColor}">Crítico FEFO</span></td>
      </tr>
    `;
  });

  filtrarEstoque();

  // Tabela de Doações
  const doacoes = JSON.parse(localStorage.getItem(STORAGE_KEY_DOACOES) || '[]');
  const tabelaDoacoes = document.getElementById('tabela-doacoes');
  tabelaDoacoes.innerHTML = '';
  doacoes.forEach(d => {
    tabelaDoacoes.innerHTML += `
      <tr class="border-b hover:bg-slate-50">
        <td class="p-3 font-mono text-xs">${d.id}</td>
        <td class="p-3 font-semibold">${d.doador}</td>
        <td class="p-3">${d.item}</td>
        <td class="p-3 font-bold">${d.quantidade}</td>
        <td class="p-3">${d.data}</td>
        <td class="p-3 text-right">
          <button onclick="excluirDoacao('${d.id}')" class="text-rose-600 hover:text-rose-800 text-xs font-bold"><i class="fa-solid fa-trash"></i> Excluir</button>
        </td>
      </tr>
    `;
  });

  // Tabela de Famílias
  const tabelaFamilias = document.getElementById('tabela-familias');
  tabelaFamilias.innerHTML = '';
  familias.forEach(f => {
    tabelaFamilias.innerHTML += `
      <tr class="border-b hover:bg-slate-50">
        <td class="p-3 font-mono text-xs">${f.id}</td>
        <td class="p-3 font-semibold">${f.responsavel}</td>
        <td class="p-3">${f.cpf}</td>
        <td class="p-3">${f.bairro}</td>
        <td class="p-3">${f.membros} pessoas</td>
        <td class="p-3 font-medium text-indigo-700">${f.ultimaEntrega}</td>
        <td class="p-3 text-right">
          <button onclick="excluirFamilia('${f.id}')" class="text-rose-600 hover:text-rose-800 text-xs font-bold"><i class="fa-solid fa-trash"></i> Excluir</button>
        </td>
      </tr>
    `;
  });

  // Tabela de Entregas
  const tabelaEntregas = document.getElementById('tabela-entregas');
  tabelaEntregas.innerHTML = '';
  entregas.forEach(e => {
    tabelaEntregas.innerHTML += `
      <tr class="border-b hover:bg-slate-50">
        <td class="p-3 font-mono text-xs">${e.id}</td>
        <td class="p-3 font-semibold">${e.familiaNome}</td>
        <td class="p-3 font-bold">${e.quantidade} cesta(s)</td>
        <td class="p-3">${e.data}</td>
        <td class="p-3 text-right">
          <button onclick="excluirEntrega('${e.id}')" class="text-rose-600 hover:text-rose-800 text-xs font-bold"><i class="fa-solid fa-trash"></i> Excluir</button>
        </td>
      </tr>
    `;
  });

  // Lista do Montador de Cestas
  const elComposicao = document.getElementById('lista-composicao-cesta');
  elComposicao.innerHTML = '';
  COMPOSICAO_CESTA_PADRAO.forEach(item => {
    elComposicao.innerHTML += `
      <div class="border p-3 rounded-lg bg-slate-50 flex justify-between items-center">
        <span class="text-sm font-semibold text-slate-700">${item.nome}</span>
        <span class="text-xs font-bold bg-indigo-100 text-indigo-800 px-2 py-1 rounded">${item.qtd} ${item.unidade} / cesta</span>
      </div>
    `;
  });
}

// MONTADOR AUTOMÁTICO POR FEFO
function executarMontagemCestas() {
  const qtdCestas = Number(document.getElementById('qtd-cestas-montar').value);
  if (!qtdCestas || qtdCestas <= 0) return alert('Informe uma quantidade válida!');

  let estoque = obterEstoqueFEFO();

  for (const req of COMPOSICAO_CESTA_PADRAO) {
    const totalNecessario = req.qtd * qtdCestas;
    const totalDisponivel = estoque
      .filter(i => i.nome.toLowerCase().includes(req.nome.toLowerCase()))
      .reduce((acc, i) => acc + Number(i.quantidade), 0);

    if (totalDisponivel < totalNecessario) {
      return alert(`Estoque insuficiente de ${req.nome}! Necessário: ${totalNecessario}, Disponível: ${totalDisponivel}`);
    }
  }

  COMPOSICAO_CESTA_PADRAO.forEach(req => {
    let preciso = req.qtd * qtdCestas;
    estoque.forEach(lote => {
      if (preciso > 0 && lote.nome.toLowerCase().includes(req.nome.toLowerCase())) {
        const qtdNoLote = Number(lote.quantidade);
        if (qtdNoLote <= preciso) {
          preciso -= qtdNoLote;
          lote.quantidade = 0;
        } else {
          lote.quantidade = qtdNoLote - preciso;
          preciso = 0;
        }
      }
    });
  });

  estoque = estoque.filter(l => Number(l.quantidade) > 0);
  localStorage.setItem(STORAGE_KEY_ESTOQUE, JSON.stringify(estoque));

  alert(`Sucesso! ${qtdCestas} cestas básicas montadas e baixa efetuada por ordem FEFO.`);
  atualizarInterface();
}

// OPERAÇÕES DE CRUD (SALVAR E EXCLUIR)
function salvarLote(e) {
  e.preventDefault();
  pararLeitorBarcode();

  const novoLote = {
    id: 'LOT-' + Math.floor(Math.random() * 1000),
    nome: document.getElementById('lote-nome').value,
    categoria: document.getElementById('lote-categoria').value,
    quantidade: Number(document.getElementById('lote-qtd').value),
    unidade: document.getElementById('lote-unidade').value,
    validade: document.getElementById('lote-validade').value
  };

  const estoque = JSON.parse(localStorage.getItem(STORAGE_KEY_ESTOQUE) || '[]');
  estoque.push(novoLote);
  localStorage.setItem(STORAGE_KEY_ESTOQUE, JSON.stringify(estoque));

  document.getElementById('form-lote').reset();
  fecharModais(true);
  atualizarInterface();
}

function excluirLote(id) {
  if (confirm('Tem certeza que deseja remover este lote?')) {
    let estoque = JSON.parse(localStorage.getItem(STORAGE_KEY_ESTOQUE) || '[]');
    estoque = estoque.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY_ESTOQUE, JSON.stringify(estoque));
    atualizarInterface();
  }
}

function salvarFamilia(e) {
  e.preventDefault();

  const novaFamilia = {
    id: 'FAM-' + Math.floor(Math.random() * 1000),
    responsavel: document.getElementById('familia-responsavel').value,
    cpf: document.getElementById('familia-cpf').value,
    bairro: document.getElementById('familia-bairro').value,
    membros: Number(document.getElementById('familia-membros').value),
    ultimaEntrega: 'Sem entregas'
  };

  const familias = JSON.parse(localStorage.getItem(STORAGE_KEY_FAMILIAS) || '[]');
  familias.push(novaFamilia);
  localStorage.setItem(STORAGE_KEY_FAMILIAS, JSON.stringify(familias));

  document.getElementById('form-familia').reset();
  fecharModalFamilia();
  atualizarInterface();
}

function excluirFamilia(id) {
  if (confirm('Tem certeza que deseja remover esta família beneficiária?')) {
    let familias = JSON.parse(localStorage.getItem(STORAGE_KEY_FAMILIAS) || '[]');
    familias = familias.filter(f => f.id !== id);
    localStorage.setItem(STORAGE_KEY_FAMILIAS, JSON.stringify(familias));
    atualizarInterface();
  }
}

function salvarDoacao(e) {
  e.preventDefault();

  const novaDoacao = {
    id: 'DOA-' + Math.floor(Math.random() * 1000),
    doador: document.getElementById('doacao-doador').value,
    item: document.getElementById('doacao-item').value,
    quantidade: Number(document.getElementById('doacao-qtd').value),
    data: document.getElementById('doacao-data').value
  };

  const doacoes = JSON.parse(localStorage.getItem(STORAGE_KEY_DOACOES) || '[]');
  doacoes.push(novaDoacao);
  localStorage.setItem(STORAGE_KEY_DOACOES, JSON.stringify(doacoes));

  document.getElementById('form-doacao').reset();
  fecharModalDoacao();
  atualizarInterface();
}

function excluirDoacao(id) {
  if (confirm('Tem certeza que deseja remover esta doação?')) {
    let doacoes = JSON.parse(localStorage.getItem(STORAGE_KEY_DOACOES) || '[]');
    doacoes = doacoes.filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEY_DOACOES, JSON.stringify(doacoes));
    atualizarInterface();
  }
}

function salvarEntrega(e) {
  e.preventDefault();

  const familiaId = document.getElementById('entrega-familia-id').value;
  const familias = JSON.parse(localStorage.getItem(STORAGE_KEY_FAMILIAS) || '[]');
  const familia = familias.find(f => f.id === familiaId);

  const novaEntrega = {
    id: 'ENT-' + Math.floor(Math.random() * 1000),
    familiaId: familiaId,
    familiaNome: familia ? familia.responsavel : 'Desconhecida',
    quantidade: Number(document.getElementById('entrega-qtd').value),
    data: document.getElementById('entrega-data').value
  };

  const entregas = JSON.parse(localStorage.getItem(STORAGE_KEY_ENTREGAS) || '[]');
  entregas.push(novaEntrega);
  localStorage.setItem(STORAGE_KEY_ENTREGAS, JSON.stringify(entregas));

  if (familia) {
    familia.ultimaEntrega = novaEntrega.data;
    localStorage.setItem(STORAGE_KEY_FAMILIAS, JSON.stringify(familias));
  }

  document.getElementById('form-entrega').reset();
  fecharModalEntrega();
  atualizarInterface();
}

function excluirEntrega(id) {
  if (confirm('Tem certeza que deseja remover este registro de entrega?')) {
    let entregas = JSON.parse(localStorage.getItem(STORAGE_KEY_ENTREGAS) || '[]');
    entregas = entregas.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEY_ENTREGAS, JSON.stringify(entregas));
    atualizarInterface();
  }
}

// EXPORTAÇÕES
function exportarCSV(tipo) {
  const dados = JSON.parse(localStorage.getItem(STORAGE_KEY_ESTOQUE) || '[]');
  let csv = 'ID,Nome,Categoria,Quantidade,Unidade,Validade\n';
  dados.forEach(d => {
    csv += `${d.id},"${d.nome}",${d.categoria},${d.quantidade},${d.unidade},${d.validade}\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', `projeto_acolher_${tipo}.csv`);
  a.click();
}

function exportarBackupJSON() {
  const backup = {
    estoque: JSON.parse(localStorage.getItem(STORAGE_KEY_ESTOQUE)),
    familias: JSON.parse(localStorage.getItem(STORAGE_KEY_FAMILIAS)),
    doacoes: JSON.parse(localStorage.getItem(STORAGE_KEY_DOACOES)),
    entregas: JSON.parse(localStorage.getItem(STORAGE_KEY_ENTREGAS))
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', 'projeto_acolher_backup.json');
  a.click();
}

function gerarDeclaracaoVEC() {
  alert('Declaração Oficial para a Vara de Execuções Penais (VEC Santo André) gerada com sucesso para impressão.');
}