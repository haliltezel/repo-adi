// Admin panel JavaScript functionality

let currentSection = 'dashboard';
let currentProductId = null;

function initAdminPanel() {
    checkAuth();
    setupEventListeners();
    loadDashboard();
}

function checkAuth() {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    if (!token) {
        window.location.href = '/admin';
        return;
    }
    
    // Verify token
    fetch('/api/auth/verify', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (!data.valid) {
            localStorage.removeItem('authToken');
            sessionStorage.removeItem('authToken');
            window.location.href = '/admin';
        } else {
            document.getElementById('user-email').textContent = data.user.email;
            loadDashboard();
        }
    })
    .catch(error => {
        console.error('Auth check error:', error);
        window.location.href = '/admin';
    });
}

function setupEventListeners() {
    // Sidebar navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const section = this.dataset.section;
            switchSection(section);
        });
    });
    
    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('-translate-x-full');
        });
    }
    
    // User menu
    const userMenu = document.getElementById('user-menu');
    const userDropdown = document.getElementById('user-dropdown');
    
    if (userMenu && userDropdown) {
        userMenu.addEventListener('click', function() {
            userDropdown.classList.toggle('hidden');
        });
        
        document.addEventListener('click', function(e) {
            if (!userMenu.contains(e.target)) {
                userDropdown.classList.add('hidden');
            }
        });
    }
    
    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            logout();
        });
    }
    
    // Refresh data
    const refreshBtn = document.getElementById('refresh-data');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            loadCurrentSection();
        });
    }
    
    // Product modal
    setupProductModal();
}

function switchSection(section) {
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.add('hidden');
    });
    
    // Show selected section
    document.getElementById(`${section}-section`).classList.remove('hidden');
    
    currentSection = section;
    loadCurrentSection();
}

