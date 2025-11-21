const db = require('../db');

// Vietnamese keywords
const vietnameseKeywords = [
  'chuyển khoản', 'vay tiền', 'khóa tài khoản', 'otp', 'mã xác nhận',
  'yêu cầu chuyển', 'thắng', 'trúng thưởng', 'ngân hàng', 'sdt',
  'số tài khoản', 'gửi link', 'click link', 'f0', 'lừa đảo', 'giải ngân', 'nhanh'
];

// English keywords
const englishKeywords = [
  'urgent', 'verify', 'suspended', 'click here', 'act now', 'confirm',
  'password', 'social security', 'bank account', 'credit card', 'expire',
  'winner', 'prize', 'congratulations', 'limited time', 'immediately'
];

// Combined keyword list
const keywordList = [...vietnameseKeywords, ...englishKeywords];

// Score by keywords
function scoreByKeywords(text) {
  const t = (text || '').toLowerCase();
  let matches = [];

  for (const k of keywordList) {
    if (t.includes(k.toLowerCase())) {
      matches.push(k);
    }
  }

  const base = Math.min(0.9, matches.length * 0.12);
  return { matches, base };
}

// Extract URLs from text
function extractUrls(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  return text.match(urlRegex) || [];
}

// Analyze URL for suspicious patterns
function analyzeUrl(url) {
  const suspicious = [];
  let score = 0;

  // Check for shortened URLs
  if (/bit\.ly|tinyurl|goo\.gl|t\.co|ow\.ly|is\.gd/i.test(url)) {
    suspicious.push('Shortened URL detected');
    score += 0.25;
  }

  // Check for IP address instead of domain
  if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url)) {
    suspicious.push('IP address instead of domain name');
    score += 0.30;
  }

  // Check for non-HTTPS
  if (url.startsWith('http://')) {
    suspicious.push('Non-secure HTTP connection');
    score += 0.15;
  }

  // Check for suspicious TLDs
  if (/\.(xyz|top|work|click|link|club|online)$/i.test(url)) {
    suspicious.push('Suspicious top-level domain');
    score += 0.20;
  }

  // Check for typosquatting patterns (many hyphens, numbers in domain)
  const domainPart = url.split('/')[2] || '';
  if ((domainPart.match(/-/g) || []).length >= 3) {
    suspicious.push('Multiple hyphens in domain');
    score += 0.15;
  }

  if (/\d{2,}/.test(domainPart)) {
    suspicious.push('Multiple numbers in domain');
    score += 0.10;
  }

  return { suspicious, score };
}

// Score by patterns
function scoreByPattern(text) {
  const t = (text || '');
  let score = 0;
  let patterns = [];

  // Long numbers (phone numbers, account numbers)
  if (/\b\d{4,}\b/.test(t)) {
    patterns.push('Contains long numeric sequence');
    score += 0.15;
  }

  // Urgency words
  if (/\b(urgent|gấp|khẩn|immediately|ngay|now|asap)\b/i.test(t)) {
    patterns.push('Urgency language detected');
    score += 0.15;
  }

  // URLs detected
  const urls = extractUrls(t);
  if (urls.length > 0) {
    patterns.push(`Contains ${urls.length} URL(s)`);
    score += Math.min(0.20, urls.length * 0.10);
  }

  // All caps words (shouting)
  const capsWords = t.match(/\b[A-Z]{3,}\b/g) || [];
  if (capsWords.length >= 3) {
    patterns.push('Excessive capitalization');
    score += 0.10;
  }

  // Excessive punctuation
  if (/[!?]{2,}/.test(t)) {
    patterns.push('Excessive punctuation');
    score += 0.08;
  }

  return { patterns, score: Math.min(1, score) };
}

// Check against known phishing URLs database
async function checkKnownPhishingUrls(urls) {
  if (urls.length === 0) return { matches: [], score: 0 };

  try {
    const matches = await db('known_phishing_urls')
      .whereIn('url', urls)
      .select('url', 'severity');

    // If we find matches in known phishing database, high score
    const score = matches.length > 0 ? 0.95 : 0;

    return { matches, score };
  } catch (err) {
    console.error('Error checking known phishing URLs:', err);
    return { matches: [], score: 0 };
  }
}

// Main analysis function
async function analyzeMessage(message) {
  const text = message.content || '';
  const findings = [];

  // Keyword analysis
  const kw = scoreByKeywords(text);
  if (kw.matches.length > 0) {
    findings.push(`Found ${kw.matches.length} suspicious keyword(s): ${kw.matches.slice(0, 5).join(', ')}${kw.matches.length > 5 ? '...' : ''}`);
  }

  // Pattern analysis
  const pat = scoreByPattern(text);
  findings.push(...pat.patterns);

  // URL analysis
  const urls = extractUrls(text);
  let urlScore = 0;
  let suspiciousUrls = [];

  if (urls.length > 0) {
    for (const url of urls) {
      const urlAnalysis = analyzeUrl(url);
      if (urlAnalysis.suspicious.length > 0) {
        suspiciousUrls.push({
          url,
          reasons: urlAnalysis.suspicious
        });
        urlScore += urlAnalysis.score;
      }
    }
  }

  // Check against known phishing database
  const knownPhishing = await checkKnownPhishingUrls(urls);
  if (knownPhishing.matches.length > 0) {
    findings.push(`ALERT: ${knownPhishing.matches.length} URL(s) match known phishing database`);
  }

  // Calculate final score
  const rawScore = Math.min(1, kw.base + pat.score + (urlScore / urls.length || 0) + knownPhishing.score);
  const is_phishing = rawScore >= 0.5 || knownPhishing.matches.length > 0;

  // Risk score (0-100)
  const risk_score = Math.round(rawScore * 100);

  // Generate recommendation
  let recommendation;
  if (risk_score >= 75) {
    recommendation = 'HIGH RISK: Do not interact with this message. Delete immediately and report as phishing.';
  } else if (risk_score >= 50) {
    recommendation = 'MEDIUM RISK: Exercise extreme caution. Verify sender through official channels before taking any action.';
  } else if (risk_score >= 25) {
    recommendation = 'LOW RISK: Some suspicious elements detected. Verify sender identity before clicking links or providing information.';
  } else {
    recommendation = 'MINIMAL RISK: No major red flags detected, but always stay vigilant.';
  }

  const explanation = {
    keywords: kw.matches,
    patterns: pat.patterns,
    suspicious_urls: suspiciousUrls,
    known_phishing_matches: knownPhishing.matches,
    findings,
    risk_score,
    recommendation
  };

  return {
    is_scam: is_phishing,
    score: rawScore,
    risk_score,
    is_phishing,
    explanation
  };
}

module.exports = { analyzeMessage };