-- Schema do sistema de controle de estoque de TI

-- Tabela de usuários do sistema
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome_completo VARCHAR(255) NOT NULL,
  login VARCHAR(100) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  perfil VARCHAR(20) NOT NULL CHECK (perfil IN ('admin', 'comum')),
  ativo BOOLEAN DEFAULT TRUE,
  setor VARCHAR(100),
  filial VARCHAR(100),
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de destinatários (quem recebe equipamentos)
CREATE TABLE IF NOT EXISTS destinatarios (
  id SERIAL PRIMARY KEY,
  nome_completo VARCHAR(255) NOT NULL,
  setor VARCHAR(100),
  filial VARCHAR(100),
  ativo BOOLEAN DEFAULT TRUE,
  observacoes TEXT,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de categorias
CREATE TABLE IF NOT EXISTS categorias (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  subcategoria VARCHAR(100),
  criado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de modelos de itens
CREATE TABLE IF NOT EXISTS modelos (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('consumivel', 'patrimonio')),
  categoria_id INTEGER REFERENCES categorias(id),
  nome VARCHAR(255) NOT NULL,
  marca VARCHAR(100),
  modelo VARCHAR(100),
  part_number VARCHAR(100),
  especificacoes TEXT,
  observacoes TEXT,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de estoque (consumíveis)
CREATE TABLE IF NOT EXISTS estoque (
  id SERIAL PRIMARY KEY,
  modelo_id INTEGER REFERENCES modelos(id) NOT NULL,
  quantidade_disponivel INTEGER NOT NULL DEFAULT 0 CHECK (quantidade_disponivel >= 0),
  quantidade_minima INTEGER DEFAULT 0,
  local_armazenagem VARCHAR(255),
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de unidades (patrimônio)
CREATE TABLE IF NOT EXISTS unidades (
  id SERIAL PRIMARY KEY,
  modelo_id INTEGER REFERENCES modelos(id) NOT NULL,
  numero_serie VARCHAR(255),
  etiqueta_patrimonial VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'em_uso', 'manutencao', 'baixado')),
  destinatario_id INTEGER REFERENCES destinatarios(id),
  local VARCHAR(255),
  observacoes TEXT,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de movimentações (auditoria)
CREATE TABLE IF NOT EXISTS movimentacoes (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('entrada', 'entrega', 'devolucao', 'transferencia', 'manutencao', 'baixa')),
  modelo_id INTEGER REFERENCES modelos(id),
  unidade_id INTEGER REFERENCES unidades(id),
  estoque_id INTEGER REFERENCES estoque(id),
  quantidade INTEGER,
  destinatario_id INTEGER REFERENCES destinatarios(id),
  destinatario_origem_id INTEGER REFERENCES destinatarios(id),
  usuario_id INTEGER REFERENCES usuarios(id) NOT NULL,
  observacao TEXT,
  cancelado BOOLEAN DEFAULT FALSE,
  motivo_cancelamento TEXT,
  criado_em TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_movimentacoes_modelo ON movimentacoes(modelo_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_unidade ON movimentacoes(unidade_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_destinatario ON movimentacoes(destinatario_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_tipo ON movimentacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_unidades_status ON unidades(status);
CREATE INDEX IF NOT EXISTS idx_unidades_modelo ON unidades(modelo_id);

-- Usuário administrador padrão
INSERT INTO usuarios (nome_completo, login, senha, perfil, ativo)
VALUES (
  'Administrador',
  'admin',
  '$2b$10$O0SkdIeOkI8TvWLDsF1W/.f9in57Q8SYd6YmYJTP9EAkoSX4HFBqS', -- senha: comolatti
  'admin',
  TRUE
) ON CONFLICT (login) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- Categorias de TI pré-cadastradas
-- ═══════════════════════════════════════════════════════════════

-- Computadores
INSERT INTO categorias (nome, subcategoria) VALUES ('Computadores', 'Notebook') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Computadores', 'Desktop') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Computadores', 'Workstation') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Computadores', 'All-In-One') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Computadores', 'Mini PC') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Computadores', 'Thin Client') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Computadores', 'Chromebook') ON CONFLICT DO NOTHING;

-- Monitores e Displays
INSERT INTO categorias (nome, subcategoria) VALUES ('Monitores', 'Monitor LED/LCD') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Monitores', 'Monitor Ultrawide') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Monitores', 'Monitor Curvo') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Monitores', 'TV/Display') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Monitores', 'Projetor') ON CONFLICT DO NOTHING;

