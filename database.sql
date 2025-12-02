-- ASM Endüstri Web Sitesi Veritabanı SQL Dosyası
-- Oluşturma Tarihi: 2024-12-02
-- Veritabanı: asm_endustri

-- Veritabanı oluştur
CREATE DATABASE IF NOT EXISTS asm_endustri;
USE asm_endustri;

-- =====================================
-- 1. USERS TABLOSU (Kullanıcılar)
-- =====================================
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================
-- 2. PRODUCTS TABLOSU (Ürünler)
-- =====================================
CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    price DECIMAL(10,2),
    image_path VARCHAR(500),
    catalog_path VARCHAR(500),
    specifications JSON,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at),
    FULLTEXT idx_fulltext (name, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================
-- 3. GALLERY TABLOSU (Galeri)
-- =====================================
CREATE TABLE IF NOT EXISTS gallery (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255),
    description TEXT,
    image_path VARCHAR(500) NOT NULL,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================
-- 4. CONTACT_MESSAGES TABLOSU (İletişim Mesajları)
-- =====================================
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_is_read (is_read),
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================
-- 5. VARSAYILAN VERİLER
-- =====================================

-- Varsayılan admin kullanıcı (şifre: admin123)
INSERT IGNORE INTO users (email, password, role) VALUES (
    'admin@asmendustri.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin'
);

-- Örnek Ürünler
INSERT IGNORE INTO products (name, description, category, price, image_path, is_active) VALUES
('Otomotiv Yedek Parça 1', 'Yüksek kaliteli otomotiv yedek parçası', 'Yedek Parçalar', 150.00, '/uploads/products/images/sample1.jpg', true),
('Otomotiv Yedek Parça 2', 'Sertifikalı ve test edilmiş ürün', 'Yedek Parçalar', 200.00, '/uploads/products/images/sample2.jpg', true),
('Otomotiv Yedek Parça 3', 'Uzun ömürlü ve dayanıklı', 'Ürünler', 180.00, '/uploads/products/images/sample3.jpg', true);

-- Örnek Galeri Görselleri
INSERT IGNORE INTO gallery (title, description, image_path, category, is_active) VALUES
('Fabrika 1', 'ASM Endüstri fabrika görüntüsü', '/uploads/gallery/factory1.jpg', 'Fabrika', true),
('Fabrika 2', 'Üretim hattı', '/uploads/gallery/factory2.jpg', 'Fabrika', true),
('Ürünler', 'Ürün görseli', '/uploads/gallery/products.jpg', 'Ürünler', true);

-- =====================================
-- 6. VERİ TABANINDA İSTATİSTİK İÇİN VIEW'LAR (İsteğe bağlı)
-- =====================================

-- Toplam ürün sayısı ve aktif ürün sayısı
-- Toplam mesaj sayısı ve okunmamış mesajlar
-- SELECT COUNT(*) as total_products FROM products;
-- SELECT COUNT(*) as total_active_products FROM products WHERE is_active = true;
-- SELECT COUNT(*) as total_messages FROM contact_messages;
-- SELECT COUNT(*) as unread_messages FROM contact_messages WHERE is_read = false;

-- =====================================
-- 7. BACKUP VE RESTORE NOTLARI
-- =====================================
-- BACKUP ALMAK İÇİN:
-- mysqldump -u root -p asm_endustri > backup.sql
--
-- RESTORE ETMEK İÇİN:
-- mysql -u root -p asm_endustri < backup.sql
