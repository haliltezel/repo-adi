const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Database connection
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'asm_endustri',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Sample products data
const sampleProducts = [
    {
        name: 'Mercedes Actros Motor Parçası',
        description: 'Mercedes Actros serisi için orijinal motor parçası. Yüksek kalite ve dayanıklılık garantisi.',
        category: 'mercedes',
        price: 1250.00,
        specifications: JSON.stringify({
            'Model': 'Actros 1841',
            'Yıl': '2018-2022',
            'Malzeme': 'Çelik döküm',
            'Garanti': '2 yıl'
        })
    },
    {
        name: 'Scania R Serisi Fren Balatası',
        description: 'Scania R serisi kamyonlar için ön fren balatası. Avrupa standartlarında üretilmiştir.',
        category: 'scania',
        price: 89.50,
        specifications: JSON.stringify({
            'Model': 'R420, R480, R520',
            'Malzeme': 'Sinter metal',
            'Standart': 'ECE R90',
            'Kod': 'SCAN-FB-001'
        })
    },
    {
        name: 'Renault Premium Direksiyon Kutusu',
        description: 'Renault Premium serisi için direksiyon kutusu. Hidrolik destekli, hassas kontrol sağlar.',
        category: 'renault',
        price: 2100.00,
        specifications: JSON.stringify({
            'Model': 'Premium 420 DXI',
            'Tip': 'Hidrolik',
            'Oran': '16:1',
            'Garanti': '3 yıl'
        })
    },
    {
        name: 'Man TGS Şanzıman Parçası',
        description: 'Man TGS serisi için şanzıman tamiri parça seti. Orijinal kalite, uygun fiyat.',
        category: 'man',
        price: 3450.00,
        specifications: JSON.stringify({
            'Model': 'TGS 18.400',
            'Vites': '12+2',
            'Malzeme': 'Alaşım çelik',
            'Kod': 'MAN-SPZ-400'
        })
    },
    {
        name: 'Mercedes Axor Egzoz Sistemi',
        description: 'Mercedes Axor için komple egzoz sistemi. Euro 5 normlarına uygun, paslanmaz çelik.',
        category: 'mercedes',
        price: 1850.00,
        specifications: JSON.stringify({
            'Model': 'Axor 1840',
            'Emisyon': 'Euro 5',
            'Malzeme': 'Paslanmaz çelik',
            'Garanti': '5 yıl'
        })
    },
    {
        name: 'Scania Streamline Far Grubu',
        description: 'Scania Streamline için LED far grubu. Yüksek görüş açısı, uzun ömürlü LED teknolojisi.',
        category: 'scania',
        price: 1650.00,
        specifications: JSON.stringify({
            'Model': 'Streamline R',
            'Tip': 'LED',
            'Güç': '120W',
            'Renk': 'Beyaz'
        })
    },
    {
        name: 'Renault Kerax Debriyaj Seti',
        description: 'Renault Kerax için debriyaj disk ve baskı seti. Yüksek tork kapasitesi, uzun ömürlü.',
        category: 'renault',
        price: 1250.00,
        specifications: JSON.stringify({
            'Model': 'Kerax 370',
            'Çap': '380mm',
            'Tork': '1850 Nm',
            'Malzeme': 'Sinter metal'
        })
    },
    {
        name: 'Man TGX Yüksek Basınç Pompası',
        description: 'Man TGX için yüksek basınç yakıt pompası. Orijinal Bosch üretimi, kalite garantisi.',
        category: 'man',
        price: 2850.00,
        specifications: JSON.stringify({
            'Model': 'TGX 18.440',
            'Basınç': '1800 bar',
            'Marka': 'Bosch',
            'Garanti': '2 yıl'
        })
    },
    {
        name: 'Mercedes Atego Hava Filtresi',
        description: 'Mercedes Atego için hava filtresi. Yüksek filtrasyon verimi, uzun servis aralığı.',
        category: 'mercedes',
        price: 125.00,
        specifications: JSON.stringify({
            'Model': 'Atego 815',
            'Tip': 'Kuru',
            'Verim': '99.5%',
            'Kod': 'MB-HF-815'
        })
    },
    {
        name: 'Scania R Series Yağ Filtresi',
        description: 'Scania R serisi için yağ filtresi. Orijinal Scania kalitesi, motor koruma sağlar.',
        category: 'scania',
        price: 85.00,
        specifications: JSON.stringify({
            'Model': 'R420, R480',
            'Kapasite': '2.5L',
            'Malzeme': 'Selüloz',
            'Değişim': '30.000 km'
        })
    }
];

async function seedDatabase() {
    try {
        console.log('Veritabanı seed işlemi başlatılıyor...');
        
        // Create tables if not exist
        await createTables();
        
        // Insert admin user
        await insertAdminUser();
        
        // Insert sample products
        await insertSampleProducts();
        
        console.log('Veritabanı seed işlemi başarıyla tamamlandı!');
        
    } catch (error) {
        console.error('Seed işlemi sırasında hata oluştu:', error);
    } finally {
        await pool.end();
    }
}

async function createTables() {
    // Users table
    await pool.execute(`
        CREATE TABLE IF NOT EXISTS users (
            id INT PRIMARY KEY AUTO_INCREMENT,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role ENUM('admin', 'user') DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    // Products table
    await pool.execute(`
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
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);
    
    // Gallery table
    await pool.execute(`
        CREATE TABLE IF NOT EXISTS gallery (
            id INT PRIMARY KEY AUTO_INCREMENT,
            title VARCHAR(255),
            description TEXT,
            image_path VARCHAR(500) NOT NULL,
            category VARCHAR(100),
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    // Contact messages table
    await pool.execute(`
        CREATE TABLE IF NOT EXISTS contact_messages (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(50),
            subject VARCHAR(255),
            message TEXT NOT NULL,
            is_read BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    console.log('Tablolar oluşturuldu veya zaten mevcut.');
}

async function insertAdminUser() {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await pool.execute(
        'INSERT IGNORE INTO users (email, password, role) VALUES (?, ?, ?)',
        ['admin@asmendustri.com', hashedPassword, 'admin']
    );
    
    console.log('Admin kullanıcısı eklendi veya zaten mevcut.');
}

async function insertSampleProducts() {
    // Check if products already exist
    const [existingProducts] = await pool.execute('SELECT COUNT(*) as count FROM products');
    
    if (existingProducts[0].count > 0) {
        console.log('Ürünler zaten mevcut, örnek ürünler eklenmedi.');
        return;
    }
    
    for (const product of sampleProducts) {
        await pool.execute(
            'INSERT INTO products (name, description, category, price, specifications) VALUES (?, ?, ?, ?, ?)',
            [product.name, product.description, product.category, product.price, product.specifications]
        );
    }
    
    console.log('Örnek ürünler başarıyla eklendi.');
}

// Run the seed script
seedDatabase();