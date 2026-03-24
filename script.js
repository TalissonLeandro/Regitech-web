class EquipmentManager {
    constructor() {
        this.checkAuthentication();
        this.equipments = this.loadFromStorage();
        this.initializeEventListeners();
        this.setupUserInterface();
        this.renderEquipments();
    }

    checkAuthentication() {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }
        this.currentUser = JSON.parse(currentUser);
    }

    setupUserInterface() {
        const displayName = this.currentUser.username || this.currentUser.displayName || this.currentUser.email || 'Usuário';
        document.getElementById('welcomeMessage').textContent = `Bem-vindo, ${displayName}!`;
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
    }

    logout() {
        if (confirm('Tem certeza que deseja sair?')) {
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        }
    }

    initializeEventListeners() {
        document.getElementById('equipmentForm').addEventListener('submit', (e) => this.handleSubmit(e));
        document.getElementById('searchInput').addEventListener('input', () => this.renderEquipments());
        document.getElementById('filterStatus').addEventListener('change', () => this.renderEquipments());
        document.getElementById('filterType').addEventListener('change', () => this.renderEquipments());
    }

    handleSubmit(e) {
        e.preventDefault();

        const equipment = {
            id: Date.now().toString(),
            tipo: document.getElementById('tipo').value,
            patrimonio: document.getElementById('patrimonio').value,
            usuario: document.getElementById('usuario').value,
            localizacao: document.getElementById('localizacao').value,
            status: document.getElementById('status').value,
            dataCadastro: new Date().toLocaleDateString('pt-BR')
        };

        if (this.equipments.some(eq => eq.patrimonio === equipment.patrimonio)) {
            alert('Numero de patrimonio ja cadastrado!');
            return;
        }

        this.equipments.unshift(equipment);
        this.saveToStorage();
        this.renderEquipments();
        e.target.reset();
        alert('Equipamento cadastrado com sucesso!');
    }

    deleteEquipment(id) {
        if (!confirm('Tem certeza que deseja excluir este equipamento?')) return;
        this.equipments = this.equipments.filter(eq => eq.id !== id);
        this.saveToStorage();
        this.renderEquipments();
    }

    getFilteredEquipments() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const statusFilter = document.getElementById('filterStatus').value;
        const typeFilter = document.getElementById('filterType').value;

        return this.equipments.filter(eq => {
            const matchesSearch =
                eq.patrimonio.toLowerCase().includes(searchTerm) ||
                eq.usuario.toLowerCase().includes(searchTerm) ||
                eq.localizacao.toLowerCase().includes(searchTerm);
            return matchesSearch &&
                (!statusFilter || eq.status === statusFilter) &&
                (!typeFilter || eq.tipo === typeFilter);
        });
    }

    renderEquipments() {
        const container = document.getElementById('equipmentList');
        const filtered = this.getFilteredEquipments();

        if (filtered.length === 0) {
            container.innerHTML = '<div class="no-equipment">Nenhum equipamento encontrado</div>';
            return;
        }

        container.innerHTML = filtered.map(eq => `
            <div class="equipment-item">
                <div class="equipment-header">
                    <div class="equipment-patrimonio">${eq.patrimonio}</div>
                    <div class="equipment-type">${eq.tipo}</div>
                </div>
                <div class="equipment-details">
                    <div class="equipment-detail"><strong>Usuario:</strong> ${eq.usuario}</div>
                    <div class="equipment-detail"><strong>Localizacao:</strong> ${eq.localizacao}</div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span class="status ${eq.status}">${this.getStatusLabel(eq.status)}</span>
                    <div>
                        <small style="color: #7f8c8d;">Cadastrado em: ${eq.dataCadastro}</small>
                        <button class="delete-btn" onclick="equipmentManager.deleteEquipment('${eq.id}')">Excluir</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    getStatusLabel(status) {
        const labels = { 'em-uso': 'Em Uso', 'manutencao': 'Manutencao', 'disponivel': 'Disponivel' };
        return labels[status] || status;
    }

    saveToStorage() {
        localStorage.setItem('equipments', JSON.stringify(this.equipments));
    }

    loadFromStorage() {
        const stored = localStorage.getItem('equipments');
        return stored ? JSON.parse(stored) : [];
    }
}

let equipmentManager;
document.addEventListener('DOMContentLoaded', () => {
    equipmentManager = new EquipmentManager();
});
