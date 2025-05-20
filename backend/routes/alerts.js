const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const auth = require('../middleware/auth');

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
router.post('/', auth, async (req, res) => {
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
router.delete('/:id', auth, async (req, res) => {
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

module.exports = router; 