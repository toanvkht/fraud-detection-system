// Auth state management
let currentUser = null;
const API_BASE_URL = '/api';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initQuickCheck();
    initAuthLinks();
});

// Auth initialization
function initAuth() {
    const token = localStorage.getItem('authToken');
    if (token) {
        // Verify token and get user info
        fetch(`${API_BASE_URL}/auth/verify`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Token invalid');
        })
        .then(data => {
            currentUser = data.user;
            updateAuthUI();
        })
        .catch(() => {
            localStorage.removeItem('authToken');
            updateAuthUI();
        });
    } else {
        updateAuthUI();
    }
}

// Update auth UI elements
function updateAuthUI() {
    const authLink = document.getElementById('authLink');
    const signupCTA = document.getElementById('signupCTA');

    if (currentUser) {
        if (authLink) {
            authLink.textContent = 'Dashboard';
            authLink.href = '/dashboard.html';
        }
        if (signupCTA) {
            signupCTA.textContent = 'Go to Dashboard';
            signupCTA.href = '/dashboard.html';
        }
    } else {
        if (authLink) {
            authLink.textContent = 'Sign In';
            authLink.href = '/login.html';
        }
        if (signupCTA) {
            signupCTA.textContent = 'Get Started Free';
            signupCTA.href = '/signup.html';
        }
    }
}

// Check if user is authenticated
function isAuthenticated() {
    const token = localStorage.getItem('authToken');
    return !!token;
}

// Initialize auth links
function initAuthLinks() {
    const authLink = document.getElementById('authLink');
    if (authLink && currentUser) {
        authLink.addEventListener('click', (e) => {
            if (authLink.textContent === 'Sign Out') {
                e.preventDefault();
                logout();
            }
        });
    }
}

// Logout function
function logout() {
    localStorage.removeItem('authToken');
    currentUser = null;
    updateAuthUI();
    window.location.href = '/';
}