-- Periféricos - Entrada
INSERT INTO categorias (nome, subcategoria) VALUES ('Periféricos', 'Mouse') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Periféricos', 'Teclado') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Periféricos', 'Kit Mouse e Teclado') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Periféricos', 'Mousepad') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Periféricos', 'Webcam') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Periféricos', 'Scanner') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Periféricos', 'Leitor de Código de Barras') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Periféricos', 'Mesa Digitalizadora') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Periféricos', 'Controle/Joystick') ON CONFLICT DO NOTHING;

-- Periféricos - Saída/Áudio
INSERT INTO categorias (nome, subcategoria) VALUES ('Áudio', 'Headset') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Áudio', 'Fone de Ouvido') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Áudio', 'Caixa de Som') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Áudio', 'Microfone') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Áudio', 'Soundbar') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Áudio', 'Speakerphone') ON CONFLICT DO NOTHING;

-- Impressão
INSERT INTO categorias (nome, subcategoria) VALUES ('Impressão', 'Impressora Laser') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Impressão', 'Impressora Jato de Tinta') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Impressão', 'Impressora Multifuncional') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Impressão', 'Impressora Térmica') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Impressão', 'Impressora de Etiquetas') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Impressão', 'Plotter') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Impressão', 'Toner') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Impressão', 'Cartucho de Tinta') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Impressão', 'Ribbon') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Impressão', 'Rolo de Etiquetas') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Impressão', 'Papel A4') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Impressão', 'Papel Fotográfico') ON CONFLICT DO NOTHING;

-- Rede e Conectividade
INSERT INTO categorias (nome, subcategoria) VALUES ('Rede', 'Switch') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Rede', 'Roteador') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Rede', 'Access Point') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Rede', 'Firewall') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Rede', 'Modem') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Rede', 'Patch Panel') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Rede', 'Rack') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Rede', 'Organizador de Cabos') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Rede', 'Bandeja para Rack') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Rede', 'Placa de Rede') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Rede', 'Repetidor Wi-Fi') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Rede', 'Antena') ON CONFLICT DO NOTHING;

-- Cabos e Conectores
INSERT INTO categorias (nome, subcategoria) VALUES ('Cabos', 'Cabo HDMI') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Cabos', 'Cabo DisplayPort') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Cabos', 'Cabo VGA') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Cabos', 'Cabo DVI') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Cabos', 'Cabo USB-A') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Cabos', 'Cabo USB-C') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Cabos', 'Cabo Micro USB') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Cabos', 'Cabo Lightning') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Cabos', 'Cabo de Rede (Patch Cord)') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Cabos', 'Cabo de Rede (Rolo)') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Cabos', 'Cabo de Fibra Óptica') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Cabos', 'Cabo de Força') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Cabos', 'Cabo P2 (Áudio)') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Cabos', 'Cabo Serial/RS232') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Cabos', 'Adaptador/Conversor') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Cabos', 'Hub USB') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Cabos', 'Dock Station') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Cabos', 'Conector RJ45') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Cabos', 'Conector RJ11') ON CONFLICT DO NOTHING;

-- Armazenamento
INSERT INTO categorias (nome, subcategoria) VALUES ('Armazenamento', 'HD Interno') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Armazenamento', 'HD Externo') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Armazenamento', 'SSD Interno') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Armazenamento', 'SSD Externo') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Armazenamento', 'SSD NVMe/M.2') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Armazenamento', 'Pendrive') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Armazenamento', 'Cartão de Memória') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Armazenamento', 'NAS') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Armazenamento', 'Fita LTO/Backup') ON CONFLICT DO NOTHING;

-- Servidores e Infraestrutura
INSERT INTO categorias (nome, subcategoria) VALUES ('Servidores', 'Servidor Rack') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Servidores', 'Servidor Torre') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Servidores', 'Servidor Blade') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Servidores', 'Storage') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Servidores', 'UPS/Nobreak') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Servidores', 'Estabilizador') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Servidores', 'PDU') ON CONFLICT DO NOTHING;

