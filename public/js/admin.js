// Admin Dashboard JavaScript

const API_BASE = '/api';
let authToken = null;
let currentUser = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

// Check authentication
function checkAuth() {
    authToken = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!authToken || !userStr) {
        window.location.href = '/login.html';
        return;
    }

    currentUser = JSON.parse(userStr);
    document.getElementById('adminName').textContent = currentUser.name || currentUser.email;

    // Load initial data
    loadDashboardData();
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = e.currentTarget.dataset.section;
            switchSection(section);
        });
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Refresh buttons
    document.getElementById('refreshReports')?.addEventListener('click', loadReports);
    document.getElementById('refreshUrls')?.addEventListener('click', loadPhishingUrls);
    document.getElementById('refreshSubmissions')?.addEventListener('click', loadSubmissions);
    document.getElementById('refreshStats')?.addEventListener('click', loadStatistics);

    // Add URL button
    document.getElementById('addUrlBtn')?.addEventListener('click', openAddUrlModal);

    // Filters
    document.getElementById('reportStatusFilter')?.addEventListener('change', loadReports);
    document.getElementById('submissionSourceFilter')?.addEventListener('change', loadSubmissions);

    // Modal close buttons
    document.querySelectorAll('.close-modal, .cancel-btn').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });

    // Add URL form
    document.getElementById('addUrlForm')?.addEventListener('submit', handleAddUrl);

    // Close modal on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModals();
            }
        });
    });
}

// Switch section
function switchSection(section) {
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`)?.classList.add('active');

    // Update content
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(`${section}Section`)?.classList.add('active');

    // Load section data
    switch(section) {
        case 'reports':
            loadReports();
            break;
        case 'urls':
            loadPhishingUrls();
            break;
        case 'submissions':
            loadSubmissions();
            break;
        case 'statistics':
            loadStatistics();
            break;
    }
}

// Load dashboard data
async function loadDashboardData() {
    await Promise.all([
        loadStats(),
        loadReports()
    ]);
}

// Load statistics cards
async function loadStats() {
    try {
        const [reportsRes, urlsRes, submissionsRes] = await Promise.all([
            fetchAPI('/admin/reports'),
            fetchAPI('/admin/phishing-urls'),
            fetchAPI('/admin/submissions')
        ]);

        const reports = reportsRes.reports || [];
        const urls = urlsRes.urls || [];
        const submissions = submissionsRes.submissions || [];

        document.getElementById('totalReports').textContent = reports.length;
        document.getElementById('totalPhishingUrls').textContent = urls.length;
        document.getElementById('totalSubmissions').textContent = submissions.length;
        document.getElementById('pendingReports').textContent =
            reports.filter(r => r.status === 'open').length;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load reports
async function loadReports() {
    const tbody = document.getElementById('reportsTableBody');
    tbody.innerHTML = '<tr><td colspan="8" class="loading">Loading reports...</td></tr>';

    try {
        const status = document.getElementById('reportStatusFilter')?.value || '';
        const response = await fetchAPI(`/admin/reports${status ? `?status=${status}` : ''}`);
        const reports = response.reports || [];

        if (reports.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No reports found</td></tr>';
            return;
        }

        tbody.innerHTML = reports.map(report => `
            <tr>
                <td>${report.id}</td>
                <td><span class="content-preview" title="${escapeHtml(report.url || 'N/A')}">${escapeHtml(report.url || 'N/A')}</span></td>
                <td>${escapeHtml(report.reporter_email || 'Anonymous')}</td>
                <td>${escapeHtml(report.channel || 'N/A')}</td>
                <td><span class="content-preview" title="${escapeHtml(report.details || 'No details')}">${escapeHtml(report.details || 'No details')}</span></td>
                <td><span class="badge ${getStatusBadgeClass(report.status)}">${report.status || 'open'}</span></td>
                <td>${formatDate(report.created_at)}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn btn-sm btn-primary" onclick="viewReportDetails(${report.id})">View</button>
                        <button class="btn btn-sm btn-secondary" onclick="updateReportStatus(${report.id}, 'resolved')">Resolve</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading reports:', error);
        tbody.innerHTML = `<tr><td colspan="8" class="empty-state">Error loading reports: ${error.message}</td></tr>`;
    }
}

