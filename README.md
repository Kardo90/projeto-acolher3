# Projeto Acolher • Gestão Social e Logística FEFO

Sistema web de gestão socioassistencial e controle logístico de alimentos desenvolvido para a **ASCISA / AD Utinga (Santo André)** como projeto acadêmico do **Projeto Integrador II (UNIVESP)**.

## 🚀 Funcionalidades Principais
- **Algoritmo FEFO (First Expired, First Out)**: Reordenação automática de lotes colocando itens com vencimento mais próximo no topo da fila de distribuição.
- **Quadro de Ação Imediata**: Alerta visual no Dashboard para lotes que vencem nos próximos 30 dias.
- **Montador Inteligente de Cestas Básicas**: Baixa automática no estoque consumindo rigorosamente os lotes pela fila FEFO a partir dos 11 itens essenciais.
- **Mapeamento de Famílias Beneficiárias**: Cadastro socioassistencial e controle de frequência em Utinga.
- **Entrada de Doações & Parceria VEC Santo André**: Registro de doações de cultos e cumprimento de prestação pecuniária da Vara de Execuções Penais.
- **Prestação de Contas**: Exportação de tabelas em CSV, backup em JSON e geração de termos formais.

## 🛠️ Tecnologias Utilizadas
- **Front-end**: HTML5 Semântico, Tailwind CSS, JavaScript (ES6+).
- **Persistência de Dados**: LocalStorage nativo do navegador com rotinas de exportação/importação.

## 💻 Como Executar
1. Clone este repositório: `git clone https://github.com/SEU_USUARIO/projeto-acolher.git`
2. Abra o arquivo `index.html` diretamente em qualquer navegador web moderno.