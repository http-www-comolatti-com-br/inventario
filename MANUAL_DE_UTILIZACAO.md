
# Manual de Utilização - Sistema de Inventário de TI

Este manual detalha a dinâmica e as funcionalidades do Sistema de Inventário de TI, explicando os conceitos chave e o fluxo de trabalho para uma gestão eficiente dos seus ativos de tecnologia.

## 1. Conceitos Fundamentais

Para utilizar o sistema de forma eficaz, é crucial entender a diferença entre **Modelos**, **Unidades (Patrimônio)** e **Consumíveis**.

### 1.1. Modelos

O **Modelo** é o "molde" ou a "planta" de um item. Ele representa o *tipo* de equipamento ou consumível, mas não o item físico em si. Pense nele como uma entrada em um catálogo de produtos.

- **Exemplo:** Você compra 10 notebooks idênticos da marca Dell, modelo Latitude 5520. Você não cadastra 10 modelos. Você cadastra **um único modelo** chamado "Notebook Dell Latitude 5520".
- **O que cadastrar aqui?** Tudo que você pode vir a ter no seu inventário. Notebooks, mouses, teclados, monitores, cabos HDMI, toners de impressora, etc.

| Campo do Modelo | Descrição |
| :--- | :--- |
| **Tipo** | Define se o item é **Patrimônio** (contado individualmente) ou **Consumível** (contado em quantidade). |
| **Nome** | Nome descritivo do item. Ex: "Monitor Dell UltraSharp 24". |
| **Marca, Modelo** | Fabricante e modelo específico. Ex: "Dell", "U2421E". |
| **Especificações** | Detalhes técnicos relevantes. Ex: "i7, 16GB RAM, 512GB SSD". |

### 1.2. Unidades (Patrimônio)

A **Unidade** é o item físico, individual e rastreável. Ela só existe para modelos do tipo **Patrimônio**. Cada unidade é única e possui seu próprio ciclo de vida.

- **Exemplo:** Usando o exemplo anterior, após cadastrar o *modelo* "Notebook Dell Latitude 5520", você irá cadastrar **10 unidades** distintas, cada uma com seu próprio número de série e etiqueta patrimonial.
- **O que cadastrar aqui?** Cada notebook, monitor, desktop, ou qualquer outro item que precise de rastreamento individual.

