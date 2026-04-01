class AIAssistant {
    constructor() {
        // Limpa key corrompida (duplicada) do localStorage
        const stored = localStorage.getItem('geminiApiKey') || '';
        const match = stored.match(/AIza[A-Za-z0-9_\-]{35}/);
        if (stored && match && stored !== match[0]) {
            localStorage.setItem('geminiApiKey', match[0]);
        }
        this.apiKey = match ? match[0] : stored;
        this.initializeUI();
        this.setupEventListeners();
    }

    initializeUI() {
        const panel = document.createElement('div');
        panel.id = 'aiWidget';
        panel.className = 'ai-widget';
        panel.innerHTML = `
            <button class="ai-toggle" id="aiToggle">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7A1,1 0 0,0 14,8H18A1,1 0 0,0 19,7V5.73C18.4,5.39 18,4.74 18,4A2,2 0 0,1 20,2A2,2 0 0,1 22,4C22,4.74 21.6,5.39 21,5.73V7A3,3 0 0,1 18,10H14A3,3 0 0,1 11,7V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2Z"/>
                </svg>
                IA Gemini
            </button>

            <div class="ai-panel" id="aiPanel" style="display:none;">
                <div class="ai-header">
                    <h3>🤖 Assistente Gemini AI</h3>
                    <button class="ai-close" id="aiClose">×</button>
                </div>

                <div class="ai-config">
                    <label>API Key do Gemini:</label>
                    <div style="display:flex;flex-direction:row;gap:8px;align-items:center;width:100%;box-sizing:border-box;margin-top:8px;">
                        <input type="password" id="apiKeyInput" placeholder="Cole sua API key aqui..." style="flex:1 1 auto;min-width:0;padding:8px 12px;border:2px solid #ddd;border-radius:6px;font-size:13px;outline:none;box-sizing:border-box;">
                        <button id="saveApiKey" style="flex:0 0 auto;background:#667eea;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;white-space:nowrap;">Salvar</button>
                    </div>
                    <small id="apiKeyStatus"></small>
                </div>

                <div class="ai-features">
                    <h4>Funcionalidades IA:</h4>
                    <button class="ai-feature-btn" data-feature="analyze">📊 Analisar Equipamentos</button>
                    <button class="ai-feature-btn" data-feature="report">📋 Gerar Relatório</button>
                    <button class="ai-feature-btn" data-feature="predict">🔮 Previsões</button>
                    <button class="ai-feature-btn" data-feature="chat">💬 Chat Inteligente</button>
                </div>

                <div class="ai-results" id="aiResults"></div>
            </div>
        `;
        document.body.appendChild(panel);

        // Chat fullscreen separado
        const chat = document.createElement('div');
        chat.id = 'chatFullscreen';
        chat.className = 'chat-fullscreen';
        chat.style.display = 'none';
        chat.innerHTML = `
            <div class="chat-fullscreen-header">
                <h2>🤖 Chat Gemini AI</h2>
                <button id="chatBack">← Voltar</button>
            </div>
            <div class="chat-fullscreen-messages" id="chatMessages"></div>
            <div class="chat-fullscreen-input">
                <input type="text" id="chatInput" placeholder="Digite sua mensagem...">
                <button id="chatSend">Enviar</button>
            </div>
        `;
        document.body.appendChild(chat);

        // Preenche o input com a key salva e atualiza status
        this.updateKeyStatus();
    }

    updateKeyStatus() {
        const input = document.getElementById('apiKeyInput');
        const status = document.getElementById('apiKeyStatus');
        if (input) input.value = this.apiKey;
        if (status) {
            status.textContent = this.apiKey ? '✅ API Key configurada' : '⚠️ Insira sua API Key';
        }
    }

    setupEventListeners() {
        document.getElementById('aiToggle').addEventListener('click', () => this.togglePanel());
        document.getElementById('aiClose').addEventListener('click', () => this.closePanel());
        document.getElementById('saveApiKey').addEventListener('click', () => this.saveApiKey());
        document.getElementById('chatBack').addEventListener('click', () => this.closeChat());
        document.getElementById('chatSend').addEventListener('click', () => this.sendMessage());
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        document.querySelectorAll('.ai-feature-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.executeFeature(e.currentTarget.dataset.feature);
            });
        });
    }

    togglePanel() {
        const panel = document.getElementById('aiPanel');
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }

    closePanel() {
        const results = document.getElementById('aiResults');
        // Se tiver conteúdo nos resultados, limpa e volta para tela inicial
        if (results && results.innerHTML.trim() !== '') {
            results.innerHTML = '';
        } else {
            document.getElementById('aiPanel').style.display = 'none';
        }
    }

    saveApiKey() {
        const raw = document.getElementById('apiKeyInput').value.trim();
        if (!raw) {
            alert('Insira uma API Key válida!');
            return;
        }
        // Remove duplicatas: pega só a última ocorrência da key real
        // A key do Gemini começa com "AIza" e tem 39 chars
        const match = raw.match(/AIza[A-Za-z0-9_\-]{35}/);
        const key = match ? match[0] : raw;

        localStorage.removeItem('geminiApiKey');
        this.apiKey = key;
        localStorage.setItem('geminiApiKey', key);
        document.getElementById('apiKeyInput').value = key;
        this.updateKeyStatus();
        alert('✅ API Key salva com sucesso!');
    }

    async executeFeature(feature) {
        if (feature === 'chat') {
            this.closePanel();
            this.openChat();
            return;
        }

        if (!this.apiKey) {
            document.getElementById('aiResults').innerHTML =
                '<div class="ai-error">⚠️ Configure sua API Key primeiro e clique em Salvar.</div>';
            return;
        }

        document.getElementById('aiResults').innerHTML = '<div class="ai-loading">🤖 Processando...</div>';

        try {
            if (feature === 'analyze') await this.analyzeEquipments();
            else if (feature === 'report') await this.generateReport();
            else if (feature === 'predict') await this.makePredictions();
        } catch (error) {
            document.getElementById('aiResults').innerHTML =
                `<div class="ai-error">❌ Erro: ${error.message}</div>`;
        }
    }

    async callGemini(prompt) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error?.message || `HTTP ${res.status}`);
        }

        const data = await res.json();
        return data.candidates[0].content.parts[0].text;
    }

    getEquipmentStats() {
        // Lê direto do localStorage - fonte mais confiável
        let equipments = [];
        try {
            const raw = localStorage.getItem('equipments');
            equipments = raw ? JSON.parse(raw) : [];
        } catch(e) {
            equipments = [];
        }
        // Fallback para o manager em memória
        if (equipments.length === 0 && window.equipmentManager?.equipments?.length > 0) {
            equipments = window.equipmentManager.equipments;
        }
        const stats = { total: equipments.length, byType: {}, byStatus: {}, byLocation: {} };
        equipments.forEach(eq => {
            stats.byType[eq.tipo] = (stats.byType[eq.tipo] || 0) + 1;
            stats.byStatus[eq.status] = (stats.byStatus[eq.status] || 0) + 1;
            stats.byLocation[eq.localizacao] = (stats.byLocation[eq.localizacao] || 0) + 1;
        });
        return { equipments, stats };
    }

    async analyzeEquipments() {
        const { stats } = this.getEquipmentStats();
        if (stats.total === 0) {
            document.getElementById('aiResults').innerHTML =
                '<div class="ai-info">ℹ️ Nenhum equipamento cadastrado para analisar.</div>';
            return;
        }

        const prompt = `Analise este inventário de equipamentos de TI e forneça insights em português:
Total: ${stats.total} equipamentos
Por tipo: ${JSON.stringify(stats.byType)}
Por status: ${JSON.stringify(stats.byStatus)}
Por localização: ${JSON.stringify(stats.byLocation)}
Forneça insights principais, problemas identificados e recomendações. Máximo 5 tópicos.`;

        const result = await this.callGemini(prompt);
        document.getElementById('aiResults').innerHTML = `
            <div class="ai-result-box">
                <h4>📊 Análise dos Equipamentos</h4>
                <div class="ai-stats-grid">
                    <div class="ai-stat"><span>${stats.total}</span>Total</div>
                    <div class="ai-stat"><span>${stats.byStatus['em-uso'] || 0}</span>Em Uso</div>
                    <div class="ai-stat"><span>${stats.byStatus['disponivel'] || 0}</span>Disponíveis</div>
                    <div class="ai-stat"><span>${stats.byStatus['manutencao'] || 0}</span>Manutenção</div>
                </div>
                <div class="ai-text">${result.replace(/\n/g, '<br>')}</div>
            </div>`;
    }

    async generateReport() {
        const { stats } = this.getEquipmentStats();

        const prompt = `Gere um relatório executivo profissional em português para este inventário de TI:
Total: ${stats.total} equipamentos
Por tipo: ${JSON.stringify(stats.byType)}
Por status: ${JSON.stringify(stats.byStatus)}
Por localização: ${JSON.stringify(stats.byLocation)}
Inclua: resumo executivo, análise de distribuição, status do inventário e recomendações estratégicas.`;

        const result = await this.callGemini(prompt);
        document.getElementById('aiResults').innerHTML = `
            <div class="ai-result-box">
                <h4>📋 Relatório Executivo</h4>
                <small>Gerado em: ${new Date().toLocaleString('pt-BR')}</small>
                <div class="ai-text">${result.replace(/\n/g, '<br>')}</div>
                <button class="ai-download-btn" onclick="window.aiAssistant.downloadCSV()">📥 Baixar CSV</button>
            </div>`;
    }

    async makePredictions() {
        const { stats } = this.getEquipmentStats();

        const prompt = `Com base neste inventário de TI, faça previsões e recomendações preventivas em português:
Total: ${stats.total} equipamentos
Por tipo: ${JSON.stringify(stats.byType)}
Por status: ${JSON.stringify(stats.byStatus)}
Por localização: ${JSON.stringify(stats.byLocation)}
Forneça: previsões de manutenção, alertas preventivos e sugestões de otimização.`;

        const result = await this.callGemini(prompt);
        document.getElementById('aiResults').innerHTML = `
            <div class="ai-result-box">
                <h4>🔮 Previsões e Recomendações</h4>
                <div class="ai-text">${result.replace(/\n/g, '<br>')}</div>
            </div>`;
    }

    downloadCSV() {
        const { equipments } = this.getEquipmentStats();
        const headers = ['Patrimônio', 'Tipo', 'Usuário', 'Localização', 'Status', 'Data Cadastro'];
        const rows = equipments.map(eq => [
            eq.patrimonio, eq.tipo, eq.usuario, eq.localizacao, eq.status, eq.dataCadastro
        ]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }));
        a.download = `equipamentos_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    }

    openChat() {
        const screen = document.getElementById('chatFullscreen');
        screen.style.cssText = 'display:flex;position:fixed;top:0;left:0;right:0;bottom:0;flex-direction:column;background:#f0f2f5;z-index:2000;';
        document.getElementById('chatMessages').innerHTML = '';
        this.addChatMessage('Olá! Sou o assistente Gemini AI. Como posso ajudar com os equipamentos?', false);
        document.getElementById('chatInput').focus();
    }

    closeChat() {
        document.getElementById('chatFullscreen').style.cssText = 'display:none;';
    }

    async sendMessage() {
        if (!this.apiKey) {
            this.addChatMessage('⚠️ Configure sua API Key no painel da IA antes de usar o chat.', false);
            return;
        }

        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        if (!message) return;

        this.addChatMessage(message, true);
        input.value = '';

        const typingId = 'typing-' + Date.now();
        this.addChatMessage('🤖 Digitando...', false, typingId);

        try {
            const { stats } = this.getEquipmentStats();
            const prompt = `Você é um assistente de gestão de equipamentos de TI. Responda em português de forma clara e objetiva (máximo 3 parágrafos).
Dados do inventário: ${stats.total} equipamentos. Por status: ${JSON.stringify(stats.byStatus)}. Por tipo: ${JSON.stringify(stats.byType)}.
Pergunta: ${message}`;

            const response = await this.callGemini(prompt);
            document.getElementById(typingId)?.remove();
            this.addChatMessage(response, false);
        } catch (error) {
            document.getElementById(typingId)?.remove();
            this.addChatMessage(`❌ Erro: ${error.message}. Verifique sua API Key.`, false);
        }
    }

    addChatMessage(text, isUser, id = '') {
        const div = document.createElement('div');
        div.className = `chat-msg ${isUser ? 'user' : 'bot'}`;
        if (id) div.id = id;
        div.innerHTML = text.replace(/\n/g, '<br>');
        const container = document.getElementById('chatMessages');
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.aiAssistant = new AIAssistant();
});
