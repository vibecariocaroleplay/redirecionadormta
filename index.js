// Sample product database
const products = {
    veiculos: [
        {
            id: 1,
            name: "Lamborghini Aventador",
            category: "Veículos",
            price: "R$ 15.000",
            priceValue: 15000,
            description: "Supercarro exclusivo com customização completa",
            badge: "Exclusivo",
            imageUrl: ""
        },
        {
            id: 2,
            name: "Ferrari F8 Tributo",
            category: "Veículos",
            price: "R$ 13.500",
            priceValue: 13500,
            description: "Performance máxima e design italiano",
            imageUrl: ""
        },
        {
            id: 3,
            name: "Mercedes AMG GT",
            category: "Veículos",
            price: "R$ 12.000",
            priceValue: 12000,
            description: "Elegância e potência alemã",
            imageUrl: ""
        }
    ],
    armas: [
        {
            id: 4,
            name: "AK-47 Dourada",
            category: "Armas",
            price: "R$ 2.500",
            priceValue: 2500,
            description: "Skin exclusiva em ouro 24k",
            badge: "Premium",
            imageUrl: ""
        },
        {
            id: 5,
            name: "Desert Eagle Custom",
            category: "Armas",
            price: "R$ 1.800",
            priceValue: 1800,
            description: "Personalização única com gravuras",
            imageUrl: ""
        },
        {
            id: 6,
            name: "M4A1 Tactical",
            category: "Armas",
            price: "R$ 3.200",
            priceValue: 3200,
            description: "Equipamento tático completo",
            imageUrl: ""
        }
    ],
    roupas: [
        {
            id: 7,
            name: "Conjunto Empresário VIP",
            category: "Roupas",
            price: "R$ 800",
            priceValue: 800,
            description: "Terno premium para reuniões importantes",
            badge: "VIP",
            imageUrl: ""
        },
        {
            id: 8,
            name: "Kit Streetwear Exclusivo",
            category: "Roupas",
            price: "R$ 650",
            priceValue: 650,
            description: "Visual moderno e urbano",
            imageUrl: ""
        },
        {
            id: 9,
            name: "Uniforme Tático Elite",
            category: "Roupas",
            price: "R$ 950",
            priceValue: 950,
            description: "Equipamento profissional completo",
            imageUrl: ""
        }
    ],
    vips: [
        {
            id: 10,
            name: "VIP Ouro - 30 Dias",
            category: "VIPs",
            price: "R$ 25.00",
            priceValue: 25,
            description: "Benefícios exclusivos e prioridade no servidor",
            badge: "Popular",
            imageUrl: ""
        },
        {
            id: 11,
            name: "VIP Platina - 30 Dias",
            category: "VIPs",
            price: "R$ 45.00",
            priceValue: 45,
            description: "Acesso a áreas VIP e itens exclusivos",
            imageUrl: ""
        },
        {
            id: 12,
            name: "VIP Diamante - 30 Dias",
            category: "VIPs",
            price: "R$ 80.00",
            priceValue: 80,
            description: "Máximo de benefícios e status premium",
            badge: "Premium",
            imageUrl: ""
        }
    ],
    orgs: [
        {
            id: 13,
            name: "Slot Organização Premium",
            category: "Organizações",
            price: "R$ 50.00",
            priceValue: 50,
            description: "Espaço exclusivo para sua organização",
            imageUrl: ""
        },
        {
            id: 14,
            name: "Base Personalizada",
            category: "Organizações",
            price: "R$ 120.00",
            priceValue: 120,
            description: "Base customizada com interiors exclusivos",
            badge: "Destaque",
            imageUrl: ""
        },
        {
            id: 15,
            name: "Sistema de Territórios",
            category: "Organizações",
            price: "R$ 85.00",
            priceValue: 85,
            description: "Controle estratégico de territórios",
            imageUrl: ""
        }
    ]
};

// Configuração da API
const API_URL = 'http://localhost:3000/api';

// Cart management
let cart = [];

// DOM Elements
const cartBtn = document.getElementById('cartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartClose = document.getElementById('cartClose');
const cartCount = document.getElementById('cartCount');
const productsGrid = document.getElementById('productsGrid');
const categoryButtons = document.querySelectorAll('.category-btn');
const loginBtn = document.getElementById('loginBtn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadAllProducts();
    setupEventListeners();
    checkUserSession();
    handleOAuthCallback();
    checkPaymentReturn();
});

