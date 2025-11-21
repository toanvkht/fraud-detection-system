const db = require('../db');

class DatabaseService {
  // User operations
  static async createUser(userData) {
    const [user] = await db('users')
      .insert(userData)
      .returning(['id', 'email', 'username', 'name', 'role', 'created_at']);
    return user;
  }

  static async getUserById(id) {
    return await db('users')
      .where({ id })
      .select('id', 'email', 'username', 'name', 'role', 'created_at', 'updated_at')
      .first();
  }

  static async getUserByEmail(email) {
    return await db('users')
      .where({ email })
      .first();
  }

  static async updateUser(id, updates) {
    const [user] = await db('users')
      .where({ id })
      .update({
        ...updates,
        updated_at: new Date()
      })
      .returning(['id', 'email', 'username', 'name', 'role']);
    return user;
  }

  // Message operations
  static async createMessage(messageData) {
    const [message] = await db('messages')
      .insert(messageData)
      .returning('*');
    return message;
  }

  static async getMessageById(id) {
    return await db('messages')
      .where({ id })
      .first();
  }

  static async getUserMessages(userId, limit = 50, offset = 0) {
    return await db('messages')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }

  static async deleteMessage(id) {
    return await db('messages')
      .where({ id })
      .del();
  }

  // Analysis operations
  static async createAnalysis(analysisData) {
    const [analysis] = await db('analyses')
      .insert(analysisData)
      .returning('*');
    return analysis;
  }

  static async getAnalysisById(id) {
    return await db('analyses')
      .where({ id })
      .first();
  }

  static async getAnalysisByMessageId(messageId) {
    return await db('analyses')
      .where({ message_id: messageId })
      .first();
  }

  static async getUserAnalyses(userId, limit = 20, offset = 0) {
    return await db('analyses as a')
      .join('messages as m', 'a.message_id', 'm.id')
      .where('m.user_id', userId)
      .select('a.*', 'm.content', 'm.source', 'm.sender')
      .orderBy('a.created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }

  static async deleteAnalysis(id) {
    return await db('analyses')
      .where({ id })
      .del();
  }

  // Known phishing URLs operations
  static async addPhishingUrl(urlData) {
    const [url] = await db('known_phishing_urls')
      .insert(urlData)
      .returning('*');
    return url;
  }

  static async getPhishingUrlById(id) {
    return await db('known_phishing_urls')
      .where({ id })
      .first();
  }

  static async getAllPhishingUrls(limit = 100, offset = 0) {
    return await db('known_phishing_urls')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }

  static async checkUrlInDatabase(url) {
    return await db('known_phishing_urls')
      .where({ url })
      .first();
  }

  static async deletePhishingUrl(id) {
    return await db('known_phishing_urls')
      .where({ id })
      .del();
  }

  // Statistics operations
  static async getUserStats(userId) {
    const [totalMessages] = await db('messages')
      .where({ user_id: userId })
      .count('* as count');

    const [totalAnalyses] = await db('analyses as a')
      .join('messages as m', 'a.message_id', 'm.id')
      .where('m.user_id', userId)
      .count('* as count');

    const [scamCount] = await db('analyses as a')
      .join('messages as m', 'a.message_id', 'm.id')
      .where({ 'm.user_id': userId, 'a.is_scam': true })
      .count('* as count');

    return {
      totalMessages: parseInt(totalMessages.count),
      totalAnalyses: parseInt(totalAnalyses.count),
      scamCount: parseInt(scamCount.count)
    };
  }

  // Transaction helper
  static async transaction(callback) {
    return await db.transaction(callback);
  }
}

module.exports = DatabaseService;
