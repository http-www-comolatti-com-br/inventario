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
                <span className="text-emerald-400 font-semibold">Disponível em Estoque</span>
              </div>
              <p className="text-gray-400 text-xs">O equipamento está pronto para ser entregue a um colaborador. Ele não está com ninguém no momento.</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
              <div className="flex items-center gap-2 mb-1">
                <HiOutlineDesktopComputer className="w-5 h-5 text-blue-400" />
                <span className="text-blue-400 font-semibold">Em Uso no Campo</span>
              </div>
              <p className="text-gray-400 text-xs">O equipamento foi entregue a um colaborador e está sendo utilizado. O nome do destinatário aparece vinculado.</p>
            </div>
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-center gap-2 mb-1">
                <HiOutlineCog className="w-5 h-5 text-amber-400" />
                <span className="text-amber-400 font-semibold">Manutenção</span>
              </div>
              <p className="text-gray-400 text-xs">O equipamento está em reparo ou análise técnica. Poderá ser resgatado quando consertado (Devolução/Entrega) ou ir para Descarte se perder utilidade.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <div className="flex items-center gap-2 mb-1">
                <HiOutlineXCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-semibold">Descartado</span>
              </div>
              <p className="text-gray-400 text-xs">O equipamento sofreu descarte, doação ou foi inutilizado. Ele permanece no histórico das movimentações para auditoria, mas some das contagens ativas da base.</p>
            </div>
          </div>
        </Section>

        {/* MODELOS E PADRONIZAÇÃO */}
        <Section icon={HiOutlineCube} title="Cadastro de Modelos">
          <p>
            O cadastro de modelos é o primeiro passo para organizar seu inventário. Aqui você define todos os tipos de equipamentos e consumíveis que a empresa utiliza. O sistema organiza tudo automaticamente de forma padronizada.
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
            ]}
          />
          <div className="p-3 rounded-xl bg-cyber-cyan/5 border border-cyber-cyan/20 mt-3">
            <p className="text-xs text-gray-400 mb-2">
              <strong className="text-cyber-cyan">Dica:</strong> Ao escolher o tipo <strong>Patrimônio</strong>, você poderá cadastrar unidades individuais na tela correspondente. Consumíveis geram estoque.
            </p>
            <p className="text-xs text-gray-400">
              <strong className="text-cyber-cyan">Auto-Formatação (Start Case):</strong> Não se preocupe em caprichar nas letras maiúsculas e minúsculas! O sistema automaticamente converte seus textos garantindo que fiquem profissionais (Ex: "teclado lg" vira "Teclado Lg"). Apenas códigos como "Número de Série" são mantidos em Caixa Alta pura.
            </p>
          </div>
        </Section>

        {/* CATEGORIAS */}
        <Section icon={HiOutlineTag} title="Categorias">
          <p>
            As categorias servem para organizar seus modelos em grupos lógicos. Todas seguem a auto-formatação.
          </p>
          <InfoTable
            headers={['Campo', 'Descrição', 'Exemplo']}
            rows={[
              ['Nome', 'Nome principal da categoria', 'Periféricos'],
              ['Subcategoria', 'Subdivisão da categoria (opcional)', 'Mouse'],
            ]}
          />
          <p>
            <strong className="text-white">Exemplos de organização:</strong> Periféricos/Mouse, Notebooks, Cabos/Rede, Impressão/Toner.
          </p>
        </Section>

        {/* PATRIMÔNIO */}
        <Section icon={HiOutlineServer} title="Patrimônio (Unidades)">
          <p>
            A tela de Patrimônio gerencia cada equipamento individual da Base. Você pode listar e pesquisar todo o volume.
          </p>
          <InfoTable
            headers={['Campo', 'Descrição', 'Exemplo']}
            rows={[
              ['Modelo', 'O tipo de equipamento (selecionado da lista)', 'Notebook Dell Latitude 5520'],
              ['Número de Série', 'Identificador único de fábrica (Sempre CAIXA ALTA)', 'SN-DELL-ABC123'],
              ['Etiqueta Patrimonial', 'Seu código de controle interno (Sempre CAIXA ALTA)', 'PAT-TI-0055'],
              ['Local', 'Onde o equipamento está guardado', 'Almoxarifado TI - Sala 3'],
            ]}
          />
          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 mt-3">
            <p className="text-xs text-gray-400">
              <strong className="text-emerald-400">QR Code:</strong> Cada unidade cadastrada possui um QR Code auto-gerado. Escaneie para obter acesso imediato ao inventário do item!
            </p>
          </div>
        </Section>

        {/* CONSUMÍVEIS */}
        <Section icon={HiOutlineClipboardList} title="Consumíveis (Estoque)">
          <p>
            Consumíveis são controlados por lote. Tudo em um só lugar.
          </p>
          <InfoTable
            headers={['Campo', 'Descrição', 'Exemplo']}
            rows={[
              ['Quantidade Disponível', 'Número de itens em estoque', '45'],
              ['Quantidade Mínima', 'Limite para alerta de vulnerabilidade', '10'],
              ['Local', 'Onde os itens estão fisicamente localizados', 'Almoxarifado A'],
            ]}
          />
        </Section>

        {/* MOVIMENTAÇÕES E AÇÃO RÁPIDA */}
        <Section icon={HiOutlineSwitchHorizontal} title="Ação Rápida (Movimentações)">
          <p>
            Graças ao sistema de Inteligência de Ação Rápida, você não precisa ficar navegando por várias abas para mover um item. O botão azul na parte inferior das telas engatilha a <strong>Ação Rápida Universal</strong>!
          </p>

          <InfoTable
            headers={['Ação Universal', 'Comportamento da IA do Modal', 'Quando usar']}
            rows={[
              ['📥 Entrada', 'Verifica itens "Entregues" ou novos para adicionar estoque/base', 'Criar itens do zero ou receber insumos'],
              ['📦 Entrega', 'Filtra os disponíveis para que escolha um Destinatário', 'Equipar colaborador com patrimônimo'],
              ['🔄 Devolução', 'Localiza itens em Uso e devolve automaticamente para Estoque', 'Funcionário de saída, resgate em manutenção'],
              ['🔀 Transferência', 'Filtra itens em Uso e troca os destinatários', 'Repasses sem voltar ao estoque'],
              ['🔧 Manutenção', 'Exige motivo e retira o item da contagem Disponível', 'Equipamento ou Peça com avarias técnicas'],
              ['🗑️ Descarte', 'Executa uma "Baixa" e retira perpetuamente de circulação', 'Quando o insumo/patrimônio não tem mais conserto'],
            ]}
          />

          <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 mt-3">
            <p className="text-xs text-gray-400">
              <strong className="text-blue-400">Ação Rápida Inteligente:</strong> Ao selecionar a intenção no botão Ação Rápida, o próprio sistema oculta opções de Patrimônios que não fazem sentido (ex: não dá pra Devolver um Notebook que já está no Estoque). Basta se preocupar em selecionar!
            </p>
          </div>
        </Section>

        {/* DASHBOARD */}
        <Section icon={HiOutlineViewGrid} title="A Torre de Controle (Dashboard)">
          <p>
            A página "Início" agora opera como uma verdadeira Torre de Controle Total do inventário. Todo dado que você vê pode levar a um filtro profundo.
          </p>

          <InfoTable
            headers={['Gráfico/Módulo', 'Interatividade']}
            rows={[
              ['Residência Geral', 'Os cards do topo exibem volume consolidado e status rápidos'],
              ['Balanço Patrimonial (Rosca)', 'Cada fatia (Verde, Vermelha, Amarela) é um "botão grande". Clique no Anel Verde para ver TUDO que tem disponível.'],
              ['Distribuição de Patrimônio', 'Demonstra as famílias mais populosas do projeto, mas ignora Sucatas (Itens descartados) e agrupado pela categoria mãe.'],
              ['Por Destinatário', 'Ranking de uso entre usuários de quem tem mais insumos/unidades'],
              ['Consumíveis Críticos', 'Central de pânico na direita: Tudo com pouca quantidade fica em vermelho exigindo re-compra.'],
            ]}
          />
        </Section>

      </div>
    </div>
  );
}