// Event Listeners
function setupEventListeners() {
    // Cart toggle
    cartBtn.addEventListener('click', toggleCart);
    cartClose.addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', toggleCart);
    
    // Category filters
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const category = btn.dataset.category;
            filterProducts(category);
        });
    });
    
    // Login button - Discord OAuth
    loginBtn.addEventListener('click', handleDiscordLogin);
    
    // Checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }
}

// Cart functions
function toggleCart() {
    cartSidebar.classList.toggle('active');
    cartOverlay.classList.toggle('active');
}

function updateCartCount() {
    cartCount.textContent = cart.length;
    
    const itemsCount = document.getElementById('cartItemsCount');
    if (itemsCount) {
        itemsCount.textContent = `${cart.length} ${cart.length === 1 ? 'item' : 'itens'}`;
    }
}

function addToCart(productId) {
    let product = null;
    for (const category in products) {
        const found = products[category].find(p => p.id === productId);
        if (found) {
            product = found;
            break;
        }
    }
    
    if (product) {
        if (cart.find(item => item.id === productId)) {
            showNotification('Este produto já está no carrinho!');
            return;
        }
        
        cart.push(product);
        updateCartCount();
        showNotification('Produto adicionado ao carrinho!');
        updateCartDisplay();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartCount();
    updateCartDisplay();
    showNotification('Produto removido do carrinho!');
}

function updateCartDisplay() {
    const cartContent = document.getElementById('cartContent');
    const cartFooter = document.getElementById('cartFooter');
    
    if (cart.length === 0) {
        cartContent.innerHTML = `
            <div class="cart-empty">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                    <path d="M30 6.67L23.33 16.67M56.67 6.67l6.66 10M30 53.33a6.67 6.67 0 1 1-13.33 0 6.67 6.67 0 0 1 13.33 0zm30 0a6.67 6.67 0 1 1-13.34 0 6.67 6.67 0 0 1 13.34 0zM13.33 16.67h53.34l-6.67 30H20l-6.67-30z" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.2"/>
                </svg>
                <h3>Carrinho</h3>
                <p>Adicione produtos incríveis ao seu carrinho!</p>
            </div>
        `;
        cartFooter.style.display = 'none';
    } else {
        const total = cart.reduce((sum, item) => sum + (item.priceValue || 0), 0);
        
        cartContent.innerHTML = `
            <div class="cart-items">
                ${cart.map(item => `
                    <div class="cart-item">
                        <div class="cart-item-image">
                            ${item.imageUrl ? 
                                `<img src="${item.imageUrl}" alt="${item.name}">` : 
                                getProductIcon(item.category)
                            }
                        </div>
                        <div class="cart-item-info">
                            <h4 class="cart-item-name">${item.name}</h4>
                            <p class="cart-item-category">${item.category}</p>
                            <div class="cart-item-bottom">
                                <span class="cart-item-price">${item.price}</span>
                                <button class="remove-item-btn" onclick="removeFromCart(${item.id})">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        document.getElementById('totalPrice').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        cartFooter.style.display = 'block';
    }
}

function clearCart() {
    cart = [];
    updateCartCount();
    updateCartDisplay();
    showNotification('Carrinho limpo!');
}

// Product display functions
function loadAllProducts() {
    const allProducts = [];
    for (const category in products) {
        allProducts.push(...products[category]);
    }
    displayProducts(allProducts);
}

function filterProducts(category) {
    if (category === 'todos') {
        loadAllProducts();
    } else {
        displayProducts(products[category] || []);
    }
}

function displayProducts(productsArray) {
    if (productsArray.length === 0) {
        productsGrid.innerHTML = '<div class="product-message">Nenhum produto encontrado</div>';
        return;
    }
    
    productsGrid.innerHTML = productsArray.map((product, index) => `
        <div class="product-card" style="animation-delay: ${index * 0.1}s">
            <div class="product-image">
                ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                ${product.imageUrl ? 
                    `<img src="${product.imageUrl}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">` : 
                    getProductIcon(product.category)
                }
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-footer">
                    <span class="product-price">${product.price}</span>
                    <button class="add-to-cart" onclick="addToCart(${product.id})">
                        Adicionar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function getProductIcon(category) {
    const icons = {
        'Veículos': `<svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <path d="M10 52h60M20 32l-6 20h52l-6-20M20 32l4-12h32l4 12M20 32h40" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
            <circle cx="24" cy="64" r="6" stroke="currentColor" stroke-width="3"/>
            <circle cx="56" cy="64" r="6" stroke="currentColor" stroke-width="3"/>
        </svg>`,
        'Armas': `<svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <path d="M12 40l32-28 24 24-28 32-28-28zm40-16l16-4-4 16" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`,
        'Roupas': `<svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <path d="M24 12L16 28v40h16V36l8-8 8 8v32h16V28l-8-16-16 8-16-8z" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`,
        'VIPs': `<svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <path d="M40 8l10 20 22 3.2-16 15.6 4 21.2-20-10.4-20 10.4 4-21.2-16-15.6 22-3.2L40 8z" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`,
        'Organizações': `<svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <path d="M68 72v-8a16 16 0 0 0-16-16H28a16 16 0 0 0-16 16v8M52 20a16 16 0 1 1-32 0 16 16 0 0 1 32 0z" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`
    };
    
    return icons[category] || icons['Veículos'];
}

// ============================================
// DISCORD OAUTH
// ============================================
const DISCORD_CONFIG = {
    CLIENT_ID: '988513639289995275',
    REDIRECT_URI: 'http://127.0.0.1:5500/',
    SCOPES: ['identify', 'email']
};

function checkUserSession() {
    const user = localStorage.getItem('discord_user');
    if (user) {
        const userData = JSON.parse(user);
        updateUIForLoggedInUser(userData);
    }
}

function handleDiscordLogin() {
    const state = generateRandomState();
    localStorage.setItem('discord_oauth_state', state);
    
    const params = new URLSearchParams({
        client_id: DISCORD_CONFIG.CLIENT_ID,
        redirect_uri: DISCORD_CONFIG.REDIRECT_URI,
        response_type: 'token',
        scope: DISCORD_CONFIG.SCOPES.join(' '),
        state: state
    });
    
    window.location.href = `https://discord.com/api/oauth2/authorize?${params.toString()}`;
}

function generateRandomState() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

async function handleOAuthCallback() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    
    const accessToken = params.get('access_token');
    const state = params.get('state');
    const savedState = localStorage.getItem('discord_oauth_state');
    
    if (!accessToken) return;
    
    if (state !== savedState) {
        console.error('State mismatch');
        showNotification('Erro de segurança no login. Tente novamente.');
        window.location.hash = '';
        return;
    }
    
    localStorage.removeItem('discord_oauth_state');
    
    try {
        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        if (!userResponse.ok) throw new Error('Failed to get user data');
        
        const userData = await userResponse.json();
        
        localStorage.setItem('discord_user', JSON.stringify(userData));
        localStorage.setItem('discord_token', accessToken);
        
        updateUIForLoggedInUser(userData);
        window.history.replaceState({}, document.title, window.location.pathname);
        
        showNotification(`Bem-vindo, ${userData.username}!`);
        
    } catch (error) {
        console.error('OAuth error:', error);
        showNotification('Erro ao fazer login com Discord. Tente novamente.');
        window.location.hash = '';
    }
}

function updateUIForLoggedInUser(userData) {
    const navLinks = document.getElementById('navLinks');
    
    if (navLinks) {
        const avatarExtension = userData.avatar?.startsWith('a_') ? 'gif' : 'png';
        const avatarUrl = userData.avatar 
            ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.${avatarExtension}?size=128`
            : `https://cdn.discordapp.com/embed/avatars/${parseInt(userData.discriminator || '0') % 5}.png`;
        
        navLinks.outerHTML = `
            <div class="user-dropdown" id="userDropdown">
                <div class="user-dropdown-trigger" onclick="toggleUserDropdown()">
                    <img src="${avatarUrl}" alt="${userData.username}">
                    <span class="username">${userData.username}</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <div class="user-dropdown-menu" id="userDropdownMenu">
                    <button class="dropdown-item" onclick="window.location.href='dashboard.html'">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <rect x="2" y="2" width="6" height="6" rx="1" stroke="currentColor" stroke-width="2"/>
                            <rect x="10" y="2" width="6" height="6" rx="1" stroke="currentColor" stroke-width="2"/>
                            <rect x="2" y="10" width="6" height="6" rx="1" stroke="currentColor" stroke-width="2"/>
                            <rect x="10" y="10" width="6" height="6" rx="1" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        Painel do Cliente
                    </button>
                    <button class="dropdown-item" onclick="handleLogout()">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M7 16H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3M12 13l4-4-4-4M16 9H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Desconectar
                    </button>
                </div>
            </div>
        `;
    }
}

function toggleUserDropdown() {
    const trigger = document.querySelector('.user-dropdown-trigger');
    const menu = document.getElementById('userDropdownMenu');
    
    if (trigger && menu) {
        trigger.classList.toggle('active');
        menu.classList.toggle('active');
    }
}

document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown && !dropdown.contains(e.target)) {
        const trigger = document.querySelector('.user-dropdown-trigger');
        const menu = document.getElementById('userDropdownMenu');
        if (trigger && menu) {
            trigger.classList.remove('active');
            menu.classList.remove('active');
        }
    }
});

