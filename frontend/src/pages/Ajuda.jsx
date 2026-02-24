import { useState } from 'react';
import {
  HiOutlineQuestionMarkCircle, HiOutlineCube, HiOutlineServer, HiOutlineClipboardList,
  HiOutlineSwitchHorizontal, HiOutlineViewGrid, HiOutlineChevronDown, HiOutlineChevronRight,
  HiOutlineLightBulb, HiOutlineCheckCircle, HiOutlineDesktopComputer, HiOutlineCog,
  HiOutlineXCircle, HiOutlineTag, HiOutlineUserGroup, HiOutlineQrcode
} from 'react-icons/hi';

function Section({ icon: Icon, title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-dark-600/30 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-cyber-cyan/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-cyber-cyan" />
        </div>
        <span className="text-lg font-semibold text-white flex-1">{title}</span>
        {open ? (
          <HiOutlineChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <HiOutlineChevronRight className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-5 pt-0 border-t border-dark-600/30">
          <div className="pt-4 text-gray-300 text-sm leading-relaxed space-y-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoTable({ headers, rows }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-dark-600/50 my-3">
      <table className="w-full text-sm">
        <thead className="bg-dark-800/80">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="text-left p-3 text-gray-400 font-semibold text-xs uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-dark-600/30">
              {row.map((cell, j) => (
                <td key={j} className={`p-3 ${j === 0 ? 'text-cyber-cyan font-medium' : 'text-gray-400'}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StepCard({ number, title, description }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-8 h-8 rounded-full bg-cyber-cyan/20 flex items-center justify-center flex-shrink-0 text-cyber-cyan font-bold text-sm">
        {number}
      </div>
      <div>
        <p className="text-white font-medium">{title}</p>
        <p className="text-gray-400 text-sm mt-0.5">{description}</p>
      </div>
    </div>
  );
}

export default function Ajuda() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="page-title text-3xl">Central de Ajuda</h1>
        <p className="text-gray-500 mt-1">Entenda como funciona o sistema de inventário de TI e tire suas dúvidas</p>
      </div>

      {/* Dica rápida */}
      <div className="glass-card p-5 border-l-4 border-cyber-cyan">
        <div className="flex items-start gap-3">
          <HiOutlineLightBulb className="w-6 h-6 text-cyber-cyan flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-white font-semibold">Dica Rápida</p>
            <p className="text-gray-400 text-sm mt-1">
              O sistema diferencia dois tipos de itens: <strong className="text-cyber-cyan">Patrimônio</strong> (equipamentos individuais rastreáveis, como notebooks e monitores) e <strong className="text-cyber-purple">Consumíveis</strong> (itens contados por quantidade, como cabos e toners). Entenda cada conceito nas seções abaixo.
            </p>
          </div>
        </div>
      </div>

      {/* Seções */}
      <div className="space-y-3">

        {/* CONCEITOS */}
        <Section icon={HiOutlineQuestionMarkCircle} title="Conceitos Fundamentais" defaultOpen={true}>
          <p>
            Para utilizar o sistema de forma eficaz, é crucial entender a diferença entre <strong className="text-white">Modelos</strong>, <strong className="text-white">Unidades (Patrimônio)</strong> e <strong className="text-white">Consumíveis</strong>.
          </p>

          <div className="p-4 rounded-xl bg-dark-800/60 border border-dark-600/50 my-4">
            <div className="flex items-center gap-2 mb-2">
              <HiOutlineCube className="w-5 h-5 text-cyber-cyan" />
              <h4 className="text-white font-semibold">O que é um Modelo?</h4>
            </div>
            <p>
              O <strong className="text-cyber-cyan">Modelo</strong> é o "molde" ou a "planta" de um item. Ele representa o <em>tipo</em> de equipamento ou consumível, mas não o item físico em si. Pense nele como uma entrada em um catálogo de produtos.
            </p>
            <p className="mt-2 text-gray-400">
              <strong className="text-white">Exemplo:</strong> Você compra 10 notebooks idênticos Dell Latitude 5520. Você não cadastra 10 modelos. Você cadastra <strong className="text-white">um único modelo</strong> chamado "Notebook Dell Latitude 5520".
            </p>
          </div>

          <div className="p-4 rounded-xl bg-dark-800/60 border border-dark-600/50 my-4">
            <div className="flex items-center gap-2 mb-2">
              <HiOutlineServer className="w-5 h-5 text-emerald-400" />
              <h4 className="text-white font-semibold">O que é uma Unidade (Patrimônio)?</h4>
            </div>
            <p>
              A <strong className="text-emerald-400">Unidade</strong> é o item físico, individual e rastreável. Ela só existe para modelos do tipo <strong>Patrimônio</strong>. Cada unidade é única e possui seu próprio ciclo de vida, número de série e etiqueta patrimonial.
            </p>
            <p className="mt-2 text-gray-400">
              <strong className="text-white">Exemplo:</strong> Após cadastrar o modelo "Notebook Dell Latitude 5520", você cadastra <strong className="text-white">10 unidades</strong> distintas, cada uma com seu próprio número de série.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-dark-800/60 border border-dark-600/50 my-4">
            <div className="flex items-center gap-2 mb-2">
              <HiOutlineClipboardList className="w-5 h-5 text-violet-400" />
              <h4 className="text-white font-semibold">O que é Estoque (Consumível)?</h4>
            </div>
            <p>
              O <strong className="text-violet-400">Estoque</strong> é a forma de controlar itens do tipo <strong>Consumível</strong>. Diferente das unidades, os consumíveis não são rastreados individualmente, mas sim pela sua <strong>quantidade</strong>.
            </p>
            <p className="mt-2 text-gray-400">
              <strong className="text-white">Exemplo:</strong> Você compra 50 cabos HDMI. Cadastra o modelo "Cabo HDMI 2m" e depois, através de uma movimentação de <strong>Entrada</strong>, adiciona 50 à quantidade em estoque.
            </p>
          </div>

          <InfoTable
            headers={['Conceito', 'O que é', 'Exemplo']}
            rows={[
              ['Modelo', 'O tipo/catálogo do item (cadastro único)', 'Notebook Dell Latitude 5520'],
              ['Unidade', 'O item físico individual (patrimônio)', 'SN: ABC123, Etiqueta: PAT-001'],
              ['Estoque', 'Quantidade de um item consumível', '50 cabos HDMI disponíveis'],
              ['Categoria', 'Agrupamento de modelos', 'Periféricos / Mouse'],
              ['Destinatário', 'Colaborador que recebe equipamentos', 'João Silva - Setor de TI'],
            ]}
          />
        </Section>

        {/* STATUS DOS EQUIPAMENTOS */}
        <Section icon={HiOutlineDesktopComputer} title="Status dos Equipamentos">
          <p>
            Cada unidade patrimonial possui um <strong className="text-white">status</strong> que indica sua situação atual. O status muda automaticamente conforme as movimentações são registradas.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-1">
                <HiOutlineCheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Disponível</span>
              </div>
              <p className="text-gray-400 text-xs">O equipamento está pronto para ser entregue a um colaborador. Ele não está com ninguém no momento.</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
              <div className="flex items-center gap-2 mb-1">
                <HiOutlineDesktopComputer className="w-5 h-5 text-blue-400" />
                <span className="text-blue-400 font-semibold">Em Uso</span>
              </div>
              <p className="text-gray-400 text-xs">O equipamento foi entregue a um colaborador e está sendo utilizado. O nome do destinatário aparece vinculado.</p>
            </div>
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-center gap-2 mb-1">
                <HiOutlineCog className="w-5 h-5 text-amber-400" />
                <span className="text-amber-400 font-semibold">Manutenção</span>
              </div>
              <p className="text-gray-400 text-xs">O equipamento está em reparo ou análise técnica. Não pode ser entregue até que seja devolvido ao status disponível.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <div className="flex items-center gap-2 mb-1">
                <HiOutlineXCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-semibold">Baixado</span>
              </div>
              <p className="text-gray-400 text-xs">O equipamento foi descartado, doado ou inutilizado. Ele permanece no histórico, mas não pode mais ser movimentado.</p>
            </div>
          </div>
        </Section>

        {/* MODELOS */}
        <Section icon={HiOutlineCube} title="Cadastro de Modelos">
          <p>
            O cadastro de modelos é o primeiro passo para organizar seu inventário. Aqui você define todos os tipos de equipamentos e consumíveis que a empresa utiliza.
          </p>
          <InfoTable
            headers={['Campo', 'Descrição', 'Exemplo']}
            rows={[
              ['Tipo', 'Patrimônio (individual) ou Consumível (quantidade)', 'Patrimônio'],
              ['Categoria', 'Classificação do item', 'Periféricos / Mouse'],
              ['Nome', 'Nome descritivo do item', 'Mouse Logitech MX Master 3'],
              ['Marca', 'Fabricante do item', 'Logitech'],
              ['Modelo', 'Modelo específico do fabricante', 'MX Master 3'],
              ['Part Number', 'Código do fabricante (opcional)', '910-005647'],
              ['Especificações', 'Detalhes técnicos relevantes', 'Sem fio, Bluetooth, USB-C'],
            ]}
          />
          <div className="p-3 rounded-xl bg-cyber-cyan/5 border border-cyber-cyan/20 mt-3">
            <p className="text-xs text-gray-400">
              <strong className="text-cyber-cyan">Dica:</strong> Ao escolher o tipo <strong>Patrimônio</strong>, você poderá cadastrar unidades individuais na tela de Patrimônio. Ao escolher <strong>Consumível</strong>, um registro de estoque será criado automaticamente.
            </p>
          </div>
        </Section>

        {/* CATEGORIAS */}
        <Section icon={HiOutlineTag} title="Categorias">
          <p>
            As categorias servem para organizar seus modelos em grupos lógicos. Cada categoria pode ter um nome e uma subcategoria.
          </p>
          <InfoTable
            headers={['Campo', 'Descrição', 'Exemplo']}
            rows={[
              ['Nome', 'Nome principal da categoria', 'Periféricos'],
              ['Subcategoria', 'Subdivisão da categoria (opcional)', 'Mouse'],
            ]}
          />
          <p>
            <strong className="text-white">Exemplos de organização:</strong> Periféricos/Mouse, Periféricos/Teclado, Notebooks, Monitores, Cabos/HDMI, Cabos/Rede, Impressão/Toner.
          </p>
        </Section>

        {/* PATRIMÔNIO */}
        <Section icon={HiOutlineServer} title="Patrimônio (Unidades)">
          <p>
            A tela de Patrimônio é onde você cadastra e gerencia cada equipamento individual. Cada unidade está vinculada a um modelo do tipo Patrimônio.
          </p>
          <InfoTable
            headers={['Campo', 'Descrição', 'Exemplo']}
            rows={[
              ['Modelo', 'O tipo de equipamento (selecionado da lista)', 'Notebook Dell Latitude 5520'],
              ['Número de Série', 'Identificador único de fábrica', 'SN-DELL-ABC123'],
              ['Etiqueta Patrimonial', 'Seu código de controle interno', 'PAT-TI-0055'],
              ['Local', 'Onde o equipamento está guardado', 'Almoxarifado TI - Sala 3'],
            ]}
          />
          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 mt-3">
            <p className="text-xs text-gray-400">
              <strong className="text-emerald-400">QR Code:</strong> Cada unidade cadastrada possui um QR Code gerado automaticamente. Ao escanear com o celular, você verá todas as informações do equipamento, incluindo status, destinatário e histórico.
            </p>
          </div>
        </Section>

        {/* CONSUMÍVEIS */}
        <Section icon={HiOutlineClipboardList} title="Consumíveis (Estoque)">
          <p>
            A tela de Consumíveis mostra o estoque de itens que são controlados por quantidade. Cada registro de estoque está vinculado a um modelo do tipo Consumível.
          </p>
          <InfoTable
            headers={['Campo', 'Descrição', 'Exemplo']}
            rows={[
              ['Quantidade Disponível', 'Número de itens em estoque', '45'],
              ['Quantidade Mínima', 'Limite para alerta de estoque baixo', '10'],
              ['Local de Armazenagem', 'Onde os itens estão guardados', 'Almoxarifado A - Prateleira 2'],
            ]}
          />
          <p>
            Quando a quantidade disponível ficar igual ou abaixo da quantidade mínima, um <strong className="text-amber-400">alerta</strong> aparecerá no Dashboard.
          </p>
        </Section>

        {/* DESTINATÁRIOS */}
        <Section icon={HiOutlineUserGroup} title="Destinatários">
          <p>
            Os destinatários são os colaboradores ou setores que recebem os equipamentos. Ao registrar uma entrega, você seleciona o destinatário que ficará responsável pelo item.
          </p>
          <InfoTable
            headers={['Campo', 'Descrição', 'Exemplo']}
            rows={[
              ['Nome Completo', 'Nome do colaborador', 'Ana Costa Silva'],
              ['Setor', 'Departamento do colaborador', 'Recursos Humanos'],
              ['Filial', 'Unidade/filial (se aplicável)', 'Matriz - São Paulo'],
            ]}
          />
        </Section>

        {/* MOVIMENTAÇÕES */}
        <Section icon={HiOutlineSwitchHorizontal} title="Movimentações">
          <p>
            As movimentações são o coração do sistema. Elas registram toda e qualquer ação realizada sobre um equipamento ou consumível, criando um histórico completo de auditoria.
          </p>

          <InfoTable
            headers={['Tipo', 'O que faz', 'Quando usar']}
            rows={[
              ['📥 Entrada', 'Adiciona itens ao estoque/patrimônio', 'Quando receber uma compra ou doação'],
              ['📦 Entrega', 'Entrega um equipamento a um destinatário', 'Quando um colaborador precisa de um item'],
              ['🔄 Devolução', 'Devolve um equipamento ao estoque', 'Quando o colaborador retorna o item'],
              ['🔀 Transferência', 'Transfere de um destinatário para outro', 'Quando o item muda de responsável'],
              ['🔧 Manutenção', 'Envia o equipamento para reparo', 'Quando o item apresenta defeito'],
              ['❌ Baixa', 'Remove o equipamento do inventário ativo', 'Quando o item é descartado ou inutilizado'],
            ]}
          />

          <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 mt-3">
            <p className="text-xs text-gray-400">
              <strong className="text-blue-400">Importante:</strong> As movimentações alteram automaticamente o status das unidades. Por exemplo, ao registrar uma "Entrega", o status da unidade muda de "Disponível" para "Em Uso" e o destinatário é vinculado.
            </p>
          </div>
        </Section>

        {/* FLUXO COMPLETO */}
        <Section icon={HiOutlineSwitchHorizontal} title="Fluxo de Trabalho Completo (Exemplo)">
          <p className="mb-4">
            Veja o passo a passo para cadastrar e gerenciar um notebook do início ao fim:
          </p>

          <div className="space-y-4">
            <StepCard
              number="1"
              title="Cadastrar a Categoria"
              description='Vá em Categorias e crie "Notebooks" (se ainda não existir).'
            />
            <StepCard
              number="2"
              title="Cadastrar o Modelo"
              description='Vá em Modelos, clique em "Novo Modelo", selecione tipo "Patrimônio", categoria "Notebooks" e preencha: "Notebook Lenovo ThinkPad T14".'
            />
            <StepCard
              number="3"
              title="Cadastrar a Unidade"
              description='Vá em Patrimônio, clique em "Nova Unidade", selecione o modelo criado e preencha o número de série e etiqueta patrimonial. A unidade será criada com status "Disponível".'
            />
            <StepCard
              number="4"
              title="Registrar a Entrega"
              description='Vá em Movimentações, clique em "Nova Entrega", selecione o modelo, a unidade e o destinatário. O status mudará para "Em Uso".'
            />
            <StepCard
              number="5"
              title="Consultar e Acompanhar"
              description='No Dashboard, acompanhe os totais. Em Patrimônio, veja o histórico e o QR Code de cada unidade. Em Consultas, busque por qualquer critério.'
            />
          </div>
        </Section>

        {/* QR CODE */}
        <Section icon={HiOutlineQrcode} title="QR Code dos Equipamentos">
          <p>
            Cada unidade patrimonial possui um <strong className="text-white">QR Code</strong> gerado automaticamente pelo sistema. Esse código contém todas as informações relevantes do equipamento.
          </p>
          <p className="mt-2">
            <strong className="text-white">Como usar:</strong> Na tela de Patrimônio, clique no ícone de QR Code ao lado de qualquer unidade. Um modal será exibido com o código e as informações do equipamento. Você pode imprimir o QR Code e colá-lo fisicamente no equipamento. Ao escanear com qualquer leitor de QR Code (câmera do celular), as informações do item serão exibidas.
          </p>
          <p className="mt-2">
            <strong className="text-white">Informações contidas no QR Code:</strong> Nome do item, marca, modelo, número de série, etiqueta patrimonial, status atual, categoria, destinatário e localização.
          </p>
        </Section>

        {/* DASHBOARD */}
        <Section icon={HiOutlineViewGrid} title="Entendendo o Dashboard">
          <p>
            O Dashboard é a tela inicial do sistema e oferece uma visão geral completa do seu inventário.
          </p>

          <InfoTable
            headers={['Seção', 'O que mostra']}
            rows={[
              ['Cards de Resumo', 'Total de equipamentos, consumíveis em estoque e movimentações dos últimos 30 dias'],
              ['Status dos Equipamentos', 'Gráfico de rosca + cards detalhados mostrando quantos itens estão Disponíveis, Em Uso, em Manutenção e Baixados'],
              ['Alerta de Estoque', 'Aviso quando consumíveis atingem o estoque mínimo (aparece apenas quando há alertas)'],
              ['Por Categoria', 'Gráfico de barras mostrando quais categorias possuem mais equipamentos'],
              ['Por Destinatário', 'Ranking dos colaboradores com mais equipamentos em posse'],
              ['Movimentações Recentes', 'Timeline das últimas atividades registradas no sistema'],
              ['Ações Rápidas', 'Botões de atalho para as operações mais comuns'],
            ]}
          />

          <div className="p-3 rounded-xl bg-cyber-cyan/5 border border-cyber-cyan/20 mt-3">
            <p className="text-xs text-gray-400">
              <strong className="text-cyber-cyan">Dica:</strong> Todos os cards e gráficos do Dashboard são clicáveis. Ao clicar em "Disponíveis", por exemplo, você será levado à lista de equipamentos com esse status.
            </p>
          </div>
        </Section>

      </div>
    </div>
  );
}
