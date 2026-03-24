class AuthManager {
    constructor() {
        this.checkExistingSession();
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
    }

    checkExistingSession() {
        if (localStorage.getItem('currentUser')) {
            window.location.href = 'index.html';
        }
    }

    handleLogin(e) {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        document.getElementById('errorMessage').classList.remove('show');

        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const user = registeredUsers.find(u => u.email === username && u.password === password);

        if (user) {
            localStorage.setItem('currentUser', JSON.stringify({
                username: user.fullName,
                email: user.email,
                role: user.role,
                loginTime: new Date().toISOString()
            }));
            window.location.href = 'index.html';
            return;
        }

        this.showError('Email ou senha incorretos!');
    }

    showError(message) {
        const el = document.getElementById('errorMessage');
        el.textContent = message;
        el.classList.add('show');
    }
}

document.addEventListener('DOMContentLoaded', () => new AuthManager());