function handleLogout() {
    localStorage.removeItem('discord_user');
    localStorage.removeItem('discord_token');
    showNotification('Logout realizado com sucesso!');
    setTimeout(() => window.location.reload(), 1000);
}

// ============================================
// MERCADO PAGO - CHECKOUT
// ============================================

async function handleCheckout() {
    if (cart.length === 0) {
        showNotification('Seu carrinho está vazio!');
        return;
    }
    
    const user = localStorage.getItem('discord_user');
    if (!user) {
        showNotification('Faça login para finalizar a compra!');
        return;
    }
    
    const userData = JSON.parse(user);
    
    // Criar modal de escolha de pagamento
    showPaymentMethodModal(userData);
}

function showPaymentMethodModal(userData) {
    // Remove modal existente se houver
    const existingModal = document.getElementById('paymentModal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.id = 'paymentModal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closePaymentModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>Escolha o método de pagamento</h2>
                <button class="modal-close" onclick="closePaymentModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="payment-methods">
                    <button class="payment-method-btn" onclick="processPayment('checkout')">
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                            <rect x="5" y="10" width="30" height="20" rx="2" stroke="currentColor" stroke-width="2"/>
                            <path d="M5 16h30M10 22h8M10 26h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        <div>
                            <h3>Cartão de Crédito</h3>
                            <p>Pagamento via Mercado Pago</p>
                        </div>
                    </button>
                    
                    <button class="payment-method-btn" onclick="processPayment('pix')">
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                            <path d="M20 5L8 17l12 12 12-12L20 5zm0 24L8 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <div>
                            <h3>PIX</h3>
                            <p>Pagamento instantâneo via QR Code</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Adicionar estilos
    const style = document.createElement('style');
    style.textContent = `
        #paymentModal .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            z-index: 9998;
            backdrop-filter: blur(5px);
        }
        #paymentModal .modal-content {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 15px;
            padding: 2rem;
            max-width: 500px;
            width: 90%;
            z-index: 9999;
            animation: modalSlideIn 0.3s ease;
        }
        #paymentModal .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }
        #paymentModal .modal-header h2 {
            color: var(--text-white);
            font-size: 1.5rem;
            margin: 0;
        }
        #paymentModal .modal-close {
            background: none;
            border: none;
            color: var(--text-gray);
            font-size: 2rem;
            cursor: pointer;
            padding: 0;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            transition: all 0.3s;
        }
        #paymentModal .modal-close:hover {
            background: rgba(255, 255, 255, 0.1);
            color: var(--text-white);
        }
        #paymentModal .payment-methods {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        #paymentModal .payment-method-btn {
            display: flex;
            align-items: center;
            gap: 1.5rem;
            padding: 1.5rem;
            background: rgba(255, 255, 255, 0.05);
            border: 2px solid var(--border-color);
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s;
            text-align: left;
        }
        #paymentModal .payment-method-btn:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: var(--primary-red);
            transform: translateX(10px);
        }
        #paymentModal .payment-method-btn svg {
            flex-shrink: 0;
            stroke: var(--primary-red);
        }
        #paymentModal .payment-method-btn h3 {
            color: var(--text-white);
            font-size: 1.2rem;
            margin: 0 0 0.25rem 0;
        }
        #paymentModal .payment-method-btn p {
            color: var(--text-gray);
            margin: 0;
            font-size: 0.9rem;
        }
        @keyframes modalSlideIn {
            from {
                opacity: 0;
                transform: translate(-50%, -45%);
            }
            to {
                opacity: 1;
                transform: translate(-50%, -50%);
            }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);
}

function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) modal.remove();
}

async function processPayment(method) {
    closePaymentModal();
    
    const user = JSON.parse(localStorage.getItem('discord_user'));
    
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.disabled = true;
        checkoutBtn.innerHTML = 'Processando...';
    }
    
    try {
        const paymentData = {
            items: cart,
            payer: {
                name: user.username,
                email: user.email || `${user.id}@discord.user`,
                discord_id: user.id
            }
        };
        
        if (method === 'pix') {
            // Pagamento PIX
            const response = await fetch(`${API_URL}/create-pix-payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paymentData)
            });
            
            if (!response.ok) throw new Error('Erro ao criar pagamento PIX');
            
            const data = await response.json();
            
            // Salvar referência do pagamento
            localStorage.setItem('pending_payment', JSON.stringify({
                external_reference: data.external_reference,
                payment_id: data.id,
                method: 'pix',
                items: cart
            }));
            
            // Mostrar QR Code
            showPixModal(data);
            
        } else {
            // Checkout padrão (Cartão)
            const response = await fetch(`${API_URL}/create-payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paymentData)
            });
            
            if (!response.ok) throw new Error('Erro ao criar pagamento');
            
            const data = await response.json();
            
            // Salvar referência do pagamento
            localStorage.setItem('pending_payment', JSON.stringify({
                external_reference: data.external_reference,
                method: 'checkout',
                items: cart
            }));
            
            // Redirecionar para checkout do Mercado Pago
            window.location.href = data.sandbox_init_point || data.init_point;
        }
        
    } catch (error) {
        console.error('Erro no pagamento:', error);
        showNotification('Erro ao processar pagamento. Tente novamente.');
        
        if (checkoutBtn) {
            checkoutBtn.disabled = false;
            checkoutBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M16 6L8.5 13.5 4 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Finalizar Compra
            `;
        }
    }
}