// Load phishing URLs
async function loadPhishingUrls() {
    const tbody = document.getElementById('urlsTableBody');
    tbody.innerHTML = '<tr><td colspan="8" class="loading">Loading URLs...</td></tr>';

    try {
        const response = await fetchAPI('/admin/phishing-urls');
        const urls = response.urls || [];

        if (urls.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No phishing URLs found</td></tr>';
            return;
        }

        tbody.innerHTML = urls.map(url => `
            <tr>
                <td>${url.id}</td>
                <td><span class="content-preview" title="${escapeHtml(url.url)}">${escapeHtml(url.url)}</span></td>
                <td>${escapeHtml(url.domain || 'N/A')}</td>
                <td>${escapeHtml(url.source || 'N/A')}</td>
                <td><span class="badge ${getSeverityBadgeClass(url.severity)}">${url.severity || 'N/A'}</span></td>
                <td><span class="content-preview" title="${escapeHtml(url.notes || 'No notes')}">${escapeHtml(url.notes || 'No notes')}</span></td>
                <td>${formatDate(url.created_at)}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn btn-sm btn-danger" onclick="deletePhishingUrl(${url.id})">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading URLs:', error);
        tbody.innerHTML = `<tr><td colspan="8" class="empty-state">Error loading URLs: ${error.message}</td></tr>`;
    }
}

// Load submissions
async function loadSubmissions() {
    const tbody = document.getElementById('submissionsTableBody');
    tbody.innerHTML = '<tr><td colspan="9" class="loading">Loading submissions...</td></tr>';

    try {
        const source = document.getElementById('submissionSourceFilter')?.value || '';
        const response = await fetchAPI(`/admin/submissions${source ? `?source=${source}` : ''}`);
        const submissions = response.submissions || [];

        if (submissions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="empty-state">No submissions found</td></tr>';
            return;
        }

        tbody.innerHTML = submissions.map(sub => `
            <tr>
                <td>${sub.message_id}</td>
                <td>${escapeHtml(sub.user_email || 'Anonymous')}</td>
                <td><span class="badge badge-info">${escapeHtml(sub.source || 'N/A')}</span></td>
                <td>${escapeHtml(sub.sender || 'N/A')}</td>
                <td><span class="content-preview" title="${escapeHtml(sub.content)}">${escapeHtml(sub.content)}</span></td>
                <td>${sub.score ? sub.score.toFixed(1) : 'N/A'}</td>
                <td><span class="badge ${sub.is_scam ? 'badge-danger' : 'badge-success'}">${sub.is_scam ? 'Yes' : 'No'}</span></td>
                <td>${formatDate(sub.created_at)}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn btn-sm btn-primary" onclick="viewSubmissionDetails(${sub.message_id})">View</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading submissions:', error);
        tbody.innerHTML = `<tr><td colspan="9" class="empty-state">Error loading submissions: ${error.message}</td></tr>`;
    }
}

// Load statistics
async function loadStatistics() {
    try {
        const response = await fetchAPI('/admin/statistics');
        const stats = response.statistics || {};

        document.getElementById('detectionRate').textContent =
            stats.detectionRate ? `${stats.detectionRate.toFixed(1)}%` : '0%';
        document.getElementById('activeUsers').textContent = stats.activeUsers || 0;
        document.getElementById('averageScore').textContent =
            stats.averageScore ? stats.averageScore.toFixed(1) : '0';
        document.getElementById('recentActivity').textContent = stats.recentActivity || 0;
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// View report details
async function viewReportDetails(reportId) {
    try {
        const response = await fetchAPI(`/admin/reports/${reportId}`);
        const report = response.report;

        const detailsHtml = `
            <div class="details-grid">
                <div class="detail-item">
                    <div class="detail-label">Report ID:</div>
                    <div class="detail-value">${report.id}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">URL:</div>
                    <div class="detail-value">${escapeHtml(report.url || 'N/A')}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Reporter:</div>
                    <div class="detail-value">${escapeHtml(report.reporter_email || 'Anonymous')}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Channel:</div>
                    <div class="detail-value">${escapeHtml(report.channel || 'N/A')}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Status:</div>
                    <div class="detail-value"><span class="badge ${getStatusBadgeClass(report.status)}">${report.status || 'open'}</span></div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Created:</div>
                    <div class="detail-value">${formatDate(report.created_at)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Details:</div>
                    <div class="detail-value">${escapeHtml(report.details || 'No details provided')}</div>
                </div>
            </div>
        `;

        document.getElementById('detailsContent').innerHTML = detailsHtml;
        document.getElementById('detailsModal').classList.add('active');
    } catch (error) {
        console.error('Error loading report details:', error);
        alert('Error loading report details');
    }
}

// View submission details
async function viewSubmissionDetails(messageId) {
    try {
        const response = await fetchAPI(`/admin/submissions/${messageId}`);
        const submission = response.submission;

        const detailsHtml = `
            <div class="details-grid">
                <div class="detail-item">
                    <div class="detail-label">Message ID:</div>
                    <div class="detail-value">${submission.message_id}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">User:</div>
                    <div class="detail-value">${escapeHtml(submission.user_email || 'Anonymous')}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Source:</div>
                    <div class="detail-value"><span class="badge badge-info">${escapeHtml(submission.source || 'N/A')}</span></div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Sender:</div>
                    <div class="detail-value">${escapeHtml(submission.sender || 'N/A')}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Is Scam:</div>
                    <div class="detail-value"><span class="badge ${submission.is_scam ? 'badge-danger' : 'badge-success'}">${submission.is_scam ? 'Yes' : 'No'}</span></div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Score:</div>
                    <div class="detail-value">${submission.score ? submission.score.toFixed(2) : 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Submitted:</div>
                    <div class="detail-value">${formatDate(submission.created_at)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Content:</div>
                    <div class="detail-value" style="white-space: pre-wrap;">${escapeHtml(submission.content)}</div>
                </div>
                ${submission.explanation ? `
                <div class="detail-item">
                    <div class="detail-label">Analysis:</div>
                    <div class="detail-value">${formatAnalysisExplanation(submission.explanation)}</div>
                </div>
                ` : ''}
            </div>
        `;

        document.getElementById('detailsContent').innerHTML = detailsHtml;
        document.getElementById('detailsModal').classList.add('active');
    } catch (error) {
        console.error('Error loading submission details:', error);
        alert('Error loading submission details');
    }
}

// Update report status
async function updateReportStatus(reportId, newStatus) {
    if (!confirm(`Are you sure you want to mark this report as ${newStatus}?`)) {
        return;
    }

    try {
        await fetchAPI(`/admin/reports/${reportId}`, {
            method: 'PATCH',
            body: JSON.stringify({ status: newStatus })
        });

        loadReports();
        loadStats();
    } catch (error) {
        console.error('Error updating report:', error);
        alert('Error updating report status');
    }
}

// Delete phishing URL
async function deletePhishingUrl(urlId) {
    if (!confirm('Are you sure you want to delete this phishing URL?')) {
        return;
    }

    try {
        await fetchAPI(`/admin/phishing-urls/${urlId}`, {
            method: 'DELETE'
        });

        loadPhishingUrls();
        loadStats();
    } catch (error) {
        console.error('Error deleting URL:', error);
        alert('Error deleting phishing URL');
    }
}

// Open add URL modal
function openAddUrlModal() {
    document.getElementById('addUrlForm').reset();
    document.getElementById('addUrlModal').classList.add('active');
}

// Handle add URL form submission
async function handleAddUrl(e) {
    e.preventDefault();

    const url = document.getElementById('urlInput').value.trim();
    const source = document.getElementById('sourceInput').value.trim();
    const severity = document.getElementById('severityInput').value;
    const notes = document.getElementById('notesInput').value.trim();

    if (!url) {
        alert('URL is required');
        return;
    }

    try {
        const domain = extractDomain(url);

        await fetchAPI('/admin/phishing-urls', {
            method: 'POST',
            body: JSON.stringify({
                url,
                domain,
                source: source || 'admin',
                severity: severity || null,
                notes: notes || null
            })
        });

        closeModals();
        loadPhishingUrls();
        loadStats();
        alert('Phishing URL added successfully');
    } catch (error) {
        console.error('Error adding URL:', error);
        alert(error.message || 'Error adding phishing URL');
    }
}

// Close all modals
function closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}

// Fetch API helper
async function fetchAPI(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
        ...options,
        headers
    });

    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
        throw new Error('Unauthorized');
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'API request failed');
    }

    return data;
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function extractDomain(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname;
    } catch {
        return '';
    }
}

function getStatusBadgeClass(status) {
    const statusMap = {
        'open': 'badge-warning',
        'in_review': 'badge-info',
        'resolved': 'badge-success',
        'rejected': 'badge-secondary'
    };
    return statusMap[status] || 'badge-secondary';
}

function getSeverityBadgeClass(severity) {
    const severityMap = {
        'low': 'badge-info',
        'medium': 'badge-warning',
        'high': 'badge-danger',
        'critical': 'badge-danger'
    };
    return severityMap[severity] || 'badge-secondary';
}

function formatAnalysisExplanation(explanation) {
    if (!explanation) return 'N/A';

    if (typeof explanation === 'string') {
        return escapeHtml(explanation);
    }

    if (typeof explanation === 'object') {
        return `<pre style="background: #f1f5f9; padding: 1rem; border-radius: 0.5rem; overflow-x: auto;">${escapeHtml(JSON.stringify(explanation, null, 2))}</pre>`;
    }

    return 'N/A';
}
