const db = require('../db');

// Get all analyses for authenticated user
exports.listAnalyses = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Get analyses with message details
    const analyses = await db('analyses as a')
      .join('messages as m', 'a.message_id', 'm.id')
      .where('m.user_id', userId)
      .select(
        'a.id',
        'a.message_id',
        'a.is_scam',
        'a.score',
        'a.explanation',
        'a.created_at',
        'm.content',
        'm.source',
        'm.sender'
      )
      .orderBy('a.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [{ count }] = await db('analyses as a')
      .join('messages as m', 'a.message_id', 'm.id')
      .where('m.user_id', userId)
      .count('a.id as count');

    res.json({
      analyses,
      pagination: {
        page,
        limit,
        total: parseInt(count),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    console.error('Error listing analyses:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single analysis by ID
exports.getAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const analysis = await db('analyses as a')
      .join('messages as m', 'a.message_id', 'm.id')
      .where({ 'a.id': id, 'm.user_id': userId })
      .select(
        'a.id',
        'a.message_id',
        'a.is_scam',
        'a.score',
        'a.explanation',
        'a.created_at',
        'a.updated_at',
        'm.content',
        'm.source',
        'm.sender',
        'm.meta'
      )
      .first();

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json({ analysis });
  } catch (err) {
    console.error('Error getting analysis:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get analysis statistics for user
exports.getStatistics = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get total analyses count
    const [{ total }] = await db('analyses as a')
      .join('messages as m', 'a.message_id', 'm.id')
      .where('m.user_id', userId)
      .count('a.id as total');

    // Get scam count
    const [{ scams }] = await db('analyses as a')
      .join('messages as m', 'a.message_id', 'm.id')
      .where({ 'm.user_id': userId, 'a.is_scam': true })
      .count('a.id as scams');

    // Get safe count
    const [{ safe }] = await db('analyses as a')
      .join('messages as m', 'a.message_id', 'm.id')
      .where({ 'm.user_id': userId, 'a.is_scam': false })
      .count('a.id as safe');

    // Get average score
    const [{ avgScore }] = await db('analyses as a')
      .join('messages as m', 'a.message_id', 'm.id')
      .where('m.user_id', userId)
      .avg('a.score as avgScore');

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [{ recent }] = await db('analyses as a')
      .join('messages as m', 'a.message_id', 'm.id')
      .where('m.user_id', userId)
      .where('a.created_at', '>=', thirtyDaysAgo)
      .count('a.id as recent');

    // Get top sources
    const topSources = await db('messages as m')
      .join('analyses as a', 'm.id', 'a.message_id')
      .where('m.user_id', userId)
      .groupBy('m.source')
      .select('m.source')
      .count('m.id as count')
      .orderBy('count', 'desc')
      .limit(5);

    res.json({
      statistics: {
        total: parseInt(total),
        scams: parseInt(scams),
        safe: parseInt(safe),
        scamPercentage: total > 0 ? ((scams / total) * 100).toFixed(2) : 0,
        averageScore: avgScore ? parseFloat(avgScore).toFixed(2) : 0,
        recentAnalyses: parseInt(recent),
        topSources
      }
    });
  } catch (err) {
    console.error('Error getting statistics:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete analysis (and associated message)
exports.deleteAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // First check if the analysis belongs to the user
    const analysis = await db('analyses as a')
      .join('messages as m', 'a.message_id', 'm.id')
      .where({ 'a.id': id, 'm.user_id': userId })
      .select('a.id', 'a.message_id')
      .first();

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    // Delete analysis (message will cascade delete if FK is set)
    await db('analyses').where({ id }).del();

    res.json({ ok: true, message: 'Analysis deleted successfully' });
  } catch (err) {
    console.error('Error deleting analysis:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Health check
exports.ping = (req, res) => res.json({ ok: true });