function showPixModal(pixData) {
    const modal = document.createElement('div');
    modal.id = 'pixModal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content pix-modal">
            <div class="modal-header">
                <h2>Pagamento via PIX</h2>
                <button class="modal-close" onclick="closePixModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="pix-instructions">
                    <p>Escaneie o QR Code com o app do seu banco</p>
                    <div class="qr-code-container">
                        <img src="data:image/png;base64,${pixData.qr_code_base64}" alt="QR Code PIX">
                    </div>
                    <p class="pix-code-label">Ou copie o código PIX:</p>
                    <div class="pix-code">
                        <input type="text" value="${pixData.qr_code}" readonly id="pixCode">
                        <button onclick="copyPixCode()" class="copy-btn">Copiar</button>
                    </div>
                    <div class="pix-status" id="pixStatus">
                        <div class="loading-spinner"></div>
                        <p>Aguardando pagamento...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        #pixModal .pix-modal {
            max-width: 600px;
        }
        #pixModal .pix-instructions {
            text-align: center;
        }
        #pixModal .pix-instructions > p {
            color: var(--text-gray);
            margin-bottom: 1.5rem;
        }
        #pixModal .qr-code-container {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            display: inline-block;
            margin-bottom: 1.5rem;
        }
        #pixModal .qr-code-container img {
            display: block;
            max-width: 300px;
            width: 100%;
        }
        #pixModal .pix-code-label {
            color: var(--text-white);
            font-weight: 600;
            margin-bottom: 0.5rem;
        }
        #pixModal .pix-code {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 2rem;
        }
        #pixModal .pix-code input {
            flex: 1;
            padding: 0.75rem;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            color: var(--text-white);
            font-family: monospace;
            font-size: 0.85rem;
        }
        #pixModal .copy-btn {
            padding: 0.75rem 1.5rem;
            background: var(--primary-red);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s;
        }
        #pixModal .copy-btn:hover {
            background: #c0262a;
            transform: translateY(-2px);
        }
        #pixModal .pix-status {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            padding: 1.5rem;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
        }
        #pixModal .loading-spinner {
            width: 24px;
            height: 24px;
            border: 3px solid rgba(255, 255, 255, 0.1);
            border-top-color: var(--primary-red);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        #pixModal .pix-status p {
            color: var(--text-white);
            margin: 0;
        }
        #pixModal .pix-status.success {
            background: rgba(46, 204, 113, 0.2);
            border: 1px solid #2ecc71;
        }
        #pixModal .pix-status.success p {
            color: #2ecc71;
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);
    
    // Iniciar verificação do pagamento
    startPaymentVerification(pixData.external_reference);
}

