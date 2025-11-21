// auth.js - Authentication functionality for login and signup pages
const API_BASE_URL = 'http://localhost:3000/api';

// Check if user is already logged in
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (token && user) {
        // Redirect to dashboard if already logged in
        if (window.location.pathname === '/login.html' || window.location.pathname === '/signup.html') {
            window.location.href = '/dashboard.html';
        }
    }
}

// Show alert message
function showAlert(message, type = 'error') {
    const alertDiv = document.getElementById('alertMessage');
    if (!alertDiv) return;

    alertDiv.textContent = message;
    alertDiv.className = `alert alert-${type}`;
    alertDiv.style.display = 'block';

    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            alertDiv.style.display = 'none';
        }, 5000);
    }
}

// Hide alert message
function hideAlert() {
    const alertDiv = document.getElementById('alertMessage');
    if (alertDiv) {
        alertDiv.style.display = 'none';
    }
}

// Show loading state on button
function setButtonLoading(button, isLoading) {
    const spinner = button.querySelector('.spinner');
    const text = button.querySelector('.btn-text');

    if (isLoading) {
        spinner.classList.remove('hidden');
        text.textContent = 'Please wait...';
        button.disabled = true;
    } else {
        spinner.classList.add('hidden');
        button.disabled = false;
    }
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    hideAlert();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const loginBtn = document.getElementById('loginBtn');

    // Validation
    if (!email || !password) {
        showAlert('Please fill in all fields', 'error');
        return;
    }

    setButtonLoading(loginBtn, true);

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        // Save auth data to localStorage
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
        }

        // Also save to chrome.storage for extension access
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.set({
                authToken: data.token,
                user: data.user
            }).catch(() => {
                // Silently fail if not in extension context
                console.log('Not in extension context');
            });
        }

        showAlert('Login successful! Redirecting...', 'success');

        // Redirect to dashboard or report page
        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 1500);

    } catch (error) {
        console.error('Login error:', error);
        showAlert(error.message || 'Login failed. Please check your credentials.', 'error');
        setButtonLoading(loginBtn, false);
        document.querySelector('.btn-text').textContent = 'Sign In';
    }
}

// Handle Signup
async function handleSignup(e) {
    e.preventDefault();
    hideAlert();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    const signupBtn = document.getElementById('signupBtn');

    // Validation
    if (!name || !email || !password || !confirmPassword) {
        showAlert('Please fill in all fields', 'error');
        return;
    }

    if (!agreeTerms) {
        showAlert('Please agree to the Terms of Service and Privacy Policy', 'error');
        return;
    }

    if (password.length < 6) {
        showAlert('Password must be at least 6 characters long', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showAlert('Passwords do not match', 'error');
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showAlert('Please enter a valid email address', 'error');
        return;
    }

    setButtonLoading(signupBtn, true);

    try {
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Signup failed');
        }

        // Save auth data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        showAlert('Account created successfully! Redirecting...', 'success');

        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 1500);

    } catch (error) {
        console.error('Signup error:', error);
        showAlert(error.message || 'Signup failed. Please try again.', 'error');
        setButtonLoading(signupBtn, false);
        document.querySelector('.btn-text').textContent = 'Create Account';
    }
}

// Logout function
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    window.location.href = '/login.html';
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    checkAuthStatus();

    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);

        // Auto-fill email if remembered
        if (localStorage.getItem('rememberMe') === 'true') {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.email) {
                document.getElementById('email').value = user.email;
                document.getElementById('rememberMe').checked = true;
            }
        }
    }

    // Signup form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);

        // Real-time password match validation
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirmPassword');

        if (confirmPassword) {
            confirmPassword.addEventListener('input', () => {
                if (confirmPassword.value && password.value !== confirmPassword.value) {
                    confirmPassword.setCustomValidity('Passwords do not match');
                } else {
                    confirmPassword.setCustomValidity('');
                }
            });
        }
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { logout };
}
