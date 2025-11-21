const db = require('../db');

// NOTE: This simple example does not check user role. In production, only admin role should be allowed.

// Phishing URLs management
exports.addUrl = async (req, res) => {
  const { url, domain, source, severity, notes } = req.body;
  try {
    const existing = await db('known_phishing_urls').where({ url }).first();
    if (existing) return res.status(400).json({ error: 'URL already exists' });

    const [rec] = await db('known_phishing_urls')
      .insert({
        url,
        domain,
        source,
        severity,
        notes,
        first_seen_at: new Date(),
        last_seen_at: new Date()
      })
      .returning('*');

    res.json({ url: rec });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.listUrls = async (req, res) => {
  try {
    const rows = await db('known_phishing_urls').orderBy('created_at', 'desc');
    res.json({ urls: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteUrl = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await db('known_phishing_urls').where({ id }).del();
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Reports management
exports.getReports = async (req, res) => {
  try {
    const { status } = req.query;

    let query = db('reports')
      .leftJoin('suspicious_urls', 'reports.suspicious_url_id', 'suspicious_urls.id')
      .leftJoin('users', 'reports.reporter_user_id', 'users.id')
      .select(
        'reports.*',
        'suspicious_urls.url',
        'users.email as reporter_email'
      )
      .orderBy('reports.created_at', 'desc');

    if (status) {
      query = query.where('reports.status', status);
    }

    const reports = await query;
    res.json({ reports });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await db('reports')
      .leftJoin('suspicious_urls', 'reports.suspicious_url_id', 'suspicious_urls.id')
      .leftJoin('users', 'reports.reporter_user_id', 'users.id')
      .select(
        'reports.*',
        'suspicious_urls.url',
        'users.email as reporter_email'
      )
      .where('reports.id', id)
      .first();

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await db('reports')
      .where({ id })
      .update({
        status,
        reviewed_at: new Date(),
        moderator_id: req.user.userId,
        updated_at: new Date()
      })
      .returning('*');

    if (!updated.length) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ report: updated[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Message submissions
exports.getSubmissions = async (req, res) => {
  try {
    const { source } = req.query;

    let query = db('messages')
      .leftJoin('users', 'messages.user_id', 'users.id')
      .leftJoin('analyses', 'messages.id', 'analyses.message_id')
      .select(
        'messages.id as message_id',
        'messages.content',
        'messages.source',
        'messages.sender',
        'messages.created_at',
        'users.email as user_email',
        'analyses.is_scam',
        'analyses.score',
        'analyses.explanation'
      )
      .orderBy('messages.created_at', 'desc');

    if (source) {
      query = query.where('messages.source', source);
    }

    const submissions = await query;
    res.json({ submissions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await db('messages')
      .leftJoin('users', 'messages.user_id', 'users.id')
      .leftJoin('analyses', 'messages.id', 'analyses.message_id')
      .select(
        'messages.id as message_id',
        'messages.content',
        'messages.source',
        'messages.sender',
        'messages.meta',
        'messages.created_at',
        'users.email as user_email',
        'analyses.is_scam',
        'analyses.score',
        'analyses.explanation'
      )
      .where('messages.id', id)
      .first();

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json({ submission });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Statistics
exports.getStatistics = async (req, res) => {
  try {
    // Get total analyses
    const totalAnalyses = await db('analyses').count('* as count').first();
    const total = parseInt(totalAnalyses.count) || 0;

    // Get scam detection rate
    const scamCount = await db('analyses')
      .where('is_scam', true)
      .count('* as count')
      .first();
    const scams = parseInt(scamCount.count) || 0;
    const detectionRate = total > 0 ? (scams / total) * 100 : 0;

    // Get active users (users with at least one message)
    const activeUsersCount = await db('messages')
      .distinct('user_id')
      .count('* as count')
      .first();
    const activeUsers = parseInt(activeUsersCount.count) || 0;

    // Get average score
    const avgScore = await db('analyses')
      .avg('score as average')
      .first();
    const averageScore = parseFloat(avgScore.average) || 0;

    // Get recent activity (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentCount = await db('messages')
      .where('created_at', '>=', yesterday)
      .count('* as count')
      .first();
    const recentActivity = parseInt(recentCount.count) || 0;

    res.json({
      statistics: {
        detectionRate,
        activeUsers,
        averageScore,
        recentActivity
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};