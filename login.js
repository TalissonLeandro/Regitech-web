class AuthManager {
    constructor() {
        this.demoUsers = [
            { username: 'admin', password: '123456', role: 'admin' },
            { username: 'user', password: 'user123', role: 'user' }
        ];
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

        // Tentar login demo
        const demoUser = this.demoUsers.find(u => u.username === username && u.password === password);
        if (demoUser) {
            localStorage.setItem('currentUser', JSON.stringify({
                username: demoUser.username,
                role: demoUser.role,
                loginTime: new Date().toISOString(),
                isDemo: true
            }));
            window.location.href = 'index.html';
            return;
        }

        // Tentar login com usuários cadastrados localmente
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const localUser = registeredUsers.find(u => u.email === username && u.password === password);
        if (localUser) {
            localStorage.setItem('currentUser', JSON.stringify({
                username: localUser.fullName,
                email: localUser.email,
                role: localUser.role,
                loginTime: new Date().toISOString(),
                isDemo: false
            }));
            window.location.href = 'index.html';
            return;
        }

        this.showError('Usuário ou senha incorretos!');
    }

    showError(message) {
        const el = document.getElementById('errorMessage');
        el.textContent = message;
        el.classList.add('show');
    }
}

document.addEventListener('DOMContentLoaded', () => new AuthManager());
