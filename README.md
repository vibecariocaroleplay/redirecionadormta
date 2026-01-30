# 🛒 Sistema de Loja FiveM com Mercado Pago

Sistema completo de loja online para servidores FiveM com integração do Mercado Pago (PIX e Cartão de Crédito) e autenticação Discord.

## 📋 Pré-requisitos

- Node.js (v14 ou superior)
- Conta no Mercado Pago
- Aplicação Discord OAuth configurada
- Live Server (para o frontend) ou qualquer servidor web

## 🚀 Instalação

### 1. Configurar o Backend

```bash
# Navegar para a pasta do projeto
cd seu-projeto

# Instalar dependências
npm install

# Criar arquivo .env
cp .env.example .env
```

### 2. Configurar Variáveis de Ambiente

Edite o arquivo `.env`:

```env
# Mercado Pago - Obter em https://www.mercadopago.com.br/developers
MERCADOPAGO_ACCESS_TOKEN=seu_access_token_aqui
MERCADOPAGO_PUBLIC_KEY=sua_public_key_aqui

# URLs
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://127.0.0.1:5500

# Porta
PORT=3000
```

### 3. Obter Credenciais do Mercado Pago

1. Acesse https://www.mercadopago.com.br/developers
2. Faça login
3. Vá em **"Suas integrações"** → **"Criar aplicação"**
4. Dê um nome (ex: "Loja FiveM")
5. Copie as credenciais:
   - **ACCESS_TOKEN** (teste e produção)
   - **PUBLIC_KEY** (teste e produção)

⚠️ **IMPORTANTE**: Use primeiro as credenciais de **TESTE** para não gerar cobranças reais!

### 4. Configurar Webhooks no Mercado Pago

1. No painel do Mercado Pago, vá em **Webhooks**
2. Adicione a URL: `https://seu-dominio.com/api/webhook`
3. Ou use Ngrok para testes locais:

```bash
# Instalar ngrok
npm install -g ngrok

# Expor porta 3000
ngrok http 3000

# Usar URL gerada (ex: https://abc123.ngrok.io/api/webhook)
```

### 5. Configurar Discord OAuth

No arquivo `index.js` (frontend), atualize:

```javascript
const DISCORD_CONFIG = {
    CLIENT_ID: 'seu_client_id_aqui',
    REDIRECT_URI: 'http://127.0.0.1:5500/',
    SCOPES: ['identify', 'email']
};
```

No Discord Developer Portal:
1. Adicione `http://127.0.0.1:5500/` nos Redirects
2. Salve as alterações

### 6. Iniciar o Servidor

```bash
# Modo desenvolvimento (com auto-reload)
npm run dev

# Modo produção
npm start
```

O servidor estará rodando em: `http://localhost:3000`

### 7. Iniciar o Frontend

Abra o `index.html` com Live Server ou qualquer servidor web.

## 📱 Como Funciona

### Fluxo de Pagamento

1. **Usuário faz login** com Discord
2. **Adiciona produtos** ao carrinho
3. **Escolhe método** de pagamento:
   - **PIX**: Gera QR Code instantâneo
   - **Cartão**: Redireciona para checkout do Mercado Pago
4. **Sistema verifica** pagamento automaticamente
5. **Produtos são liberados** na dashboard após aprovação

### Verificação de Pagamento

#### PIX
- Verificação automática a cada 3 segundos
- QR Code válido por tempo limitado
- Confirmação instantânea após pagamento

#### Cartão de Crédito
- Redirecionamento para Mercado Pago
- Retorno automático após pagamento
- Verificação no backend via webhook

## 🔧 Endpoints da API

### POST `/api/create-payment`
Cria preferência de pagamento (checkout padrão)

**Body:**
```json
{
  "items": [
    {
      "id": 1,
      "name": "Produto",
      "priceValue": 100,
      "description": "Descrição"
    }
  ],
  "payer": {
    "name": "Nome",
    "email": "email@exemplo.com",
    "discord_id": "123456"
  }
}
```

**Response:**
```json
{
  "id": "pref_123",
  "init_point": "https://mercadopago.com/checkout...",
  "external_reference": "order_123"
}
```

### POST `/api/create-pix-payment`
Cria pagamento PIX com QR Code

**Response:**
```json
{
  "id": "payment_123",
  "status": "pending",
  "qr_code": "00020126...",
  "qr_code_base64": "iVBORw0KG..."
}
```

### GET `/api/payment-status/:external_reference`
Verifica status do pagamento

**Response:**
```json
{
  "status": "approved",
  "approved": true,
  "items": [...],
  "payment_id": "123"
}
```

### POST `/api/webhook`
Recebe notificações do Mercado Pago (automático)

### GET `/api/user-purchases/:discord_id`
Lista compras aprovadas do usuário

## 🧪 Testando com Credenciais de Teste

### Cartões de Teste

**Aprovado:**
- Número: `5031 4332 1540 6351`
- CVV: `123`
- Validade: `11/25`

**Recusado:**
- Número: `5031 4332 1540 6351`
- CVV: `123`
- Validade: `11/25`
- (Use nome "APRO" para aprovar, "OTHE" para recusar)

### PIX de Teste
- Use a conta de teste do Mercado Pago
- O pagamento será aprovado automaticamente após alguns segundos

## 📦 Estrutura de Arquivos

```
projeto/
├── server.js              # Backend Node.js
├── package.json           # Dependências
├── .env                   # Variáveis de ambiente (NÃO COMMITAR)
├── .env.example           # Exemplo de .env
├── index.html             # Frontend principal
├── index.js               # JavaScript do frontend (atualizado)
└── dashboard.html         # Painel do cliente
```

## 🔒 Segurança

- ✅ Nunca exponha `ACCESS_TOKEN` no frontend
- ✅ Use HTTPS em produção
- ✅ Valide todos os webhooks
- ✅ Implemente rate limiting
- ✅ Use variáveis de ambiente
- ✅ Valide pagamentos no backend

## 🚨 Problemas Comuns

### Webhook não recebe notificações
- Verifique se a URL está acessível publicamente
- Use Ngrok para testes locais
- Confirme que a URL está cadastrada no Mercado Pago

### Pagamento não é aprovado
- Verifique se está usando credenciais de teste
- Veja os logs do servidor
- Confirme que o webhook está funcionando

### CORS Error
- Verifique se o CORS está habilitado no servidor
- Confirme as URLs no `.env`

## 📝 Próximos Passos

1. **Banco de Dados**: Substituir Map() por MongoDB/PostgreSQL
2. **Integração FiveM**: Conectar com servidor FiveM para liberar itens automaticamente
3. **Email**: Enviar confirmação de compra por email
4. **Discord Bot**: Notificar compras em canal do Discord
5. **Admin Panel**: Painel para gerenciar vendas
6. **Analytics**: Dashboard com métricas de vendas

## 🆘 Suporte

Para dúvidas sobre:
- **Mercado Pago**: https://www.mercadopago.com.br/developers/pt/support
- **Discord OAuth**: https://discord.com/developers/docs

## 📄 Licença

MIT License - Livre para uso pessoal e comercial.

---

**Desenvolvido para comunidade FiveM** 🎮
