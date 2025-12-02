// Main JavaScript file for ASM Endüstri website

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
    
    // Initialize page-specific functions
    const currentPage = window.location.pathname.split('/').pop() || 'index';
    
    switch(currentPage) {
        case 'index':
        case '':
            initHomePage();
            break;
        case 'urunler':
            initProductsPage();
            break;
        case 'iletisim':
            initContactPage();
            break;
    }
    
    // Initialize WhatsApp float button
    initWhatsAppButton();
    
    // Initialize scroll animations
    initScrollAnimations();
});

// Home page initialization
function initHomePage() {
    loadFeaturedProducts();
}

// Load featured products for homepage
async function loadFeaturedProducts() {
    try {
        const response = await fetch('/api/products?limit=8');
        const products = await response.json();
        
        const productsGrid = document.getElementById('products-grid');
        if (productsGrid) {
            productsGrid.innerHTML = products.map(product => createProductCard(product)).join('');
        }
    } catch (error) {
        console.error('Error loading featured products:', error);
        const productsGrid = document.getElementById('products-grid');
        if (productsGrid) {
            productsGrid.innerHTML = '<div class="col-span-full text-center text-gray-500">Ürünler yüklenirken bir hata oluştu.</div>';
        }
    }
}

// Create product card HTML
function createProductCard(product) {
    const imageUrl = product.image_path || '/images/placeholder-product.jpg';
    const price = product.price ? `₺${product.price}` : 'Fiyat Sorunuz';
    
    return `
        <div class="product-card card-hover">
            <div class="aspect-w-16 aspect-h-12">
                <img src="${imageUrl}" alt="${product.name}" class="w-full h-48 object-cover">
            </div>
            <div class="p-6">
                <div class="mb-2">
                    <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        ${product.category || 'Diğer'}
                    </span>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">${product.name}</h3>
                <p class="text-gray-600 text-sm mb-4 line-clamp-2">${product.description || ''}</p>
                <div class="flex justify-between items-center">
                    <span class="text-xl font-bold text-blue-600">${price}</span>
                    <button onclick="viewProductDetails(${product.id})" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        İncele
                    </button>
                </div>
            </div>
        </div>
    `;
}

// View product details
function viewProductDetails(productId) {
    window.location.href = `/urunler#product-${productId}`;
}

// WhatsApp button functionality
function initWhatsAppButton() {
    const whatsappButton = document.querySelector('.whatsapp-float a');
    if (whatsappButton) {
        whatsappButton.addEventListener('click', function(e) {
            // Add analytics or tracking here if needed
            console.log('WhatsApp button clicked');
        });
    }
}

// Scroll animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements with animation classes
    const animatedElements = document.querySelectorAll('.card-hover, .product-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Utility functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white font-semibold z-50 ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        'bg-blue-500'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Form validation helper
function validateForm(formData) {
    const errors = [];
    
    if (!formData.get('name') || formData.get('name').trim().length < 2) {
        errors.push('Ad soyad alanı en az 2 karakter olmalıdır.');
    }
    
    const email = formData.get('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.push('Geçerli bir e-posta adresi giriniz.');
    }
    
    const phone = formData.get('phone');
    if (phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(phone)) {
        errors.push('Geçerli bir telefon numarası giriniz.');
    }
    
    if (!formData.get('message') || formData.get('message').trim().length < 10) {
        errors.push('Mesaj alanı en az 10 karakter olmalıdır.');
    }
    
    if (!formData.get('privacy')) {
        errors.push('Gizlilik politikasını kabul etmelisiniz.');
    }
    
    return errors;
}

// API error handler
function handleApiError(error, customMessage = 'Bir hata oluştu.') {
    console.error('API Error:', error);
    showNotification(customMessage, 'error');
}

// Loading state manager
function setLoadingState(element, isLoading, loadingText = 'Yükleniyor...') {
    if (!element) return;
    
    if (isLoading) {
        element.classList.add('loading');
        element.disabled = true;
        element.dataset.originalText = element.textContent;
        element.textContent = loadingText;
    } else {
        element.classList.remove('loading');
        element.disabled = false;
        element.textContent = element.dataset.originalText || element.textContent;
    }
}

// Export functions for use in other files
window.ASMUtils = {
    showNotification,
    validateForm,
    handleApiError,
    setLoadingState,
    createProductCard
};