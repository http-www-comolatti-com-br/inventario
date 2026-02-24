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