// Quick check form handler
function initQuickCheck() {
    const form = document.getElementById('quickCheckForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const content = document.getElementById('messageContent').value;
        const source = document.getElementById('messageSource').value;

        if (!content.trim()) {
            showError('Please enter a message or URL to analyze');
            return;
        }

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Analyzing...';
        submitBtn.disabled = true;

        try {
            // Get auth token if available
            const token = localStorage.getItem('authToken');
            const headers = {
                'Content-Type': 'application/json'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE_URL}/messages`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    content: content,
                    source: source || 'website',
                    sender: 'anonymous'
                })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Not authenticated - show guest result
                    showGuestResult(content);
                    return;
                }
                throw new Error('Analysis failed');
            }

            const data = await response.json();
            showResult(data);
        } catch (error) {
            console.error('Error:', error);
            showError('An error occurred during analysis. Please try again.');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });

    // Close result handler
    const closeBtn = document.getElementById('closeResult');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('checkResult').classList.add('hidden');
        });
    }
}

// Show guest result (for non-authenticated users)
function showGuestResult(content) {
    const resultDiv = document.getElementById('checkResult');
    const resultContent = document.getElementById('resultContent');

    // Simple heuristic analysis for guest users
    const analysis = performBasicAnalysis(content);

    resultContent.innerHTML = `
        <div class="analysis-result">
            <div class="risk-indicator ${analysis.riskLevel}">
                <div class="risk-icon">${analysis.icon}</div>
                <div class="risk-text">
                    <h4>${analysis.title}</h4>
                    <p>${analysis.message}</p>
                </div>
            </div>

            <div class="analysis-details">
                <h4>Basic Analysis</h4>
                <ul>
                    ${analysis.findings.map(finding => `<li>${finding}</li>`).join('')}
                </ul>
            </div>

            <div class="guest-notice">
                <p><strong>Limited Analysis:</strong> This is a basic analysis. Create a free account for:</p>
                <ul>
                    <li>Advanced AI-powered detection</li>
                    <li>Detailed threat reports</li>
                    <li>Analysis history</li>
                    <li>Real-time threat database access</li>
                </ul>
                <a href="/signup.html" class="btn btn-primary">Create Free Account</a>
            </div>
        </div>
    `;

    resultDiv.classList.remove('hidden');
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Basic heuristic analysis
function performBasicAnalysis(content) {
    const findings = [];
    let riskScore = 0;

    // Check for suspicious URLs
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const urls = content.match(urlRegex);
    if (urls) {
        findings.push(`Found ${urls.length} URL(s) in the message`);

        urls.forEach(url => {
            if (url.includes('bit.ly') || url.includes('tinyurl') || url.includes('t.co')) {
                findings.push('Contains shortened URL (potential red flag)');
                riskScore += 20;
            }
            if (!url.startsWith('https://')) {
                findings.push('Contains non-HTTPS URL (potential security risk)');
                riskScore += 15;
            }
            if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url)) {
                findings.push('Contains IP address instead of domain name (suspicious)');
                riskScore += 25;
            }
        });
    }

    // Check for urgency keywords
    const urgencyWords = /urgent|immediately|act now|verify|suspend|confirm|click here|expire|limited time/gi;
    const urgencyMatches = content.match(urgencyWords);
    if (urgencyMatches && urgencyMatches.length > 2) {
        findings.push('Multiple urgency keywords detected (common phishing tactic)');
        riskScore += 20;
    }

    // Check for sensitive info requests
    const sensitiveWords = /password|credit card|social security|ssn|bank account|pin|cvv/gi;
    if (sensitiveWords.test(content)) {
        findings.push('Requests sensitive information (major red flag)');
        riskScore += 30;
    }

    // Check for poor grammar
    const grammarIssues = /you're account|you are account|click here to|won \$|youve won/gi;
    if (grammarIssues.test(content)) {
        findings.push('Possible grammar/spelling issues detected');
        riskScore += 10;
    }

    // Check message length
    if (content.length < 50) {
        findings.push('Very short message (common in phishing attempts)');
        riskScore += 5;
    }

    if (findings.length === 0) {
        findings.push('No obvious red flags detected in basic analysis');
    }

    // Determine risk level
    let riskLevel, title, message, icon;
    if (riskScore >= 50) {
        riskLevel = 'high';
        title = 'High Risk Detected';
        message = 'This message shows multiple signs of being a phishing attempt. Do not interact with it.';
        icon = '🚨';
    } else if (riskScore >= 25) {
        riskLevel = 'medium';
        title = 'Medium Risk';
        message = 'This message contains some suspicious elements. Proceed with caution.';
        icon = '⚠️';
    } else {
        riskLevel = 'low';
        title = 'Low Risk';
        message = 'No major red flags detected in basic analysis, but always stay vigilant.';
        icon = '✓';
    }

    return { riskLevel, title, message, icon, findings };
}

// Show authenticated user result
function showResult(data) {
    const resultDiv = document.getElementById('checkResult');
    const resultContent = document.getElementById('resultContent');

    const analysis = data.analysis || {};
    const riskLevel = analysis.is_phishing ? 'high' : (analysis.risk_score > 50 ? 'medium' : 'low');

    resultContent.innerHTML = `
        <div class="analysis-result">
            <div class="risk-indicator ${riskLevel}">
                <div class="risk-icon">${analysis.is_phishing ? '🚨' : '✓'}</div>
                <div class="risk-text">
                    <h4>${analysis.is_phishing ? 'Phishing Detected' : 'Analysis Complete'}</h4>
                    <p>Risk Score: ${analysis.risk_score || 0}/100</p>
                </div>
            </div>

            <div class="analysis-details">
                <h4>Findings</h4>
                <ul>
                    ${analysis.findings ? analysis.findings.map(f => `<li>${f}</li>`).join('') : '<li>No specific findings</li>'}
                </ul>

                ${analysis.suspicious_urls && analysis.suspicious_urls.length > 0 ? `
                    <h4>Suspicious URLs</h4>
                    <ul>
                        ${analysis.suspicious_urls.map(url => `<li><code>${url}</code></li>`).join('')}
                    </ul>
                ` : ''}

                <h4>Recommendation</h4>
                <p>${analysis.recommendation || 'Exercise caution when interacting with this message.'}</p>
            </div>
        </div>
    `;

    resultDiv.classList.remove('hidden');
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Show error message
function showError(message) {
    const resultDiv = document.getElementById('checkResult');
    const resultContent = document.getElementById('resultContent');

    resultContent.innerHTML = `
        <div class="error-message">
            <p style="color: var(--danger-color);">❌ ${message}</p>
        </div>
    `;

    resultDiv.classList.remove('hidden');
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href !== '') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});
