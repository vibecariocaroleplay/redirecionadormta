// Dashboard JavaScript

// Check if user is logged in
document.addEventListener('DOMContentLoaded', () => {
    const user = localStorage.getItem('discord_user');
    
    if (!user) {
        // Redirect to home if not logged in
        window.location.href = 'index.html';
        return;
    }
    
    const userData = JSON.parse(user);
    loadDashboard(userData);
});

// Load dashboard data
function loadDashboard(userData) {
    // Update user info in header
    const dashboardAvatar = document.getElementById('dashboardAvatar');
    const dashboardUsername = document.getElementById('dashboardUsername');
    
    // Get Discord avatar URL (support for GIF)
    const avatarExtension = userData.avatar?.startsWith('a_') ? 'gif' : 'png';
    const avatarUrl = userData.avatar 
        ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.${avatarExtension}?size=256`
        : `https://cdn.discordapp.com/embed/avatars/${parseInt(userData.discriminator) % 5}.png`;
    
    dashboardAvatar.src = avatarUrl;
    dashboardUsername.textContent = `${userData.username}#${userData.discriminator}`;
    
    // Load user dropdown in nav
    loadUserDropdown(userData, avatarUrl);
    
    // Load purchased products
    loadPurchasedProducts();
    
    // Update stats
    updateStats();
}

// Load user dropdown
function loadUserDropdown(userData, avatarUrl) {
    const userInfoNav = document.getElementById('userInfoNav');
    
    userInfoNav.innerHTML = `
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
    `;
}

// Toggle user dropdown
function toggleUserDropdown() {
    const trigger = document.querySelector('.user-dropdown-trigger');
    const menu = document.getElementById('userDropdownMenu');
    
    trigger.classList.toggle('active');
    menu.classList.toggle('active');
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const dropdown = document.querySelector('.user-info-nav');
    if (dropdown && !dropdown.contains(e.target)) {
        const trigger = document.querySelector('.user-dropdown-trigger');
        const menu = document.getElementById('userDropdownMenu');
        if (trigger && menu) {
            trigger.classList.remove('active');
            menu.classList.remove('active');
        }
    }
});

// Load purchased products
function loadPurchasedProducts() {
    const purchasedProducts = JSON.parse(localStorage.getItem('purchased_products') || '[]');
    const productsContent = document.getElementById('purchasedProducts');
    
    if (purchasedProducts.length === 0) {
        // Show empty state (already in HTML)
        return;
    }
    
    productsContent.innerHTML = `
        <div class="purchased-products-grid">
            ${purchasedProducts.map(product => `
                <div class="purchased-product-card">
                    <div class="purchased-product-image">
                        ${product.imageUrl ? 
                            `<img src="${product.imageUrl}" alt="${product.name}">` : 
                            getProductIcon(product.category)
                        }
                    </div>
                    <div class="purchased-product-info">
                        <div class="purchased-product-category">${product.category}</div>
                        <h3 class="purchased-product-name">${product.name}</h3>
                        
                        <div class="activation-code-section">
                            <span class="code-label">Código de Ativação</span>
                            <div class="code-display">
                                <span class="code-text" id="code-${product.id}">${product.activationCode}</span>
                                <button class="copy-code-btn" onclick="copyActivationCode('${product.activationCode}', ${product.id})">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <rect x="5" y="5" width="9" height="9" rx="1" stroke="currentColor" stroke-width="2"/>
                                        <path d="M3 11V3a1 1 0 0 1 1-1h8" stroke="currentColor" stroke-width="2"/>
                                    </svg>
                                    Copiar
                                </button>
                            </div>
                        </div>
                        
                        <p class="purchase-date">Comprado em ${new Date(product.purchaseDate).toLocaleDateString('pt-BR')}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Copy activation code
function copyActivationCode(code, productId) {
    navigator.clipboard.writeText(code).then(() => {
        showNotification('Código copiado para a área de transferência!');
        
        // Visual feedback
        const button = event.target.closest('.copy-code-btn');
        const originalText = button.innerHTML;
        button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M13 4L6 11 3 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Copiado!
        `;
        
        setTimeout(() => {
            button.innerHTML = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        showNotification('Erro ao copiar código. Tente novamente.');
    });
}

// Update stats
function updateStats() {
    const purchasedProducts = JSON.parse(localStorage.getItem('purchased_products') || '[]');
    
    document.getElementById('totalOrders').textContent = purchasedProducts.length;
    document.getElementById('availableCodes').textContent = purchasedProducts.length;
    document.getElementById('itemsInBox').textContent = purchasedProducts.length;
}

// Logout function (reuse from index.js)
function handleLogout() {
    localStorage.removeItem('discord_user');
    localStorage.removeItem('discord_token');
    showNotification('Logout realizado com sucesso!');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Notification function
function showNotification(message) {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
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

// Get product icon (same as index.js)
function getProductIcon(category) {
    const icons = {
        'Veículos': `<svg width="60" height="60" viewBox="0 0 60 60" fill="none">
            <path d="M10 39h40M15 24l-4.5 15h39L45 24M15 24l3-9h24l3 9M15 24h30" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            <circle cx="18" cy="48" r="4.5" stroke="currentColor" stroke-width="2.5"/>
            <circle cx="42" cy="48" r="4.5" stroke="currentColor" stroke-width="2.5"/>
        </svg>`,
        'Armas': `<svg width="60" height="60" viewBox="0 0 60 60" fill="none">
            <path d="M9 30l24-21 18 18-21 24-21-21zm30-12l12-3-3 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`,
        'Roupas': `<svg width="60" height="60" viewBox="0 0 60 60" fill="none">
            <path d="M18 9L12 21v30h12V27l6-6 6 6v24h12V21l-6-12-12 6-12-6z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`,
        'VIPs': `<svg width="60" height="60" viewBox="0 0 60 60" fill="none">
            <path d="M30 6l7.5 15 16.5 2.4-12 11.7 3 15.9-15-7.8-15 7.8 3-15.9-12-11.7 16.5-2.4L30 6z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`,
        'Organizações': `<svg width="60" height="60" viewBox="0 0 60 60" fill="none">
            <path d="M51 54v-6a12 12 0 0 0-12-12H21a12 12 0 0 0-12 12v6M39 15a12 12 0 1 1-24 0 12 12 0 0 1 24 0z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`
    };
    
    return icons[category] || icons['Veículos'];
}
