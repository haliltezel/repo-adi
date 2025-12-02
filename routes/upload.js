const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = 'uploads/';
        
        if (file.fieldname === 'product_image') {
            uploadPath += 'products/images/';
        } else if (file.fieldname === 'product_catalog') {
            uploadPath += 'products/catalogs/';
        } else if (file.fieldname === 'gallery_image') {
            uploadPath += 'gallery/';
        } else {
            uploadPath += 'general/';
        }

        fs.ensureDirSync(uploadPath);
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
        cb(null, name + '-' + uniqueSuffix + ext);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const allowedDocumentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (file.fieldname === 'product_image' || file.fieldname === 'gallery_image') {
        if (allowedImageTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    } else if (file.fieldname === 'product_catalog') {
        if (allowedImageTypes.includes(file.mimetype) || allowedDocumentTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only image and PDF files are allowed for catalogs'), false);
        }
    } else {
        cb(null, true);
    }
};

// Multer upload middleware
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: fileFilter
});

// Upload product image
router.post('/product-image', authenticateToken, requireAdmin, upload.single('product_image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const fileUrl = `/uploads/products/images/${req.file.filename}`;
        res.json({ 
            message: 'Image uploaded successfully',
            fileUrl: fileUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Upload failed' });
    }
});

// Upload product catalog
router.post('/product-catalog', authenticateToken, requireAdmin, upload.single('product_catalog'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const fileUrl = `/uploads/products/catalogs/${req.file.filename}`;
        res.json({ 
            message: 'Catalog uploaded successfully',
            fileUrl: fileUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Upload failed' });
    }
});

// Upload gallery image
router.post('/gallery-image', authenticateToken, requireAdmin, upload.single('gallery_image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const fileUrl = `/uploads/gallery/${req.file.filename}`;
        res.json({ 
            message: 'Gallery image uploaded successfully',
            fileUrl: fileUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Upload failed' });
    }
});

// Delete uploaded file
router.delete('/delete', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { filePath } = req.body;
        
        if (!filePath) {
            return res.status(400).json({ message: 'File path required' });
        }

        // Security check - ensure path is within uploads directory
        const fullPath = path.join(__dirname, '..', filePath);
        if (!fullPath.startsWith(path.join(__dirname, '..', 'uploads'))) {
            return res.status(403).json({ message: 'Invalid file path' });
        }

        if (await fs.pathExists(fullPath)) {
            await fs.remove(fullPath);
            res.json({ message: 'File deleted successfully' });
        } else {
            res.status(404).json({ message: 'File not found' });
        }
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ message: 'Delete failed' });
    }
});

module.exports = router;