function loadCurrentSection() {
    switch(currentSection) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'products':
            loadProducts();
            break;
        case 'messages':
            loadMessages();
            break;
        case 'gallery':
            loadGallery();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// Dashboard functions
async function loadDashboard() {
    try {
        const token = getAuthToken();
        
        // Load stats
        const [productsResponse, messagesResponse] = await Promise.all([
            fetch('/api/products?limit=1', {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch('/api/contact/messages', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ]);
        
        const products = await productsResponse.json();
        const messages = await messagesResponse.json();
        
        // Update stats
        document.getElementById('total-products').textContent = products.length || 0;
        document.getElementById('new-messages').textContent = messages.filter(m => !m.is_read).length;
        document.getElementById('gallery-images').textContent = '12'; // Mock data
        
        // Load recent activity
        loadRecentActivity();
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showMessage('Dashboard verileri yüklenirken bir hata oluştu.', 'error');
    }
}

function loadRecentActivity() {
    const activities = [
        { type: 'product', text: 'Yeni ürün eklendi: Mercedes E Serisi Far', time: '2 saat önce' },
        { type: 'message', text: 'Yeni iletişim mesajı - Ahmet Yılmaz', time: '4 saat önce' },
        { type: 'login', text: 'Admin girişi yapıldı', time: '6 saat önce' },
        { type: 'product', text: 'Ürün güncellendi: Scania R420 Motor', time: '1 gün önce' }
    ];
    
    const activityContainer = document.getElementById('recent-activity');
    activityContainer.innerHTML = activities.map(activity => `
        <div class="flex items-center p-3 bg-gray-50 rounded-lg">
            <div class="flex-shrink-0">
                <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <i class="fas ${getActivityIcon(activity.type)} text-blue-600 text-sm"></i>
                </div>
            </div>
            <div class="ml-4 flex-1">
                <p class="text-sm font-medium text-gray-900">${activity.text}</p>
                <p class="text-xs text-gray-500">${activity.time}</p>
            </div>
        </div>
    `).join('');
}

function getActivityIcon(type) {
    switch(type) {
        case 'product': return 'fa-boxes';
        case 'message': return 'fa-envelope';
        case 'login': return 'fa-sign-in-alt';
        default: return 'fa-info-circle';
    }
}

// Products functions
async function loadProducts() {
    try {
        const token = getAuthToken();
        const response = await fetch('/api/products', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const products = await response.json();
        
        const tbody = document.getElementById('products-table-body');
        tbody.innerHTML = products.map(product => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                            <img class="h-10 w-10 rounded-lg object-cover" src="${product.image_path || '/images/placeholder-product.jpg'}" alt="${product.name}">
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${product.name}</div>
                            <div class="text-sm text-gray-500">${product.description ? product.description.substring(0, 50) + '...' : ''}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        ${product.category || 'Diğer'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${product.price ? '₺' + product.price : 'Fiyat Yok'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${product.is_active ? 'Aktif' : 'Pasif'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="editProduct(${product.id})" class="text-blue-600 hover:text-blue-900 mr-3">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteProduct(${product.id})" class="text-red-600 hover:text-red-900">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading products:', error);
        showMessage('Ürünler yüklenirken bir hata oluştu.', 'error');
    }
}

// Messages functions
async function loadMessages() {
    try {
        const token = getAuthToken();
        const response = await fetch('/api/contact/messages', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const messages = await response.json();
        
        const tbody = document.getElementById('messages-table-body');
        tbody.innerHTML = messages.map(message => `
            <tr class="${!message.is_read ? 'bg-blue-50' : ''}">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${message.name}</div>
                    <div class="text-sm text-gray-500">${message.email}</div>
                    <div class="text-sm text-gray-500">${message.phone || ''}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900">${message.subject || 'Konu Yok'}</div>
                    <div class="text-sm text-gray-500">${message.message.substring(0, 100)}...</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${new Date(message.created_at).toLocaleDateString('tr-TR')}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${message.is_read ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}">
                        ${message.is_read ? 'Okundu' : 'Yeni'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="viewMessage(${message.id})" class="text-blue-600 hover:text-blue-900 mr-3">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="markMessageAsRead(${message.id})" class="text-green-600 hover:text-green-900 mr-3">
                        <i class="fas fa-check"></i>
                    </button>
                    <button onclick="deleteMessage(${message.id})" class="text-red-600 hover:text-red-900">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading messages:', error);
        showMessage('Mesajlar yüklenirken bir hata oluştu.', 'error');
    }
}

// Gallery functions
function loadGallery() {
    const galleryGrid = document.getElementById('gallery-grid');
    galleryGrid.innerHTML = `
        <div class="col-span-full text-center text-gray-500 py-8">
            <i class="fas fa-images text-4xl mb-4"></i>
            <p>Galeri yönetimi yapım aşamasındadır.</p>
        </div>
    `;
}

// Settings functions
function loadSettings() {
    // Settings section is already populated with static content
}

// Product modal functions
function setupProductModal() {
    const modal = document.getElementById('product-modal');
    const closeBtn = document.getElementById('close-product-modal');
    const cancelBtn = document.getElementById('cancel-product');
    const form = document.getElementById('product-form');
    const addBtn = document.getElementById('add-product-btn');
    
    if (addBtn) {
        addBtn.addEventListener('click', () => openProductModal());
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeProductModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeProductModal);
    }
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeProductModal();
            }
        });
    }
    
    if (form) {
        form.addEventListener('submit', handleProductSubmit);
    }
    
    // Image preview
    const imageInput = document.getElementById('product-image');
    if (imageInput) {
        imageInput.addEventListener('change', handleImagePreview);
    }
}

function openProductModal(productId = null) {
    currentProductId = productId;
    const modal = document.getElementById('product-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('product-form');
    
    if (productId) {
        title.textContent = 'Ürün Düzenle';
        loadProductForEdit(productId);
    } else {
        title.textContent = 'Yeni Ürün Ekle';
        form.reset();
        currentProductId = null;
    }
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    
    // Reset form
    const form = document.getElementById('product-form');
    form.reset();
    currentProductId = null;
    
    // Hide image preview
    const imagePreview = document.getElementById('image-preview');
    imagePreview.classList.add('hidden');
}

async function loadProductForEdit(productId) {
    try {
        const token = getAuthToken();
        const response = await fetch(`/api/products/${productId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const product = await response.json();
        
        // Populate form
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-description').value = product.description || '';
        document.getElementById('product-price').value = product.price || '';
        document.getElementById('product-status').value = product.is_active ? '1' : '0';
        
        // Show image preview if exists
        if (product.image_path) {
            const imagePreview = document.getElementById('image-preview');
            const previewImg = document.getElementById('preview-img');
            previewImg.src = product.image_path;
            imagePreview.classList.remove('hidden');
        }
        
    } catch (error) {
        console.error('Error loading product:', error);
        showMessage('Ürün yüklenirken bir hata oluştu.', 'error');
    }
}

async function handleProductSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const saveBtn = document.getElementById('save-product');
    const saveText = document.getElementById('save-text');
    const saveLoading = document.getElementById('save-loading');
    
    // Show loading state
    saveBtn.disabled = true;
    saveText.classList.add('hidden');
    saveLoading.classList.remove('hidden');
    
    try {
        const token = getAuthToken();
        let imagePath = null;
        let catalogPath = null;
        
        // Handle image upload
        const imageInput = document.getElementById('product-image');
        if (imageInput && imageInput.files.length > 0) {
            const imageFormData = new FormData();
            imageFormData.append('product_image', imageInput.files[0]);
            
            const imageResponse = await fetch('/api/upload/product-image', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: imageFormData
            });
            
            if (imageResponse.ok) {
                const imageData = await imageResponse.json();
                imagePath = imageData.fileUrl;
            } else {
                throw new Error('Resim yüklenirken hata oluştu');
            }
        }
        
        // Handle catalog upload
        const catalogInput = document.getElementById('product-catalog');
        if (catalogInput && catalogInput.files.length > 0) {
            const catalogFormData = new FormData();
            catalogFormData.append('product_catalog', catalogInput.files[0]);
            
            const catalogResponse = await fetch('/api/upload/product-catalog', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: catalogFormData
            });
            
            if (catalogResponse.ok) {
                const catalogData = await catalogResponse.json();
                catalogPath = catalogData.fileUrl;
            } else {
                throw new Error('Katalog yüklenirken hata oluştu');
            }
        }
        
        // Save product
        const method = currentProductId ? 'PUT' : 'POST';
        const url = currentProductId ? `/api/products/${currentProductId}` : '/api/products';
        
        const productData = {
            name: document.getElementById('product-name').value,
            category: document.getElementById('product-category').value,
            description: document.getElementById('product-description').value,
            price: document.getElementById('product-price').value,
            is_active: document.getElementById('product-status').value === '1'
        };
        
        if (imagePath) productData.image_path = imagePath;
        if (catalogPath) productData.catalog_path = catalogPath;
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage(currentProductId ? 'Ürün başarıyla güncellendi.' : 'Ürün başarıyla eklendi.', 'success');
            closeProductModal();
            loadProducts();
        } else {
            showMessage(result.message || 'Ürün kaydedilirken bir hata oluştu.', 'error');
        }
        
    } catch (error) {
        console.error('Error saving product:', error);
        showMessage(error.message || 'Ürün kaydedilirken bir hata oluştu.', 'error');
    } finally {
        // Reset button state
        saveBtn.disabled = false;
        saveText.classList.remove('hidden');
        saveLoading.classList.add('hidden');
    }
}

function handleImagePreview(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imagePreview = document.getElementById('image-preview');
            const previewImg = document.getElementById('preview-img');
            previewImg.src = e.target.result;
            imagePreview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
}

// Product actions
async function editProduct(productId) {
    openProductModal(productId);
}

async function deleteProduct(productId) {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
        return;
    }
    
    try {
        const token = getAuthToken();
        const response = await fetch(`/api/products/${productId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            showMessage('Ürün başarıyla silindi.', 'success');
            loadProducts();
        } else {
            showMessage('Ürün silinirken bir hata oluştu.', 'error');
        }
        
    } catch (error) {
        console.error('Error deleting product:', error);
        showMessage('Ürün silinirken bir hata oluştu.', 'error');
    }
}

// Message actions
async function viewMessage(messageId) {
    // Mock implementation - would show message details
    showMessage('Mesaj detayları yapım aşamasındadır.', 'info');
}

async function markMessageAsRead(messageId) {
    try {
        const token = getAuthToken();
        const response = await fetch(`/api/contact/messages/${messageId}/read`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            showMessage('Mesaj okundu olarak işaretlendi.', 'success');
            loadMessages();
        } else {
            showMessage('Mesaj güncellenirken bir hata oluştu.', 'error');
        }
        
    } catch (error) {
        console.error('Error marking message as read:', error);
        showMessage('Mesaj güncellenirken bir hata oluştu.', 'error');
    }
}

async function deleteMessage(messageId) {
    if (!confirm('Bu mesajı silmek istediğinizden emin misiniz?')) {
        return;
    }
    
    try {
        const token = getAuthToken();
        const response = await fetch(`/api/contact/messages/${messageId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            showMessage('Mesaj başarıyla silindi.', 'success');
            loadMessages();
        } else {
            showMessage('Mesaj silinirken bir hata oluştu.', 'error');
        }
        
    } catch (error) {
        console.error('Error deleting message:', error);
        showMessage('Mesaj silinirken bir hata oluştu.', 'error');
    }
}

// Utility functions
function getAuthToken() {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
}

function logout() {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    window.location.href = '/admin';
}

function showMessage(message, type = 'info') {
    const container = document.getElementById('message-container');
    const content = document.getElementById('message-content');
    
    if (!container || !content) return;
    
    content.className = `p-4 rounded-lg shadow-lg text-white font-semibold ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        'bg-blue-500'
    }`;
    content.textContent = message;
    
    container.classList.remove('hidden');
    
    setTimeout(() => {
        container.classList.add('hidden');
    }, 5000);
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initAdminPanel();
});

function logout() {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    window.location.href = '/admin';
}

function showMessage(message, type = 'info') {
    const messageContainer = document.getElementById('message-container');
    const messageContent = document.getElementById('message-content');
    
    messageContent.className = `p-4 rounded-lg shadow-lg text-white font-semibold ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        'bg-blue-500'
    }`;
    messageContent.textContent = message;
    
    messageContainer.classList.remove('hidden');
    
    setTimeout(() => {
        messageContainer.classList.add('hidden');
    }, 5000);
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', initAdminPanel);