-- Script para popular categorias de informática no sistema de Inventário
-- Data: 2026-03-25

-- Limpar categorias existentes se necessário (Opcional, cuidado!)
-- DELETE FROM categorias;

INSERT INTO categorias (nome, subcategoria) VALUES 
-- Computadores
('Computadores', 'Notebook'),
('Computadores', 'Desktop'),
('Computadores', 'Servidor'),
('Computadores', 'Workstation'),

-- Monitores
('Monitores', 'Monitor LED/LCD'),
('Monitores', 'Suporte de Monitor'),

-- Periféricos
('Periféricos', 'Teclado'),
('Periféricos', 'Mouse'),
('Periféricos', 'Headset'),
('Periféricos', 'Webcam'),
('Periféricos', 'Adaptador/Cabo'),

-- Rede
('Rede', 'Switch'),
('Rede', 'Roteador'),
('Rede', 'Access Point'),
('Rede', 'Patch Panel'),
('Rede', 'Rack/Gabinete'),

-- Impressão e Imagem
('Impressão', 'Impressora Laser'),
('Impressão', 'Multifuncional Jato de Tinta'),
('Impressão', 'Scanner'),

-- Armazenamento
('Armazenamento', 'HD Externo'),
('Armazenamento', 'SSD Interno'),
('Armazenamento', 'NAS (Network Attached Storage)'),

-- Energia
('Energia', 'Nobreak'),
('Energia', 'Estabilizador'),
('Energia', 'Filtro de Linha'),

-- Suprimentos
('Suprimentos', 'Toner'),
('Suprimentos', 'Cartucho de Tinta'),
('Suprimentos', 'Cilindro de Imagem'),

-- Software e Licenciamento
('Software', 'Sistema Operacional'),
('Software', 'Pacote Office'),
('Software', 'Antivírus/Segurança'),
('Software', 'Licença de Software Especializado'),

-- Telefonia
('Telefonia', 'Aparelho IP'),
('Telefonia', 'Central PABX'),
('Telefonia', 'Headset Telefônico')
ON CONFLICT (nome, subcategoria) DO NOTHING;

-- Verificar inserções
SELECT * FROM categorias ORDER BY nome, subcategoria;
