class EquipmentManager {
    constructor() {
        this.checkAuthentication();
        this.equipments = [];
        this.initializeEventListeners();
        this.setupUserInterface();
        this.loadEquipments();
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
        const welcomeMessage = document.getElementById('welcomeMessage');
        const logoutBtn = document.getElementById('logoutBtn');

        const displayName = this.currentUser.username || this.currentUser.displayName || this.currentUser.email || 'Usuário';
        welcomeMessage.textContent = `Bem-vindo, ${displayName}!`;
        logoutBtn.addEventListener('click', () => this.logout());
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

    async loadEquipments() {
        // Tentar carregar do Firebase, fallback para localStorage
        if (window.db && window.firebaseModules) {
            await this.loadFromFirebase();
        } else {
            // Aguardar Firebase por até 3 segundos
            let attempts = 0;
            const wait = setInterval(async () => {
                attempts++;
                if (window.db && window.firebaseModules) {
                    clearInterval(wait);
                    await this.loadFromFirebase();
                } else if (attempts >= 30) {
                    clearInterval(wait);
                    console.warn('Firebase não disponível, usando localStorage');
                    this.equipments = this.loadFromStorage();
                    this.renderEquipments();
                }
            }, 100);
        }
    }

    async loadFromFirebase() {
        try {
            const { collection, getDocs, query, orderBy } = window.firebaseModules;
            const q = query(collection(window.db, 'equipamentos'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);

            this.equipments = [];
            snapshot.forEach(doc => {
                this.equipments.push({ id: doc.id, ...doc.data() });
            });

            this.renderEquipments();
        } catch (error) {
            console.error('Erro ao carregar do Firebase:', error);
            this.equipments = this.loadFromStorage();
            this.renderEquipments();
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        const equipment = {
            tipo: document.getElementById('tipo').value,
            patrimonio: document.getElementById('patrimonio').value,
            usuario: document.getElementById('usuario').value,
            localizacao: document.getElementById('localizacao').value,
            status: document.getElementById('status').value,
            dataCadastro: new Date().toLocaleDateString('pt-BR'),
            createdAt: new Date().toISOString()
        };

        if (this.equipments.some(eq => eq.patrimonio === equipment.patrimonio)) {
            alert('Número de patrimônio já cadastrado!');
            return;
        }

        try {
            if (window.db && window.firebaseModules) {
                const { collection, addDoc } = window.firebaseModules;
                const docRef = await addDoc(collection(window.db, 'equipamentos'), equipment);
                equipment.id = docRef.id;
            } else {
                equipment.id = Date.now().toString();
                this.saveToStorage();
            }

            this.equipments.unshift(equipment);
            this.renderEquipments();
            e.target.reset();
            alert('Equipamento cadastrado com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao cadastrar equipamento. Tente novamente.');
        }
    }

    async deleteEquipment(id) {
        if (!confirm('Tem certeza que deseja excluir este equipamento?')) return;

        try {
            if (window.db && window.firebaseModules) {
                const { deleteDoc, doc } = window.firebaseModules;
                await deleteDoc(doc(window.db, 'equipamentos', id));
            }

            this.equipments = this.equipments.filter(eq => eq.id !== id);
            this.saveToStorage();
            this.renderEquipments();
        } catch (error) {
            console.error('Erro ao excluir:', error);
            alert('Erro ao excluir equipamento. Tente novamente.');
        }
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
            const matchesStatus = !statusFilter || eq.status === statusFilter;
            const matchesType = !typeFilter || eq.tipo === typeFilter;
            return matchesSearch && matchesStatus && matchesType;
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
                    <div class="equipment-detail"><strong>Usuário:</strong> ${eq.usuario}</div>
                    <div class="equipment-detail"><strong>Localização:</strong> ${eq.localizacao}</div>
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
        const labels = { 'em-uso': 'Em Uso', 'manutencao': 'Manutenção', 'disponivel': 'Disponível' };
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
