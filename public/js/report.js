// Report page functionality
const API_BASE_URL = '/api';
let currentPage = 1;
const itemsPerPage = 10;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initScanForm();
    initReportForm();
    initHistory();
    setReportDateMax();
});

// Tab switching functionality
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');

            // Remove active class from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked
            btn.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');

            // Load history if history tab is clicked
            if (tabName === 'history') {
                loadHistory();
            }
        });
    });
}

// Initialize scan form
function initScanForm() {
    const form = document.getElementById('scanForm');
    const contentTextarea = document.getElementById('scanContent');
    const charCount = document.getElementById('charCount');
    const clearBtn = document.getElementById('clearScan');
    const closeScanResults = document.getElementById('closeScanResults');

    // Character counter
    contentTextarea.addEventListener('input', () => {
        const count = contentTextarea.value.length;
        charCount.textContent = count;

        if (count > 10000) {
            charCount.style.color = 'var(--danger-color)';
        } else if (count > 9000) {
            charCount.style.color = 'var(--warning-color)';
        } else {
            charCount.style.color = 'var(--text-secondary)';
        }
    });

    // Clear button
    clearBtn.addEventListener('click', () => {
        form.reset();
        charCount.textContent = '0';
        charCount.style.color = 'var(--text-secondary)';
        document.getElementById('scanResults').classList.add('hidden');
    });

    // Close results
    closeScanResults.addEventListener('click', () => {
        document.getElementById('scanResults').classList.add('hidden');
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await performScan();
    });
}

// Perform scan
async function performScan() {
    const content = document.getElementById('scanContent').value;
    const source = document.getElementById('scanSource').value;
    const sender = document.getElementById('scanSender').value;

    if (!content.trim()) {
        showError('Please enter content to scan');
        return;
    }

    // Show progress
    document.getElementById('scanResults').classList.add('hidden');
    const progressDiv = document.getElementById('scanProgress');
    progressDiv.classList.remove('hidden');

    // Animate progress
    animateScanProgress();

    try {
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
                content,
                source: source || 'website',
                sender: sender || 'anonymous'
            })
        });

        if (!response.ok) {
            if (response.status === 401) {
                // Guest user - perform basic analysis
                showGuestScanResult(content);
                return;
            }
            throw new Error('Scan failed');
        }

        const data = await response.json();
        showScanResult(data);
    } catch (error) {
        console.error('Scan error:', error);
        progressDiv.classList.add('hidden');
        showError('An error occurred during scanning. Please try again.');
    }
}

// Animate scan progress
function animateScanProgress() {
    const progressBar = document.getElementById('progressBar');
    const steps = ['step1', 'step2', 'step3', 'step4'];
    let currentStep = 0;

    // Reset all steps
    steps.forEach(step => {
        const el = document.getElementById(step);
        el.classList.remove('active', 'completed');
        el.querySelector('.step-icon').textContent = '⏳';
    });

    progressBar.style.width = '0%';

    const interval = setInterval(() => {
        if (currentStep < steps.length) {
            const stepEl = document.getElementById(steps[currentStep]);
            stepEl.classList.add('active');
            stepEl.querySelector('.step-icon').textContent = '⏳';

            progressBar.style.width = `${((currentStep + 1) / steps.length) * 100}%`;

            setTimeout(() => {
                stepEl.classList.remove('active');
                stepEl.classList.add('completed');
                stepEl.querySelector('.step-icon').textContent = '✓';
            }, 400);

            currentStep++;
        } else {
            clearInterval(interval);
        }
    }, 600);
}

