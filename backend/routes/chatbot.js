const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// In-memory chat history (for demo; replace with DB for production)
const chatHistories = {};

// Simple rule-based chatbot logic
function basicChatbotResponse(message) {
    const msg = message.trim().toLowerCase();

    // Greetings
    if (msg.includes("hi") || msg.includes("hello") || msg.includes("hey") || msg.includes("good morning") || msg.includes("good afternoon") || msg.includes("good evening") || msg.includes("greetings") || msg.includes("yo") || msg.includes("sup") || msg.includes("what's up")) {
        return "Hello! How can I help you today?";
    }
    if (msg.includes("how are you")) {
        return "I'm just a bot, but I'm here to help you! How can I assist you today?";
    }
    if (msg.includes("who are you") || msg.includes("your name")) {
        return "I'm your AI Student Companion chatbot, here to assist you with your academic needs!";
    }
    if (msg.includes("what can you do") || msg.includes("help")) {
        return "I can answer questions about the dashboard, notices, events, alerts, and general platform usage. Try asking me about any feature!";
    }
    if (msg.includes("dashboard")) {
        return "The dashboard gives you access to your notices, alerts, events, and student info. It's your main hub!";
    }
    if (msg.includes("notice")) {
        return "Notices are important updates from the admin. Check the Notice Board for the latest information.";
    }
    if (msg.includes("event")) {
        return "Upcoming events are listed in the Upcoming Events section. Don't miss out on important dates!";
    }
    if (msg.includes("alert")) {
        return "Alerts are urgent or important messages. Check the Important Alerts section regularly to stay updated.";
    }
    if (msg.includes("student info") || msg.includes("student information")) {
        return "Your student information, including email, ID, and course, is shown in the Student Information card on the dashboard.";
    }
    if (msg.includes("exam")) {
        return "You can find exam schedules in the Quick Links section or ask me for more details!";
    }
    if (msg.includes("fee")) {
        return "Fee status and payment deadlines are available in the Quick Links section. Make sure to pay on time!";
    }
    if (msg.includes("academic calendar")) {
        return "The academic calendar is available in the Quick Links section. It contains all important academic dates.";
    }
    if (msg.includes("thank")) {
        return "You're welcome! If you have more questions, just ask.";
    }
    if (msg.includes("bye") || msg.includes("goodbye") || msg.includes("see you")) {
        return "Goodbye! Have a great day. If you need help again, just come back!";
    }
    // Fallback
    return "Sorry, I didn't understand that. Can you rephrase or ask something else? You can ask me about notices, events, alerts, dashboard, or general platform help.";
}

router.post('/chat', auth, async (req, res) => {
    try {
        const user = req.user;
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        const botReply = basicChatbotResponse(message);
        if (!chatHistories[user.email]) chatHistories[user.email] = [];
        chatHistories[user.email].push({ user: message, bot: botReply });
        res.json({ reply: botReply, history: chatHistories[user.email] });
    } catch (err) {
        res.status(500).json({ error: 'Chatbot server error' });
    }
});

router.post('/history', auth, async (req, res) => {
    try {
        const user = req.user;
        res.json({ history: chatHistories[user.email] || [] });
    } catch (err) {
        res.status(500).json({ error: 'Chatbot server error' });
    }
});

module.exports = router; 