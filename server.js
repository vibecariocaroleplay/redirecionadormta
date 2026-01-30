// server.js - Backend Node.js para Mercado Pago
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mercadopago = require('mercadopago');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do Mercado Pago
mercadopago.configure({
    access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Store temporário de pagamentos (em produção, use um banco de dados)
const payments = new Map();

// ============================================
// CRIAR PREFERÊNCIA DE PAGAMENTO
// ============================================
app.post('/api/create-payment', async (req, res) => {
    try {
        const { items, payer } = req.body;

        // Validação básica
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ 
                error: 'Items são obrigatórios' 
            });
        }

        // Criar preferência de pagamento
        const preference = {
            items: items.map(item => ({
                title: item.name,
                description: item.description,
                unit_price: parseFloat(item.priceValue),
                quantity: 1,
                currency_id: 'BRL'
            })),
            payer: {
                name: payer?.name || 'Cliente',
                email: payer?.email || 'cliente@email.com',
                identification: {
                    type: payer?.docType || 'CPF',
                    number: payer?.docNumber || '00000000000'
                }
            },
            back_urls: {
                success: `${process.env.FRONTEND_URL}/success`,
                failure: `${process.env.FRONTEND_URL}/failure`,
                pending: `${process.env.FRONTEND_URL}/pending`
            },
            auto_return: 'approved',
            notification_url: `${process.env.BACKEND_URL}/api/webhook`,
            statement_descriptor: 'LOJA FIVEM',
            external_reference: `order_${Date.now()}`, // ID único do pedido
            metadata: {
                discord_id: payer?.discord_id,
                items: JSON.stringify(items.map(i => ({ id: i.id, name: i.name })))
            }
        };

        const response = await mercadopago.preferences.create(preference);

        // Salvar referência do pagamento
        payments.set(response.body.external_reference, {
            status: 'pending',
            items: items,
            payer: payer,
            created_at: new Date().toISOString()
        });

        res.json({
            id: response.body.id,
            init_point: response.body.init_point, // URL para checkout
            sandbox_init_point: response.body.sandbox_init_point, // URL para testes
            external_reference: response.body.external_reference
        });

    } catch (error) {
        console.error('Erro ao criar pagamento:', error);
        res.status(500).json({ 
            error: 'Erro ao processar pagamento',
            details: error.message 
        });
    }
});

// ============================================
// WEBHOOK - NOTIFICAÇÕES DO MERCADO PAGO
// ============================================
app.post('/api/webhook', async (req, res) => {
    try {
        const { type, data } = req.body;

        // Mercado Pago envia diferentes tipos de notificações
        if (type === 'payment') {
            const paymentId = data.id;

            // Buscar informações completas do pagamento
            const payment = await mercadopago.payment.findById(paymentId);
            const paymentData = payment.body;

            const externalReference = paymentData.external_reference;
            const status = paymentData.status;

            console.log(`Pagamento ${paymentId} - Status: ${status}`);

            // Atualizar status do pagamento
            if (payments.has(externalReference)) {
                const orderData = payments.get(externalReference);
                orderData.status = status;
                orderData.payment_id = paymentId;
                orderData.updated_at = new Date().toISOString();

                // Se aprovado, marcar produtos como liberados
                if (status === 'approved') {
                    orderData.approved = true;
                    orderData.approved_at = new Date().toISOString();
                    
                    console.log(`✅ Pagamento aprovado: ${externalReference}`);
                    
                    // AQUI você pode:
                    // 1. Salvar no banco de dados
                    // 2. Enviar email de confirmação
                    // 3. Liberar produtos no servidor FiveM
                    // 4. Enviar webhook para Discord
                }

                payments.set(externalReference, orderData);
            }
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('Erro no webhook:', error);
        res.status(500).send('Error');
    }
});

// ============================================
// VERIFICAR STATUS DO PAGAMENTO
// ============================================
app.get('/api/payment-status/:external_reference', (req, res) => {
    const { external_reference } = req.params;

    if (!payments.has(external_reference)) {
        return res.status(404).json({ 
            error: 'Pagamento não encontrado' 
        });
    }

    const payment = payments.get(external_reference);
    
    res.json({
        status: payment.status,
        approved: payment.approved || false,
        items: payment.items,
        payment_id: payment.payment_id,
        created_at: payment.created_at,
        updated_at: payment.updated_at,
        approved_at: payment.approved_at
    });
});

// ============================================
// BUSCAR PRODUTOS APROVADOS DO USUÁRIO
// ============================================
app.get('/api/user-purchases/:discord_id', (req, res) => {
    const { discord_id } = req.params;

    const userPurchases = [];

    // Buscar todos os pagamentos aprovados do usuário
    for (const [reference, payment] of payments.entries()) {
        if (payment.payer?.discord_id === discord_id && payment.approved) {
            userPurchases.push({
                external_reference: reference,
                items: payment.items,
                approved_at: payment.approved_at,
                payment_id: payment.payment_id
            });
        }
    }

    res.json({
        purchases: userPurchases,
        total: userPurchases.length
    });
});

// ============================================
// CRIAR PAGAMENTO PIX (ESPECÍFICO)
// ============================================
app.post('/api/create-pix-payment', async (req, res) => {
    try {
        const { items, payer } = req.body;

        const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.priceValue), 0);

        const payment_data = {
            transaction_amount: totalAmount,
            description: `Compra de ${items.length} ${items.length === 1 ? 'item' : 'itens'}`,
            payment_method_id: 'pix',
            payer: {
                email: payer?.email || 'cliente@email.com',
                first_name: payer?.name?.split(' ')[0] || 'Cliente',
                last_name: payer?.name?.split(' ').slice(1).join(' ') || 'FiveM',
                identification: {
                    type: payer?.docType || 'CPF',
                    number: payer?.docNumber || '00000000000'
                }
            },
            notification_url: `${process.env.BACKEND_URL}/api/webhook`,
            external_reference: `pix_${Date.now()}`,
            metadata: {
                discord_id: payer?.discord_id,
                items: JSON.stringify(items.map(i => ({ id: i.id, name: i.name })))
            }
        };

        const payment = await mercadopago.payment.create(payment_data);
        const paymentData = payment.body;

        // Salvar referência do pagamento
        payments.set(paymentData.external_reference, {
            status: paymentData.status,
            items: items,
            payer: payer,
            created_at: new Date().toISOString(),
            payment_method: 'pix'
        });

        res.json({
            id: paymentData.id,
            status: paymentData.status,
            external_reference: paymentData.external_reference,
            qr_code: paymentData.point_of_interaction.transaction_data.qr_code,
            qr_code_base64: paymentData.point_of_interaction.transaction_data.qr_code_base64,
            ticket_url: paymentData.point_of_interaction.transaction_data.ticket_url
        });

    } catch (error) {
        console.error('Erro ao criar pagamento PIX:', error);
        res.status(500).json({ 
            error: 'Erro ao processar pagamento PIX',
            details: error.message 
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📍 Webhook URL: ${process.env.BACKEND_URL}/api/webhook`);
});