// Show scan result
function showScanResult(data) {
    const progressDiv = document.getElementById('scanProgress');
    const resultsDiv = document.getElementById('scanResults');
    const resultContent = document.getElementById('scanResultContent');

    progressDiv.classList.add('hidden');

    const analysis = data.analysis || {};
    const riskLevel = analysis.risk_score >= 75 ? 'high' :
                     analysis.risk_score >= 50 ? 'medium' :
                     analysis.risk_score >= 25 ? 'low' : 'minimal';

    resultContent.innerHTML = `
        <div class="analysis-result">
            <div class="risk-indicator ${riskLevel}">
                <div class="risk-icon">${analysis.is_phishing ? '🚨' : analysis.risk_score >= 50 ? '⚠️' : '✓'}</div>
                <div class="risk-text">
                    <h4>${analysis.is_phishing ? 'Phishing Detected!' : 'Scan Complete'}</h4>
                    <p>Risk Score: ${analysis.risk_score || 0}/100 (${riskLevel.toUpperCase()} RISK)</p>
                </div>
            </div>

            <div class="analysis-details">
                ${analysis.explanation && analysis.explanation.findings && analysis.explanation.findings.length > 0 ? `
                    <h4>Findings</h4>
                    <ul>
                        ${analysis.explanation.findings.map(f => `<li>${f}</li>`).join('')}
                    </ul>
                ` : ''}

                ${analysis.explanation && analysis.explanation.keywords && analysis.explanation.keywords.length > 0 ? `
                    <h4>Suspicious Keywords Detected</h4>
                    <div class="keyword-tags">
                        ${analysis.explanation.keywords.slice(0, 10).map(k => `<span class="keyword-tag">${k}</span>`).join('')}
                        ${analysis.explanation.keywords.length > 10 ? `<span class="keyword-tag">+${analysis.explanation.keywords.length - 10} more</span>` : ''}
                    </div>
                ` : ''}

                ${analysis.explanation && analysis.explanation.suspicious_urls && analysis.explanation.suspicious_urls.length > 0 ? `
                    <h4>Suspicious URLs</h4>
                    ${analysis.explanation.suspicious_urls.map(urlObj => `
                        <div class="url-analysis">
                            <code class="url-code">${urlObj.url}</code>
                            <ul class="url-reasons">
                                ${urlObj.reasons.map(reason => `<li>${reason}</li>`).join('')}
                            </ul>
                        </div>
                    `).join('')}
                ` : ''}

                ${analysis.explanation && analysis.explanation.known_phishing_matches && analysis.explanation.known_phishing_matches.length > 0 ? `
                    <div class="alert alert-danger">
                        <h4>⚠️ Known Phishing URL Detected!</h4>
                        <p>This URL matches our database of known phishing sites. Do not interact with it!</p>
                    </div>
                ` : ''}

                <h4>Recommendation</h4>
                <p class="recommendation ${riskLevel}">${analysis.explanation?.recommendation || 'Stay vigilant and verify sender identity.'}</p>
            </div>
        </div>
    `;

    // Add additional styles
    const style = document.createElement('style');
    style.textContent = `
        .keyword-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-top: 0.5rem;
        }
        .keyword-tag {
            background: #fee2e2;
            color: var(--danger-color);
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 600;
        }
        .url-analysis {
            background: var(--bg-light);
            padding: 1rem;
            border-radius: 8px;
            margin: 0.5rem 0;
        }
        .url-code {
            display: block;
            background: white;
            padding: 0.5rem;
            border-radius: 4px;
            margin-bottom: 0.5rem;
            word-break: break-all;
        }
        .url-reasons {
            margin: 0.5rem 0 0 1rem;
            padding: 0;
        }
        .url-reasons li {
            color: var(--danger-color);
            margin-bottom: 0.25rem;
        }
        .recommendation {
            font-weight: 600;
            padding: 1rem;
            border-radius: 8px;
            margin-top: 1rem;
        }
        .recommendation.high {
            background: #fee2e2;
            color: var(--danger-color);
        }
        .recommendation.medium {
            background: #fef3c7;
            color: var(--warning-color);
        }
        .recommendation.low {
            background: #fef9c3;
            color: #a16207;
        }
        .recommendation.minimal {
            background: #d1fae5;
            color: var(--success-color);
        }
        .alert-danger {
            background: #fee2e2;
            border-left: 4px solid var(--danger-color);
            padding: 1rem;
            border-radius: 8px;
            margin: 1rem 0;
        }
        .alert-danger h4 {
            margin: 0 0 0.5rem 0;
            color: var(--danger-color);
        }
        .alert-danger p {
            margin: 0;
            color: var(--text-primary);
        }
    `;
    document.head.appendChild(style);

    resultsDiv.classList.remove('hidden');
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Show guest scan result
function showGuestScanResult(content) {
    const progressDiv = document.getElementById('scanProgress');
    const resultsDiv = document.getElementById('scanResults');
    const resultContent = document.getElementById('scanResultContent');

    progressDiv.classList.add('hidden');

    // Perform basic client-side analysis
    const analysis = performBasicAnalysis(content);

    resultContent.innerHTML = `
        <div class="analysis-result">
            <div class="risk-indicator ${analysis.riskLevel}">
                <div class="risk-icon">${analysis.icon}</div>
                <div class="risk-text">
                    <h4>${analysis.title}</h4>
                    <p>Risk Score: ${analysis.riskScore}/100</p>
                </div>
            </div>

            <div class="analysis-details">
                <h4>Basic Analysis Results</h4>
                <ul>
                    ${analysis.findings.map(finding => `<li>${finding}</li>`).join('')}
                </ul>
            </div>

            <div class="guest-notice">
                <p><strong>Limited Analysis:</strong> You're using guest mode with basic detection. Sign in for:</p>
                <ul>
                    <li>Advanced AI-powered phishing detection</li>
                    <li>Known phishing database matching</li>
                    <li>Detailed threat reports with recommendations</li>
                    <li>Scan history and tracking</li>
                </ul>
                <a href="/signup.html" class="btn btn-primary">Create Free Account</a>
            </div>
        </div>
    `;

    resultsDiv.classList.remove('hidden');
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Basic analysis (from main.js, simplified)
function performBasicAnalysis(content) {
    const findings = [];
    let riskScore = 0;

    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const urls = content.match(urlRegex);

    if (urls) {
        findings.push(`Found ${urls.length} URL(s)`);
        urls.forEach(url => {
            if (url.includes('bit.ly') || url.includes('tinyurl')) {
                findings.push('Contains shortened URL');
                riskScore += 20;
            }
            if (!url.startsWith('https://')) {
                findings.push('Contains non-HTTPS URL');
                riskScore += 15;
            }
        });
    }

    const urgencyWords = /urgent|immediately|act now|verify|suspend|confirm|click here|expire/gi;
    if (urgencyWords.test(content)) {
        findings.push('Contains urgency keywords');
        riskScore += 20;
    }

    const sensitiveWords = /password|credit card|social security|bank account/gi;
    if (sensitiveWords.test(content)) {
        findings.push('Requests sensitive information');
        riskScore += 30;
    }

    if (findings.length === 0) {
        findings.push('No obvious red flags detected');
    }

    let riskLevel, title, icon;
    if (riskScore >= 50) {
        riskLevel = 'high';
        title = 'High Risk Detected';
        icon = '🚨';
    } else if (riskScore >= 25) {
        riskLevel = 'medium';
        title = 'Medium Risk';
        icon = '⚠️';
    } else {
        riskLevel = 'low';
        title = 'Low Risk';
        icon = '✓';
    }

    return { riskLevel, title, icon, findings, riskScore };
}

// Initialize report form
function initReportForm() {
    const form = document.getElementById('reportForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitReport();
    });
}

// Submit report
async function submitReport() {
    const reportType = document.getElementById('reportType').value;
    const content = document.getElementById('reportContent').value;
    const url = document.getElementById('reportUrl').value;
    const sender = document.getElementById('reportSender').value;
    const date = document.getElementById('reportDate').value;
    const consent = document.getElementById('reportConsent').checked;

    if (!consent) {
        showError('Please confirm the consent checkbox');
        return;
    }

    // For now, just show success message
    // In production, this would send to the server
    const form = document.getElementById('reportForm');
    const successDiv = document.getElementById('reportSuccess');

    form.classList.add('hidden');
    successDiv.classList.remove('hidden');

    // Reset form after 3 seconds
    setTimeout(() => {
        form.classList.remove('hidden');
        form.reset();
        successDiv.classList.add('hidden');
    }, 5000);
}

// Initialize history
function initHistory() {
    const token = localStorage.getItem('authToken');
    const loginRequired = document.getElementById('historyLoginRequired');
    const historyContent = document.getElementById('historyContent');

    if (token) {
        loginRequired.classList.add('hidden');
        historyContent.classList.remove('hidden');
        setupHistoryControls();
    } else {
        loginRequired.classList.remove('hidden');
        historyContent.classList.add('hidden');
    }
}

// Setup history controls
function setupHistoryControls() {
    const refreshBtn = document.getElementById('refreshHistory');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');

    refreshBtn.addEventListener('click', () => loadHistory());
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadHistory();
        }
    });
    nextBtn.addEventListener('click', () => {
        currentPage++;
        loadHistory();
    });
}

