const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const auth = require('../middleware/auth');
const { isAdmin } = require('../middleware/auth');
const axios = require('axios');

// Get all alerts for a user
router.get('/', auth, async (req, res) => {
    try {
        const alerts = await Alert.find({
            $or: [
                { targetUsers: req.user.id },
                { course: req.user.course },
                { targetUsers: { $size: 0 } } // Public alerts
            ]
        }).sort({ date: 1 });
        
        res.json(alerts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get alerts by type
router.get('/type/:type', auth, async (req, res) => {
    try {
        const alerts = await Alert.find({
            type: req.params.type,
            $or: [
                { targetUsers: req.user.id },
                { course: req.user.course },
                { targetUsers: { $size: 0 } }
            ]
        }).sort({ date: 1 });
        
        res.json(alerts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create new alert (admin only)
router.post('/', auth, isAdmin, async (req, res) => {
    try {
        const {
            title,
            type,
            description,
            date,
            deadline,
            priority,
            course,
            targetUsers
        } = req.body;

        // Create new alert
        const alert = new Alert({
            title,
            type,
            description,
            date,
            deadline,
            priority,
            course,
            targetUsers: targetUsers || []
        });

        await alert.save();
        res.json(alert);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update alert status
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id);
        if (!alert) {
            return res.status(404).json({ msg: 'Alert not found' });
        }

        alert.status = req.body.status;
        await alert.save();
        res.json(alert);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete alert (admin only)
router.delete('/:id', auth, isAdmin, async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id);
        if (!alert) {
            return res.status(404).json({ msg: 'Alert not found' });
        }

        await alert.remove();
        res.json({ msg: 'Alert removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Proxy chat message to Python chatbot server
router.post('/chat', auth, async (req, res) => {
    try {
        const user = req.user;
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        const response = await axios.post('http://localhost:5005/chat', {
            email: user.email,
            message
        });
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: 'Chatbot server error' });
    }
});

// Get chat history for the logged-in user
router.post('/history', auth, async (req, res) => {
    try {
        const user = req.user;
        const response = await axios.post('http://localhost:5005/history', {
            email: user.email
        });
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: 'Chatbot server error' });
    }
});

module.exports = router; 