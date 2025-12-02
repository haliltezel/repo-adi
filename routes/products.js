const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all products (public)
router.get('/', async (req, res) => {
    try {
        const { category, search, limit = 20, offset = 0 } = req.query;
        
        let query = 'SELECT * FROM products WHERE is_active = true';
        let params = [];

        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }

        if (search) {
            query += ' AND (name LIKE ? OR description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [rows] = await pool.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single product (public)
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM products WHERE id = ? AND is_active = true',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get product categories (public)
router.get('/categories/list', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT DISTINCT category FROM products WHERE is_active = true AND category IS NOT NULL'
        );
        res.json(rows.map(row => row.category));
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create product (admin only)
router.post('/', authenticateToken, requireAdmin, [
    body('name').notEmpty().trim(),
    body('description').optional().trim(),
    body('category').optional().trim(),
    body('price').optional().isNumeric(),
    body('specifications').optional().isJSON()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, description, category, price, specifications, image_path, catalog_path } = req.body;

        const [result] = await pool.execute(
            `INSERT INTO products (name, description, category, price, specifications, image_path, catalog_path) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                description || null,
                category || null,
                price || null,
                specifications ? JSON.parse(specifications) : null,
                image_path || null,
                catalog_path || null
            ]
        );

        res.status(201).json({ 
            message: 'Product created successfully', 
            productId: result.insertId 
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update product (admin only)
router.put('/:id', authenticateToken, requireAdmin, [
    body('name').optional().notEmpty().trim(),
    body('description').optional().trim(),
    body('category').optional().trim(),
    body('price').optional().isNumeric(),
    body('specifications').optional().isJSON()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, description, category, price, specifications, image_path, catalog_path, is_active } = req.body;
        
        const updates = [];
        const values = [];

        if (name !== undefined) { updates.push('name = ?'); values.push(name); }
        if (description !== undefined) { updates.push('description = ?'); values.push(description); }
        if (category !== undefined) { updates.push('category = ?'); values.push(category); }
        if (price !== undefined) { updates.push('price = ?'); values.push(price); }
        if (specifications !== undefined) { updates.push('specifications = ?'); values.push(specifications ? JSON.parse(specifications) : null); }
        if (image_path !== undefined) { updates.push('image_path = ?'); values.push(image_path); }
        if (catalog_path !== undefined) { updates.push('catalog_path = ?'); values.push(catalog_path); }
        if (is_active !== undefined) { updates.push('is_active = ?'); values.push(is_active); }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No updates provided' });
        }

        values.push(req.params.id);

        const [result] = await pool.execute(
            `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product updated successfully' });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete product (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [result] = await pool.execute(
            'DELETE FROM products WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;