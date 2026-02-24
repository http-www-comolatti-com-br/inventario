#!/bin/bash
BASE="http://localhost:8201/api"
TOKEN=""

echo "============================================"
echo "  TESTES DO SISTEMA DE INVENTÁRIO DE TI"
echo "============================================"

# 1. TESTE DE LOGIN
echo ""
echo ">>> 1. TESTE DE LOGIN (admin/comolatti)"
RESP=$(curl -s -X POST "$BASE/auth/login" -H "Content-Type: application/json" -d '{"login":"admin","senha":"comolatti"}')
echo "$RESP" | python3 -m json.tool 2>/dev/null || echo "$RESP"
TOKEN=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])" 2>/dev/null)
if [ -z "$TOKEN" ]; then
  echo "❌ FALHA NO LOGIN - Abortando testes"
  exit 1
fi
echo "✅ Login OK - Token obtido"

# 2. TESTE DE HEALTH
echo ""
echo ">>> 2. HEALTH CHECK"
curl -s "$BASE/health" | python3 -m json.tool

# 3. CADASTRAR CATEGORIAS
echo ""
echo ">>> 3. CADASTRAR CATEGORIAS"
echo "--- Periféricos / Mouse ---"
curl -s -X POST "$BASE/categorias" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"nome":"Periféricos","subcategoria":"Mouse"}' | python3 -m json.tool

echo "--- Periféricos / Teclado ---"
curl -s -X POST "$BASE/categorias" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"nome":"Periféricos","subcategoria":"Teclado"}' | python3 -m json.tool

echo "--- Notebooks ---"
curl -s -X POST "$BASE/categorias" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"nome":"Notebooks"}' | python3 -m json.tool

echo "--- Cabos e Adaptadores ---"
curl -s -X POST "$BASE/categorias" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"nome":"Cabos e Adaptadores","subcategoria":"HDMI"}' | python3 -m json.tool

echo "--- Listar categorias ---"
curl -s "$BASE/categorias" -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# 4. CADASTRAR MODELOS
echo ""
echo ">>> 4. CADASTRAR MODELOS"
echo "--- Notebook Dell Latitude 5520 (patrimônio) ---"
curl -s -X POST "$BASE/modelos" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"tipo":"patrimonio","categoria_id":3,"nome":"Notebook Dell Latitude 5520","marca":"Dell","modelo":"Latitude 5520","especificacoes":"i5-1145G7, 16GB RAM, 256GB SSD"}' | python3 -m json.tool

echo "--- Mouse Logitech M280 (patrimônio) ---"
curl -s -X POST "$BASE/modelos" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"tipo":"patrimonio","categoria_id":1,"nome":"Mouse Logitech M280","marca":"Logitech","modelo":"M280"}' | python3 -m json.tool

echo "--- Cabo HDMI 2m (consumível) ---"
curl -s -X POST "$BASE/modelos" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"tipo":"consumivel","categoria_id":4,"nome":"Cabo HDMI 2 metros","marca":"Multilaser","modelo":"WI249"}' | python3 -m json.tool

echo "--- Listar modelos ---"
curl -s "$BASE/modelos" -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# 5. CADASTRAR DESTINATÁRIOS
echo ""
echo ">>> 5. CADASTRAR DESTINATÁRIOS"
echo "--- João Silva ---"
curl -s -X POST "$BASE/destinatarios" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"nome_completo":"João Silva","setor":"Financeiro","filial":"Matriz"}' | python3 -m json.tool

echo "--- Maria Santos ---"
curl -s -X POST "$BASE/destinatarios" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"nome_completo":"Maria Santos","setor":"RH","filial":"Matriz"}' | python3 -m json.tool

# 6. CADASTRAR UNIDADES (PATRIMÔNIO)
echo ""
echo ">>> 6. CADASTRAR UNIDADES (PATRIMÔNIO)"
echo "--- Notebook SN-001 ---"
curl -s -X POST "$BASE/unidades" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"modelo_id":1,"numero_serie":"SN-DELL-001","etiqueta_patrimonial":"PAT-001","local":"Almoxarifado TI"}' | python3 -m json.tool

echo "--- Notebook SN-002 ---"
curl -s -X POST "$BASE/unidades" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"modelo_id":1,"numero_serie":"SN-DELL-002","etiqueta_patrimonial":"PAT-002","local":"Almoxarifado TI"}' | python3 -m json.tool