-- Componentes Internos
INSERT INTO categorias (nome, subcategoria) VALUES ('Componentes', 'Memória RAM') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Componentes', 'Processador') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Componentes', 'Placa-Mãe') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Componentes', 'Placa de Vídeo') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Componentes', 'Fonte de Alimentação') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Componentes', 'Cooler/Ventilador') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Componentes', 'Gabinete') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Componentes', 'Bateria de Notebook') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Componentes', 'Carregador/Fonte de Notebook') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Componentes', 'Unidade Óptica (DVD/Blu-ray)') ON CONFLICT DO NOTHING;

-- Telefonia
INSERT INTO categorias (nome, subcategoria) VALUES ('Telefonia', 'Telefone IP') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Telefonia', 'Telefone Analógico') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Telefonia', 'Telefone Sem Fio') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Telefonia', 'Central Telefônica/PABX') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Telefonia', 'Gateway VoIP') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Telefonia', 'Celular Corporativo') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Telefonia', 'Tablet') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Telefonia', 'Carregador de Celular') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Telefonia', 'Capa/Película') ON CONFLICT DO NOTHING;

-- Segurança
INSERT INTO categorias (nome, subcategoria) VALUES ('Segurança', 'Câmera IP') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Segurança', 'DVR/NVR') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Segurança', 'Controle de Acesso') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Segurança', 'Leitor Biométrico') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Segurança', 'Cadeado/Trava de Segurança') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Segurança', 'Token de Autenticação') ON CONFLICT DO NOTHING;

-- Energia
INSERT INTO categorias (nome, subcategoria) VALUES ('Energia', 'Filtro de Linha') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Energia', 'Extensão Elétrica') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Energia', 'Régua de Tomadas') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Energia', 'Pilha/Bateria') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Energia', 'Carregador Universal') ON CONFLICT DO NOTHING;

-- Videoconferência
INSERT INTO categorias (nome, subcategoria) VALUES ('Videoconferência', 'Câmera de Videoconferência') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Videoconferência', 'Sistema de Videoconferência') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Videoconferência', 'Barra de Vídeo') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Videoconferência', 'Controle Remoto') ON CONFLICT DO NOTHING;

-- Suportes e Ergonomia
INSERT INTO categorias (nome, subcategoria) VALUES ('Ergonomia', 'Suporte para Monitor') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Ergonomia', 'Suporte para Notebook') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Ergonomia', 'Apoio de Pulso') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Ergonomia', 'Apoio para Pés') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Ergonomia', 'Cadeira Gamer/Ergonômica') ON CONFLICT DO NOTHING;

-- Ferramentas e Acessórios de TI
INSERT INTO categorias (nome, subcategoria) VALUES ('Ferramentas', 'Kit de Ferramentas') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Ferramentas', 'Testador de Cabos') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Ferramentas', 'Alicate de Crimpagem') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Ferramentas', 'Chave de Fenda/Phillips') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Ferramentas', 'Pulseira Antiestática') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Ferramentas', 'Soprador/Aspirador') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Ferramentas', 'Pasta Térmica') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Ferramentas', 'Álcool Isopropílico') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Ferramentas', 'Abraçadeira/Velcro') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Ferramentas', 'Etiquetadora') ON CONFLICT DO NOTHING;

-- Software e Licenças
INSERT INTO categorias (nome, subcategoria) VALUES ('Software', 'Licença Windows') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Software', 'Licença Office/Microsoft 365') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Software', 'Licença Antivírus') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Software', 'Licença Adobe') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Software', 'Licença AutoCAD') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Software', 'Licença Diversa') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Software', 'Certificado Digital') ON CONFLICT DO NOTHING;

-- Outros
INSERT INTO categorias (nome, subcategoria) VALUES ('Outros', 'Mochila/Case para Notebook') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Outros', 'Crachá/Cordão') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Outros', 'Material de Limpeza de TI') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nome, subcategoria) VALUES ('Outros', 'Diversos') ON CONFLICT DO NOTHING;