function closePixModal() {
    const modal = document.getElementById('pixModal');
    if (modal) modal.remove();
    
    // Parar verificação
    if (window.paymentCheckInterval) {
        clearInterval(window.paymentCheckInterval);
    }
}

function copyPixCode() {
    const input = document.getElementById('pixCode');
    input.select();
    document.execCommand('copy');
    showNotification('Código PIX copiado!');
}

// Verificar status do pagamento a cada 3 segundos
function startPaymentVerification(externalReference) {
    window.paymentCheckInterval = setInterval(async () => {
        try {
            const response = await fetch(`${API_URL}/payment-status/${externalReference}`);
            const data = await response.json();
            
            if (data.status === 'approved' || data.approved) {
                clearInterval(window.paymentCheckInterval);
                
                // Atualizar UI
                const pixStatus = document.getElementById('pixStatus');
                if (pixStatus) {
                    pixStatus.className = 'pix-status success';
                    pixStatus.innerHTML = `
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M20 6L9 17l-5-5" stroke="#2ecc71" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <p>Pagamento confirmado!</p>
                    `;
                }
                
                // Salvar produtos aprovados
                const pendingPayment = JSON.parse(localStorage.getItem('pending_payment') || '{}');
                const purchasedProducts = pendingPayment.items.map(product => ({
                    ...product,
                    activationCode: generateActivationCode(),
                    purchaseDate: new Date().toISOString(),
                    paymentId: data.payment_id
                }));
                
                const existing = JSON.parse(localStorage.getItem('purchased_products') || '[]');
                localStorage.setItem('purchased_products', JSON.stringify([...existing, ...purchasedProducts]));
                
                // Limpar dados
                localStorage.removeItem('pending_payment');
                cart = [];
                updateCartCount();
                updateCartDisplay();
                
                showNotification('Pagamento aprovado! Redirecionando...');
                
                setTimeout(() => {
                    closePixModal();
                    window.location.href = 'dashboard.html';
                }, 2000);
            }
            
        } catch (error) {
            console.error('Erro ao verificar pagamento:', error);
        }
    }, 3000);
}