echo "--- Mouse SN-003 ---"
curl -s -X POST "$BASE/unidades" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"modelo_id":2,"numero_serie":"SN-LOG-001","etiqueta_patrimonial":"PAT-003","local":"Almoxarifado TI"}' | python3 -m json.tool

# 7. MOVIMENTAÇÕES
echo ""
echo ">>> 7. MOVIMENTAÇÕES"

echo "--- ENTRADA: 20 cabos HDMI ---"
curl -s -X POST "$BASE/movimentacoes/entrada" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"modelo_id":3,"quantidade":20,"observacao":"Compra NF 12345"}' | python3 -m json.tool

echo "--- ENTREGA: Notebook PAT-001 para João Silva ---"
curl -s -X POST "$BASE/movimentacoes/entrega" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"modelo_id":1,"unidade_id":1,"destinatario_id":1,"observacao":"Entrega para uso diário"}' | python3 -m json.tool

echo "--- ENTREGA: Mouse PAT-003 para João Silva ---"
curl -s -X POST "$BASE/movimentacoes/entrega" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"modelo_id":2,"unidade_id":3,"destinatario_id":1,"observacao":"Mouse para estação de trabalho"}' | python3 -m json.tool

echo "--- ENTREGA: 5 cabos HDMI para Maria Santos ---"
curl -s -X POST "$BASE/movimentacoes/entrega" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"modelo_id":3,"quantidade":5,"destinatario_id":2,"observacao":"Cabos para sala de reunião"}' | python3 -m json.tool

echo "--- TRANSFERÊNCIA: Notebook PAT-001 de João para Maria ---"
curl -s -X POST "$BASE/movimentacoes/transferencia" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"modelo_id":1,"unidade_id":1,"destinatario_id":2,"observacao":"Transferência por mudança de setor"}' | python3 -m json.tool

echo "--- MANUTENÇÃO: Notebook PAT-002 ---"
curl -s -X POST "$BASE/movimentacoes/manutencao" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"modelo_id":1,"unidade_id":2,"observacao":"Troca de tela"}' | python3 -m json.tool

# 8. VERIFICAR ESTOQUE
echo ""
echo ">>> 8. VERIFICAR ESTOQUE"
curl -s "$BASE/estoque" -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# 9. VERIFICAR UNIDADES
echo ""
echo ">>> 9. VERIFICAR STATUS DAS UNIDADES"
curl -s "$BASE/unidades" -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# 10. QR CODE
echo ""
echo ">>> 10. TESTE QR CODE (Unidade 1)"
curl -s "$BASE/unidades/1/qrcode" -H "Authorization: Bearer $TOKEN" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print('QR Code gerado:', 'SIM' if 'qrcode' in data and data['qrcode'].startswith('data:image') else 'NÃO')
print('Dados do equipamento:', json.dumps(data.get('dados', {}), indent=2, ensure_ascii=False))
"

# 11. DASHBOARD
echo ""
echo ">>> 11. DASHBOARD - RESUMO"
curl -s "$BASE/dashboard/resumo" -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

echo ""
echo ">>> 12. DASHBOARD - POR DESTINATÁRIO"
curl -s "$BASE/dashboard/por-destinatario" -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# 13. HISTÓRICO DA UNIDADE 1
echo ""
echo ">>> 13. HISTÓRICO DA UNIDADE 1 (Notebook PAT-001)"
curl -s "$BASE/unidades/1/historico" -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# 14. TESTE DE VALIDAÇÃO - Saldo negativo
echo ""
echo ">>> 14. TESTE VALIDAÇÃO: Tentar entregar 100 cabos (saldo insuficiente)"
curl -s -X POST "$BASE/movimentacoes/entrega" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"modelo_id":3,"quantidade":100,"destinatario_id":1,"observacao":"Deve falhar"}' | python3 -m json.tool

# 15. MOVIMENTAÇÕES RECENTES
echo ""
echo ">>> 15. MOVIMENTAÇÕES RECENTES"
curl -s "$BASE/dashboard/movimentacoes-recentes" -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

echo ""
echo "============================================"
echo "  TESTES CONCLUÍDOS!"
echo "============================================"
