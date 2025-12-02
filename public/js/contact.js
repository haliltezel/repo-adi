// Contact page JavaScript functionality

function initContactPage() {
    setupContactForm();
}

function setupContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    
    form.addEventListener('submit', handleFormSubmit);
    
    // Real-time validation
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Clear previous errors
    clearFieldError(event);
    
    switch(field.type) {
        case 'text':
            if (field.name === 'name') {
                if (!value) {
                    isValid = false;
                    errorMessage = 'Ad soyad alanı zorunludur.';
                } else if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Ad soyad en az 2 karakter olmalıdır.';
                }
            }
            break;
            
        case 'email':
            if (!value) {
                isValid = false;
                errorMessage = 'E-posta alanı zorunludur.';
            } else {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Geçerli bir e-posta adresi giriniz.';
                }
            }
            break;
            
        case 'tel':
            if (value && !/^\+?[\d\s\-\(\)]{10,}$/.test(value)) {
                isValid = false;
                errorMessage = 'Geçerli bir telefon numarası giriniz.';
            }
            break;
            
        case 'textarea':
            if (!value) {
                isValid = false;
                errorMessage = 'Mesaj alanı zorunludur.';
            } else if (value.length < 10) {
                isValid = false;
                errorMessage = 'Mesaj en az 10 karakter olmalıdır.';
            }
            break;
    }
    
    if (!isValid) {
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

function clearFieldError(event) {
    const field = event.target;
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
    field.classList.remove('border-red-500');
}

function showFieldError(field, message) {
    field.classList.add('border-red-500');
    
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error text-red-500 text-sm mt-1';
    errorElement.textContent = message;
    
    field.parentNode.appendChild(errorElement);
}

async function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const submitBtn = document.getElementById('submit-btn');
    const submitText = document.getElementById('submit-text');
    const submitLoading = document.getElementById('submit-loading');
    
    // Validate all fields
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isFormValid = true;
    
    inputs.forEach(input => {
        if (!validateField({ target: input })) {
            isFormValid = false;
        }
    });
    
    // Check privacy checkbox
    const privacyCheckbox = document.getElementById('privacy');
    if (!privacyCheckbox.checked) {
        isFormValid = false;
        showFieldError(privacyCheckbox.parentNode, 'Gizlilik politikasını kabul etmelisiniz.');
    }
    
    if (!isFormValid) {
        ASMUtils.showNotification('Lütfen formu doğru şekilde doldurun.', 'error');
        return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    submitText.classList.add('hidden');
    submitLoading.classList.remove('hidden');
    
    try {
        const response = await fetch('/api/contact/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                subject: formData.get('subject'),
                message: formData.get('message')
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Success
            ASMUtils.showNotification(result.message || 'Mesajınız başarıyla gönderildi. En kısa sürede sizinle iletişime geçeceğiz.', 'success');
            form.reset();
            
            // Clear any remaining error states
            const errorElements = form.querySelectorAll('.field-error');
            errorElements.forEach(el => el.remove());
            
            const errorFields = form.querySelectorAll('.border-red-500');
            errorFields.forEach(field => field.classList.remove('border-red-500'));
            
        } else {
            // Error
            if (result.errors && result.errors.length > 0) {
                ASMUtils.showNotification(result.errors[0].msg || 'Form gönderilirken bir hata oluştu.', 'error');
            } else {
                ASMUtils.showNotification(result.message || 'Form gönderilirken bir hata oluştu.', 'error');
            }
        }
        
    } catch (error) {
        console.error('Form submission error:', error);
        ASMUtils.showNotification('Form gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.', 'error');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitText.classList.remove('hidden');
        submitLoading.classList.add('hidden');
    }
}

// Auto-resize textarea
document.addEventListener('DOMContentLoaded', function() {
    const messageTextarea = document.getElementById('message');
    if (messageTextarea) {
        messageTextarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }
});

// Phone number formatting
document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length > 0) {
                if (value.length <= 3) {
                    value = value;
                } else if (value.length <= 6) {
                    value = value.slice(0, 3) + ' ' + value.slice(3);
                } else if (value.length <= 8) {
                    value = value.slice(0, 3) + ' ' + value.slice(3, 6) + ' ' + value.slice(6);
                } else {
                    value = value.slice(0, 3) + ' ' + value.slice(3, 6) + ' ' + value.slice(6, 8) + ' ' + value.slice(8, 10) + ' ' + value.slice(10, 12);
                }
            }
            
            e.target.value = value;
        });
    }
});

// Smooth scroll to form when coming from other pages
function scrollToForm() {
    const form = document.getElementById('contact-form');
    if (form) {
        form.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }
}

// Export functions
window.ContactPage = {
    initContactPage,
    scrollToForm
};