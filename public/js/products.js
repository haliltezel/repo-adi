// Products page JavaScript functionality

let currentPage = 1;
let currentCategory = 'all';
let currentSearch = '';
let isLoading = false;
let hasMoreProducts = true;

function initProductsPage() {
    setupEventListeners();
    loadProducts();
}

function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    // Category filters
    const filterButtons = document.querySelectorAll('.filter-button');
    filterButtons.forEach(button => {
        button.addEventListener('click', handleCategoryFilter);
    });
    
    // Load more button
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreProducts);
    }
    
    // Product modal
    setupModal();
}

function handleSearch(event) {
    currentSearch = event.target.value;
    currentPage = 1;
    hasMoreProducts = true;
    loadProducts(true);
}

function handleCategoryFilter(event) {
    // Update active button
    document.querySelectorAll('.filter-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    currentCategory = event.target.dataset.category;
    currentPage = 1;
    hasMoreProducts = true;
    loadProducts(true);
}

async function loadProducts(reset = false) {
    if (isLoading || !hasMoreProducts) return;
    
    isLoading = true;
    const productsGrid = document.getElementById('products-grid');
    const loadingState = document.getElementById('loading-state');
    const noResults = document.getElementById('no-results');
    
    if (reset) {
        productsGrid.innerHTML = '';
        productsGrid.classList.add('hidden');
        loadingState.classList.remove('hidden');
    }
    
    try {
        const params = new URLSearchParams({
            page: currentPage,
            limit: 12,
            search: currentSearch
        });
        
        if (currentCategory !== 'all') {
            params.append('category', currentCategory);
        }
        
        const response = await fetch(`/api/products?${params}`);
        const data = await response.json();
        
        if (reset) {
            loadingState.classList.add('hidden');
            productsGrid.classList.remove('hidden');
        }
        
        if (data.length === 0) {
            if (reset) {
                noResults.classList.remove('hidden');
                document.getElementById('load-more-container').classList.add('hidden');
            }
            hasMoreProducts = false;
        } else {
            noResults.classList.add('hidden');
            
            if (reset) {
                productsGrid.innerHTML = data.map(product => createProductCard(product)).join('');
            } else {
                productsGrid.innerHTML += data.map(product => createProductCard(product)).join('');
            }
            
            // Update load more button visibility
            const loadMoreContainer = document.getElementById('load-more-container');
            if (data.length === 12) {
                loadMoreContainer.classList.remove('hidden');
            } else {
                loadMoreContainer.classList.add('hidden');
                hasMoreProducts = false;
            }
        }
        
        currentPage++;
        
    } catch (error) {
        console.error('Error loading products:', error);
        ASMUtils.handleApiError(error, 'Ürünler yüklenirken bir hata oluştu.');
    } finally {
        isLoading = false;
    }
}

function loadMoreProducts() {
    loadProducts(false);
}

// Enhanced product card with modal support
function createProductCard(product) {
    const imageUrl = product.image_path || '/images/placeholder-product.jpg';
    const price = product.price ? `₺${product.price}` : 'Fiyat Sorunuz';
    
    return `
        <div class="product-card card-hover" data-product-id="${product.id}">
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
                <div class="flex justify-between items-center mb-4">
                    <span class="text-xl font-bold text-blue-600">${price}</span>
                    ${product.catalog_path ? '<span class="text-xs text-green-600"><i class="fas fa-file-pdf mr-1"></i>Katalog</span>' : ''}
                </div>
                <div class="flex gap-2">
                    <button onclick="openProductModal(${product.id})" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        İncele
                    </button>
                    ${product.catalog_path ? `
                        <a href="${product.catalog_path}" target="_blank" class="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition-colors">
                            <i class="fas fa-download"></i>
                        </a>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

// Modal functionality
function setupModal() {
    const modal = document.getElementById('product-modal');
    const closeBtn = document.getElementById('close-modal');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeProductModal);
    }
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeProductModal();
            }
        });
    }
    
    // Contact button in modal
    const modalContact = document.getElementById('modal-contact');
    if (modalContact) {
        modalContact.addEventListener('click', function() {
            closeProductModal();
            window.location.href = '/iletisim';
        });
    }
}

async function openProductModal(productId) {
    try {
        const response = await fetch(`/api/products/${productId}`);
        const product = await response.json();
        
        if (!response.ok) {
            throw new Error('Product not found');
        }
        
        populateModal(product);
        document.getElementById('product-modal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
    } catch (error) {
        console.error('Error loading product details:', error);
        ASMUtils.showNotification('Ürün detayları yüklenirken bir hata oluştu.', 'error');
    }
}

function closeProductModal() {
    document.getElementById('product-modal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function populateModal(product) {
    document.getElementById('modal-title').textContent = product.name;
    document.getElementById('modal-category').textContent = product.category || 'Diğer';
    document.getElementById('modal-description').textContent = product.description || 'Açıklama bulunmuyor.';
    document.getElementById('modal-price').textContent = product.price ? `₺${product.price}` : 'Fiyat Sorunuz';
    
    // Product image
    const modalImage = document.getElementById('modal-image');
    modalImage.src = product.image_path || '/images/placeholder-product.jpg';
    modalImage.alt = product.name;
    
    // Specifications
    const specsContent = document.getElementById('specs-content');
    if (product.specifications && Object.keys(product.specifications).length > 0) {
        const specs = product.specifications;
        let specsHtml = '<div class="space-y-2">';
        
        for (const [key, value] of Object.entries(specs)) {
            specsHtml += `
                <div class="flex justify-between py-1 border-b border-gray-100">
                    <span class="text-gray-600">${key}:</span>
                    <span class="font-medium">${value}</span>
                </div>
            `;
        }
        
        specsHtml += '</div>';
        specsContent.innerHTML = specsHtml;
    } else {
        specsContent.innerHTML = '<p class="text-gray-500">Teknik özellik bilgisi bulunmuyor.</p>';
    }
    
    // Catalog button
    const modalCatalog = document.getElementById('modal-catalog');
    if (product.catalog_path) {
        modalCatalog.href = product.catalog_path;
        modalCatalog.target = '_blank';
        modalCatalog.classList.remove('hidden');
    } else {
        modalCatalog.classList.add('hidden');
    }
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export functions
window.ProductsPage = {
    initProductsPage,
    openProductModal,
    closeProductModal
};