| Campo da Unidade | Descrição |
| :--- | :--- |
| **Número de Série** | Identificador único de fábrica do equipamento. |
| **Etiqueta Patrimonial** | Seu código de identificação interno (ex: PAT-00123). |
| **Status** | Situação atual do item: **Disponível**, **Em Uso**, **Manutenção** ou **Baixado**. |
| **Destinatário** | A pessoa que está com o equipamento (se estiver "Em Uso". |
| **QR Code** | Gerado automaticamente, dá acesso a todo o histórico daquela unidade específica. |

### 1.3. Estoque (Consumíveis)

O **Estoque** é a forma de controlar itens do tipo **Consumível**. Diferente das unidades, os consumíveis não são rastreados individualmente, mas sim pela sua **quantidade**.

- **Exemplo:** Você compra 50 cabos HDMI. Você cadastra o *modelo* "Cabo HDMI 2m" e depois, através de uma movimentação de **Entrada**, adiciona 50 à quantidade em estoque.
- **O que controlar aqui?** Mouses e teclados simples (se não quiser rastrear individualmente), cabos, toners, pilhas, etc.

| Campo do Estoque | Descrição |
| :--- | :--- |
| **Quantidade Disponível** | O número de itens daquele modelo que você tem em estoque. |
| **Quantidade Mínima** | Define um limite para acionar um alerta de "Estoque Baixo" no dashboard. |
| **Local de Armazenagem** | Onde os itens estão guardados (ex: "Almoxarifado A"). |

**Resumo da Dinâmica:**

1.  **Primeiro, cadastre o Modelo:** (Ex: "Teclado sem fio Logitech MX Keys")
2.  **Depois, decida:**
    *   **É um item caro/importante que precisa de rastreio individual?** Marque o modelo como **Patrimônio**. Em seguida, vá para a tela de **Patrimônio** e cadastre cada teclado físico como uma **Unidade** nova.
    *   **É um item simples, de baixo custo, que só preciso saber quantos tenho?** Marque o modelo como **Consumível**. Em seguida, vá para a tela de **Movimentações**, faça uma **Entrada** e adicione a quantidade comprada ao **Estoque**.

---

## 2. Fluxo de Trabalho: Gerenciando o Ciclo de Vida de um Equipamento

Vamos simular o ciclo de vida completo de um notebook no sistema.

### Passo 1: Cadastrar o Modelo

- Vá para **Cadastros > Modelos**.
- Clique em "Novo Modelo".
- Preencha os dados:
    - **Tipo:** `Patrimônio`
    - **Nome:** `Notebook Lenovo ThinkPad T14`
    - **Marca:** `Lenovo`
    - **Modelo:** `ThinkPad T14 Gen 2`
    - **Especificações:** `i5, 16GB RAM, 512GB SSD`
- Salve.

### Passo 2: Registrar a Entrada da Unidade (Compra)

- Vá para **Patrimônio**.
- Clique em "Nova Unidade".
- Preencha os dados:
    - **Modelo:** Selecione `Notebook Lenovo ThinkPad T14`.
    - **Número de Série:** `SN-LENOVO-XYZ`
    - **Etiqueta Patrimonial:** `PAT-RH-055`
    - **Local:** `Almoxarifado TI`
- Salve. Neste momento, a unidade é criada com o status **Disponível**.

### Passo 3: Entregar o Equipamento a um Colaborador

- Vá para **Movimentações**.
- Clique no botão **Nova Entrega**.
- Preencha o formulário:
    - **Modelo/Item:** Selecione `Notebook Lenovo ThinkPad T14`.
    - **Unidade:** A unidade `SN-LENOVO-XYZ` aparecerá na lista (pois está disponível).
    - **Destinatário:** Selecione o colaborador (ex: `Ana Costa`).
    - **Observação:** `Notebook para uso no setor de RH`.
- Registre a entrega. O status da unidade `PAT-RH-055` muda automaticamente para **Em Uso**.

### Passo 4: Devolução ou Manutenção

- **Devolução:** Se Ana Costa devolver o notebook, vá em **Movimentações > Nova Devolução**. Selecione a unidade. O status voltará para **Disponível**.
- **Manutenção:** Se o notebook apresentar defeito, vá em **Movimentações > Nova Manutenção**. Selecione a unidade. O status mudará para **Manutenção**.

### Passo 5: Consultar o Histórico

- Vá para **Patrimônio**.
- Encontre o notebook `PAT-RH-055`.
- Clique no ícone de **Histórico** (prancheta). Um modal exibirá todas as movimentações (compra, entrega, devolução, etc.) que essa unidade já teve.
- Clique no ícone de **QR Code** para ver o código. Escaneie com um celular para ver as mesmas informações.

---

## 3. O Dashboard Melhorado

O novo dashboard foi redesenhado para oferecer uma visão mais clara e acionável do seu inventário.

- **Resumo Geral:** Cards principais mostram os totais de equipamentos, consumíveis e movimentações recentes.
- **Status dos Equipamentos:** Um gráfico de rosca central mostra a distribuição percentual dos seus equipamentos patrimoniais. Ao lado, cards detalhados para cada status (Disponíveis, Em Uso, etc.) mostram a quantidade, a porcentagem e uma breve descrição do que aquele status significa. **Clique em qualquer um desses cards para ser levado à lista de equipamentos com aquele status.**
- **Alertas de Estoque:** Uma seção de alerta aparecerá em destaque sempre que um item consumível atingir ou ficar abaixo da quantidade mínima definida.
- **Gráficos de Análise:**
    - **Equipamentos por Categoria:** Mostra quais categorias de patrimônio possuem mais itens.
    - **Ranking por Destinatário:** Mostra quais colaboradores possuem mais equipamentos em seu nome.
- **Movimentações Recentes:** Uma timeline visual mostra as últimas atividades no sistema, com ícones que facilitam a identificação do tipo de movimentação.
- **Ações Rápidas:** Botões para as operações mais comuns, como registrar uma nova entrada ou entrega.

Este manual deve esclarecer a lógica do sistema e facilitar sua utilização. Explore as telas e utilize os fluxos descritos para manter seu inventário de TI sempre organizado e atualizado.
