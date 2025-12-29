 Kurumsal Web Site

## Proje Açıklaması

web platformudur.

## Özellikler

### Frontend
- **Responsive Tasarım**: Tüm cihazlarda mükemmel görünüm
- **Modern UI/UX**: Profesyonel ve kullanıcı dostu arayüz
- **SEO Optimizasyonu**: Arama motorları için optimize edilmiş içerik
- **Hızlı Yükleme**: Optimize edilmiş görseller ve kod

### Backend
- **Node.js & Express.js**: Güçlü ve ölçeklenebilir backend altyapısı
- **MySQL Veritabanı**: Güvenilir veri saklama
- **JWT Authentication**: Güvenli admin girişi
- **File Upload**: Ürün görselleri ve katalog yönetimi

### Admin Paneli
- **Ürün Yönetimi**: CRUD işlemleri, kategori filtreleme
- **İletişim Formu Yönetimi**: Gelen mesajları okuma ve yönetme
- **Galeri Yönetimi**: Görsel yükleme ve düzenleme
- **İstatistikler**: Ziyaretçi ve ürün istatistikleri

## Teknolojiler

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Tailwind CSS
- Font Awesome Icons
- Google Fonts

### Backend
- Node.js
- Express.js
- MySQL
- JWT (JSON Web Tokens)
- Nodemailer (Email gönderimi)
- Multer (File upload)

## Kurulum

### Gereksinimler
- Node.js (v14 veya üzeri)
- MySQL (v5.7 veya üzeri)
- NPM veya Yarn

### Adım Adım Kurulum

1. **Projeyi Klonlayın**
```bash
git clone https://github.com/asmendustri/asm-website.git
cd asm-website
```

2. **Bağımlılıkları Yükleyin**
```bash
npm install
```

3. **Veritabanını Oluşturun**
```sql
CREATE DATABASE asm_endustri;
```

4. **Çevre Değişkenlerini Ayarlayın**
`.env` dosyasını oluşturun ve aşağıdaki değerleri girin:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=asm_endustri
DB_PORT=3306

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Admin Credentials
ADMIN_EMAIL=admin@asmendustri.com
ADMIN_PASSWORD=$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
```

5. **Veritabanını Başlatın**
```bash
node server.js
```

Uygulama `http://localhost:3000` adresinde çalışmaya başlayacaktır.

## Kullanım

### Admin Paneli Girişi
- URL: `http://localhost:3000/admin`
- Varsayılan Kullanıcı Adı: `admin@asmendustri.com`
- Varsayılan Şifre: `admin123`

### Sayfalar
- **Ana Sayfa**: Ürün vitrini ve şirket tanıtımı
- **Ürünler**: Tüm ürünlerin listelendiği sayfa
- **Hakkımızda**: Şirket bilgileri ve tarihçe
- **İletişim**: İletişim formu ve bilgileri

### Admin Paneli Özellikleri
- Ürün ekleme, düzenleme ve silme
- İletişim mesajlarını görüntüleme ve yönetme
- Site istatistiklerini görüntüleme
- Galeri yönetimi

## Dosya Yapısı

```
asm-website/
├── config/
│   └── database.js          # Veritabanı bağlantısı
├── middleware/
│   └── auth.js             # JWT authentication middleware
├── public/
│   ├── admin/              # Admin paneli HTML dosyaları
│   ├── js/                 # JavaScript dosyaları
│   ├── images/             # Görseller
│   └── index.html          # Ana sayfa
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── contact.js          # İletişim formu routes
│   ├── products.js         # Ürün yönetimi routes
│   └── upload.js           # Dosya yükleme routes
├── server.js               # Ana server dosyası
├── package.json            # Proje bağımlılıkları
├── .env                    # Çevre değişkenleri
└── README.md              # Bu dosya
```

## Güvenlik

- JWT tabanlı authentication
- Şifreler bcrypt ile hashlenmiş
- XSS ve SQL injection koruması
- Dosya yükleme güvenliği

## Performans

- Görsel optimizasyonu
- Lazy loading
- Cache mekanizmaları
- Minified CSS/JS

## SEO

- Meta etiketleri
- Open Graph etiketleri
- Canonical URL'ler
- Schema.org markup'ları

## Tarayıcı Uyumluluğu

- Chrome (Son 2 versiyon)
- Firefox (Son 2 versiyon)
- Safari (Son 2 versiyon)
- Edge (Son 2 versiyon)

## Geliştirme

### Yeni Özellik Ekleme
1. Feature branch oluşturun
2. Değişiklikleri yapın
3. Test edin
4. Pull request oluşturun

### Kod Stili
- ESLint kullanımı önerilir
- Prettier ile kod formatlama
- JSDoc yorumları

## Lisans
## Sürüm Notları

### v1.0.0 (2024-12-02)
- İlk sürüm
- Temel özellikler
- Admin paneli
- Ürün yönetimi
- İletişim formu

---

