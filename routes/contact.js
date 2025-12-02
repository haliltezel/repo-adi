const express = require('express');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Configure nodemailer
/* const transporter = nodemailer.createTransport ({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
 */
const transporter = null; // Email disabled
// Contact form submission
router.post('/submit', [
    body('name').notEmpty().trim().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').optional().trim(),
    body('subject').optional().trim(),
    body('message').notEmpty().trim().withMessage('Message is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, phone, subject, message } = req.body;

        // Save to database
        await pool.execute(
            'INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)',
            [name, email, phone, subject || 'İletişim Formu', message]
        );

        // Send email notification
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to company email
            subject: `Yeni İletişim Formu - ${subject || 'İletişim Formu'}`,
            html: `
                <h2>Yeni İletişim Formu Mesajı</h2>
                <p><strong>Ad Soyad:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Telefon:</strong> ${phone || 'Belirtilmemiş'}</p>
                <p><strong>Konu:</strong> ${subject || 'Belirtilmemiş'}</p>
                <p><strong>Mesaj:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
                <hr>
                <p><small>ASM Endüstri İletişim Formu Sistemi</small></p>
            `
        };

        // Send confirmation email to user
        const userMailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'İletişim Formu - Mesajınız Alındı',
            html: `
                <h2>Sayın ${name},</h2>
                <p>İletişim formu mesajınız başarıyla alınmıştır.</p>
                <p>En kısa sürede sizinle iletişime geçeceğiz.</p>
                <p><strong>Mesajınız:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
                <hr>
                <p><strong>ASM Endüstri</strong></p>
                <p><small>Bu otomatik bir mesajdır, lütfen yanıtlamayın.</small></p>
            `
        };

        try {
            if (transporter) {
                await transporter.sendMail(mailOptions);
                await transporter.sendMail(userMailOptions);
            }
        } catch (emailError) {
            console.error('Email sending error:', emailError);
            // Don't fail the request if email fails, database record is already saved
        }

        res.json({ message: 'Mesajınız başarıyla gönderildi. En kısa sürede sizinle iletişime geçeceğiz.' });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ message: 'Mesaj gönderilirken bir hata oluştu.' });
    }
});

// Get contact messages (admin only)
router.get('/messages', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM contact_messages ORDER BY created_at DESC'
        );
        res.json(rows);
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Mark message as read (admin only)
router.put('/messages/:id/read', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [result] = await pool.execute(
            'UPDATE contact_messages SET is_read = true WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Message not found' });
        }

        res.json({ message: 'Message marked as read' });
    } catch (error) {
        console.error('Mark message read error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete message (admin only)
router.delete('/messages/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [result] = await pool.execute(
            'DELETE FROM contact_messages WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Message not found' });
        }

        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;