// Load history
async function loadHistory() {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const listDiv = document.getElementById('historyList');
    listDiv.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading history...</p></div>';

    try {
        const response = await fetch(`${API_BASE_URL}/analyses?page=${currentPage}&limit=${itemsPerPage}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load history');
        }

        const data = await response.json();
        displayHistory(data);
    } catch (error) {
        console.error('Error loading history:', error);
        listDiv.innerHTML = '<div class="empty-state"><p>Failed to load history. Please try again.</p></div>';
    }
}

// Display history
function displayHistory(data) {
    const listDiv = document.getElementById('historyList');
    const paginationDiv = document.getElementById('historyPagination');
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');

    if (!data.analyses || data.analyses.length === 0) {
        listDiv.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <h3>No scan history yet</h3>
                <p>Your scan history will appear here. Start by scanning a message in the Quick Scan tab!</p>
            </div>
        `;
        paginationDiv.classList.add('hidden');
        return;
    }

    listDiv.innerHTML = data.analyses.map(analysis => {
        const riskLevel = analysis.score >= 0.75 ? 'high' :
                         analysis.score >= 0.50 ? 'medium' :
                         analysis.score >= 0.25 ? 'low' : 'minimal';
        const riskScore = Math.round(analysis.score * 100);
        const date = new Date(analysis.created_at).toLocaleString();
        const preview = analysis.content.substring(0, 200);

        return `
            <div class="history-item risk-${riskLevel}">
                <div class="history-item-header">
                    <div class="history-item-meta">
                        ${analysis.source ? `<span class="meta-badge source">${analysis.source}</span>` : ''}
                        <span class="meta-badge risk-${riskLevel}">${riskLevel.toUpperCase()} RISK (${riskScore})</span>
                    </div>
                    <span class="history-item-date">${date}</span>
                </div>
                <div class="history-item-preview">
                    ${preview}${analysis.content.length > 200 ? '...' : ''}
                </div>
                <div class="history-item-actions">
                    <button class="btn btn-primary btn-sm" onclick="viewAnalysisDetails(${analysis.id})">View Details</button>
                    <button class="btn btn-secondary btn-sm" onclick="deleteAnalysis(${analysis.id})">Delete</button>
                </div>
            </div>
        `;
    }).join('');

    // Update pagination
    if (data.pagination) {
        pageInfo.textContent = `Page ${data.pagination.page} of ${data.pagination.pages}`;
        prevBtn.disabled = data.pagination.page <= 1;
        nextBtn.disabled = data.pagination.page >= data.pagination.pages;
        paginationDiv.classList.remove('hidden');
    }
}

// View analysis details
async function viewAnalysisDetails(id) {
    // Switch to scan tab and load details
    alert(`View details for analysis ${id} - Feature coming soon!`);
}

// Delete analysis
async function deleteAnalysis(id) {
    if (!confirm('Are you sure you want to delete this analysis?')) return;

    const token = localStorage.getItem('authToken');
    try {
        const response = await fetch(`${API_BASE_URL}/analyses/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            loadHistory();
        } else {
            throw new Error('Failed to delete');
        }
    } catch (error) {
        console.error('Error deleting analysis:', error);
        alert('Failed to delete analysis. Please try again.');
    }
}

// Set max date for report form
function setReportDateMax() {
    const dateInput = document.getElementById('reportDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('max', today);
    }
}

// Show error message
function showError(message) {
    alert(message); // Simple for now, can be improved with custom modal
}

// Make functions globally available
window.viewAnalysisDetails = viewAnalysisDetails;
window.deleteAnalysis = deleteAnalysis;
