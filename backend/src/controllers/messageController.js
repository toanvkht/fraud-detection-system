const db = require('../db');
const analysisService = require('../services/scamDetector');


exports.createMessage = async (req, res) => {
    const { content, source, sender, meta } = req.body;
    const userId = req.user.id;

    console.log('Creating message:', { content, source, sender, userId });

    try {
        // Insert message
        const result = await db('messages')
            .insert({
                user_id: userId,
                content,
                source,
                sender,
                meta: JSON.stringify(meta || {})
            })
            .returning('*');

        // Handle SQLite vs PostgreSQL difference in returning
        let message;
        if (Array.isArray(result) && result.length > 0) {
            message = result[0];
        } else if (typeof result === 'object' && result.id) {
            message = result;
        } else {
            // Fallback: query the last inserted
            const insertId = typeof result === 'number' ? result : result[0];
            message = await db('messages').where({ id: insertId }).first();
        }

        console.log('Message created:', message);

        // Analyze message
        const analysisResult = await analysisService.analyzeMessage(message);
        console.log('Analysis result:', analysisResult);

        // Insert analysis
        await db('analyses').insert({
            message_id: message.id,
            is_scam: analysisResult.is_scam,
            score: analysisResult.score,
            explanation: JSON.stringify(analysisResult.explanation)
        });

        res.json({
            id: message.id,
            message,
            analysis: analysisResult
        });
    } catch (err) {
        console.error('Error creating message:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};


exports.listMessages = async (req, res) => {
const userId = req.user.id;
const messages = await db('messages').where({ user_id: userId }).orderBy('created_at', 'desc');
res.json({ messages });
};


exports.getMessage = async (req, res) => {
const { id } = req.params;
const userId = req.user.id;
const message = await db('messages').where({ id, user_id: userId }).first();
if (!message) return res.status(404).json({ error: 'Message not found' });
const analysis = await db('analyses').where({ message_id: id }).first();
res.json({ message, analysis });
};