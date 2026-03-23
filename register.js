class RegisterManager {
    constructor() {
        this.checkExistingSession();
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));
    }

    checkExistingSession() {
        if (localStorage.getItem('currentUser')) {
            window.location.href = 'index.html';
        }
    }

    handleRegister(e) {
        e.preventDefault();
        this.clearMessages();

        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!this.validateForm(fullName, email, password, confirmPassword)) return;

        // Verificar se email já existe
        const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        if (existingUsers.some(u => u.email === email)) {
            this.showError('Este email já está cadastrado!');
            return;
        }

        // Salvar novo usuário
        existingUsers.push({
            id: Date.now().toString(),
            fullName,
            email,
            password,
            role: 'user',
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));

        // Criar sessão
        localStorage.setItem('currentUser', JSON.stringify({
            username: fullName,
            email,
            role: 'user',
            loginTime: new Date().toISOString(),
            isDemo: false
        }));

        this.showSuccess('Conta criada com sucesso! Redirecionando...');
        setTimeout(() => { window.location.href = 'index.html'; }, 2000);
    }

    validateForm(fullName, email, password, confirmPassword) {
        if (fullName.length < 2) { this.showError('Nome deve ter pelo menos 2 caracteres'); return false; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { this.showError('Email inválido'); return false; }
        if (password.length < 6) { this.showError('Senha deve ter pelo menos 6 caracteres'); return false; }
        if (password !== confirmPassword) { this.showError('Senhas não coincidem'); return false; }
        return true;
    }

    showError(msg) { const el = document.getElementById('errorMessage'); el.textContent = msg; el.classList.add('show'); }
    showSuccess(msg) { const el = document.getElementById('successMessage'); el.textContent = msg; el.classList.add('show'); }
    clearMessages() {
        document.getElementById('errorMessage').classList.remove('show');
        document.getElementById('successMessage').classList.remove('show');
    }
}

document.addEventListener('DOMContentLoaded', () => new RegisterManager());