// Verificar retorno do checkout do Mercado Pago
function checkPaymentReturn() {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const externalReference = urlParams.get('external_reference');
    
    if (status && externalReference) {
        // Limpar URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        if (status === 'approved') {
            // Verificar no backend se realmente foi aprovado
            fetch(`${API_URL}/payment-status/${externalReference}`)
                .then(res => res.json())
                .then(data => {
                    if (data.approved) {
                        const pendingPayment = JSON.parse(localStorage.getItem('pending_payment') || '{}');
                        
                        const purchasedProducts = pendingPayment.items.map(product => ({
                            ...product,
                            activationCode: generateActivationCode(),
                            purchaseDate: new Date().toISOString(),
                            paymentId: data.payment_id
                        }));
                        
                        const existing = JSON.parse(localStorage.getItem('purchased_products') || '[]');
                        localStorage.setItem('purchased_products', JSON.stringify([...existing, ...purchasedProducts]));
                        
                        localStorage.removeItem('pending_payment');
                        cart = [];
                        updateCartCount();
                        
                        showNotification('Pagamento aprovado! Veja seus produtos no painel.');
                        
                        setTimeout(() => {
                            window.location.href = 'dashboard.html';
                        }, 2000);
                    }
                })
                .catch(error => {
                    console.error('Erro ao verificar pagamento:', error);
                    showNotification('Erro ao verificar pagamento. Contate o suporte.');
                });
        } else if (status === 'pending') {
            showNotification('Pagamento pendente. Aguarde a confirmação.');
        } else {
            showNotification('Pagamento não aprovado. Tente novamente.');
        }
    }
}

function generateActivationCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 16; i++) {
        if (i > 0 && i % 4 === 0) code += '-';
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Notification system
function showNotification(message) {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) existingNotification.remove();
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--card-bg);
        color: var(--text-white);
        padding: 1rem 1.5rem;
        border-radius: 10px;
        border: 1px solid var(--primary-red);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        animation: slideInRight 0.3s ease;
        font-weight: 600;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

window.clearCart = clearCart;
