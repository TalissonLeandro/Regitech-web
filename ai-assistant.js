class AIAssistant {
    constructor() {
        this.apiKey = localStorage.getItem('geminiApiKey') || '';
        this.initializeUI();
        this.setupEventListeners();
    }

    initializeUI() {
        const aiHTML = `
            <div class="ai-widget" id="aiWidget">
                <button class="ai-toggle" id="aiToggle">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7A1,1 0 0,0 14,8H18A1,1 0 0,0 19,7V5.73C18.4,5.39 18,4.74 18,4A2,2 0 0,1 20,2A2,2 0 0,1 22,4C22,4.74 21.6,5.39 21,5.73V7A3,3 0 0,1 18,10H14A3,3 0 0,1 11,7V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2Z"/>
                    </svg>
                    <span>IA Gemini</span>
                </button>
                
                <div class="ai-panel" id="aiPanel">
                    <div class="ai-header">
                        <h3>🤖 Assistente Gemini AI</h3>
                        <button class="ai-close" id="aiClose">×</button>
                    </div>

                    <div class="ai-config" id="aiConfig">
                        <label>API Key do Gemini:</label>
                        <div style="display: flex; gap: 8px; margin-top: 6px;">
                            <input type="password" id="apiKeyInput" placeholder="Cole sua API key aqui..." value="${this.apiKey}">
                            <button id="saveApiKey">Salvar</button>
                        </div>
                        <small id="apiKeyStatus">${this.apiKey ? '✅ API Key configurada' : '⚠️ Insira sua API Key para usar a IA'}</small>
                    </div>
                    
                    <div class="ai-features">
                        <h4>Funcionalidades IA:</h4>
                        <button class="ai-feature-btn" data-feature="analyze">📊 Analisar Equipamentos</button>
                        <button class="ai-feature-btn" data-feature="report">📋 Gerar Relatório</button>
                        <button class="ai-feature-btn" data-feature="predict">🔮 Previsões</button>
                        <button class="ai-feature-btn" data-feature="chat">💬 Chat Inteligente</button>
                    </div>
                    
                    <div class="ai-chat" id="aiChat" style="display: none;">
                        <div class="ai-messages" id="aiMessages"></div>
                        <div class="ai-input-area">
                            <input type="text" id="aiInput" placeholder="Pergunte sobre os equipamentos...">
                            <button id="aiSend">Enviar</button>
                        </div>
                    </div>
                    
                    <div class="ai-results" id="aiResults"></div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', aiHTML);
    }

    setupEventListeners() {
        document.getElementById('aiToggle').addEventListener('click', () => this.togglePanel());
        document.getElementById('aiClose').addEventListener('click', () => this.closePanel());
        document.getElementById('saveApiKey').addEventListener('click', () => this.saveApiKey());
        document.getElementById('aiSend').addEventListener('click', () => this.sendMessage());
        document.getElementById('aiInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        document.querySelectorAll('.ai-feature-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.executeFeature(e.target.dataset.feature));
        });
    }

    saveApiKey() {
        const key = document.getElementById('apiKeyInput').value.trim();
        if (!key) {
            alert('Insira uma API Key válida!');
            return;
        }
        this.apiKey = key;
        localStorage.setItem('geminiApiKey', key);
        document.getElementById('apiKeyStatus').textContent = '✅ API Key configurada';
        alert('API Key salva com sucesso!');
    }

    togglePanel() {
        const panel = document.getElementById('aiPanel');
        panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
    }

    closePanel() {
        document.getElementById('aiPanel').style.display = 'none';
    }

    async executeFeature(feature) {
        if (!this.apiKey) {
            document.getElementById('aiResults').innerHTML = '<div class="error">⚠️ Configure sua API Key do Gemini antes de usar a IA.</div>';
            return;
        }

        const resultsDiv = document.getElementById('aiResults');
        resultsDiv.innerHTML = '<div class="loading">🤖 Processando com Gemini AI...</div>';

        try {
            switch (feature) {
                case 'analyze':
                    await this.analyzeEquipments();
                    break;
                case 'report':
                    await this.generateReport();
                    break;
                case 'predict':
                    await this.makePredictions();
                    break;
                case 'chat':
                    this.showChat();
                    break;
            }
        } catch (error) {
            resultsDiv.innerHTML = `<div class="error">Erro: ${error.message}</div>`;
        }
    }

    async analyzeEquipments() {
        const equipments = window.equipmentManager?.equipments || [];
        
        if (equipments.length === 0) {
            document.getElementById('aiResults').innerHTML = '<div class="info">Nenhum equipamento para analisar</div>';
            return;
        }

        const basicStats = this.getBasicStats(equipments);
        
        const prompt = `Analise os seguintes dados de equipamentos de TI e forneça insights profissionais:

Dados dos equipamentos:
${JSON.stringify(equipments.slice(0, 10), null, 2)}

Estatísticas básicas:
- Total: ${basicStats.total} equipamentos
- Por tipo: ${JSON.stringify(basicStats.byType)}
- Por status: ${JSON.stringify(basicStats.byStatus)}
- Por localização: ${JSON.stringify(basicStats.byLocation)}

Forneça uma análise profissional incluindo:
1. Principais insights sobre o inventário
2. Possíveis problemas identificados
3. Recomendações de melhoria
4. Sugestões de otimização

Responda em português de forma clara e objetiva.`;

        try {
            const aiAnalysis = await this.callGemini(prompt);
            this.displayAnalysis(basicStats, aiAnalysis);
        } catch (error) {
            this.displayAnalysis(basicStats, 'Erro ao obter análise da IA: ' + error.message);
        }
    }

    getBasicStats(equipments) {
        const stats = {
            total: equipments.length,
            byType: {},
            byStatus: {},
            byLocation: {},
            recentlyAdded: 0
        };

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        equipments.forEach(eq => {
            stats.byType[eq.tipo] = (stats.byType[eq.tipo] || 0) + 1;
            stats.byStatus[eq.status] = (stats.byStatus[eq.status] || 0) + 1;
            stats.byLocation[eq.localizacao] = (stats.byLocation[eq.localizacao] || 0) + 1;
            
            const addedDate = new Date(eq.dataCadastro.split('/').reverse().join('-'));
            if (addedDate > oneWeekAgo) {
                stats.recentlyAdded++;
            }
        });

        return stats;
    }

    async callGemini(prompt) {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    displayAnalysis(stats, aiAnalysis) {
        const html = `
            <div class="analysis-results">
                <h4>📊 Análise dos Equipamentos</h4>
                
                <div class="stat-grid">
                    <div class="stat-item">
                        <span class="stat-number">${stats.total}</span>
                        <span class="stat-label">Total de Equipamentos</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${stats.recentlyAdded}</span>
                        <span class="stat-label">Adicionados (7 dias)</span>
                    </div>
                </div>

                <div class="breakdown">
                    <h5>Por Tipo:</h5>
                    ${Object.entries(stats.byType).map(([type, count]) => 
                        `<div class="breakdown-item">${type}: ${count}</div>`
                    ).join('')}
                </div>

                <div class="breakdown">
                    <h5>Por Status:</h5>
                    ${Object.entries(stats.byStatus).map(([status, count]) => 
                        `<div class="breakdown-item">${status}: ${count}</div>`
                    ).join('')}
                </div>

                <div class="ai-insights">
                    <h5>🤖 Análise Gemini AI:</h5>
                    <div class="ai-text">${aiAnalysis.replace(/\n/g, '<br>')}</div>
                </div>
            </div>
        `;

        document.getElementById('aiResults').innerHTML = html;
    }

    async generateReport() {
        const equipments = window.equipmentManager?.equipments || [];
        
        const prompt = `Gere um relatório executivo profissional baseado nos seguintes dados de equipamentos:

${JSON.stringify(equipments, null, 2)}

O relatório deve incluir:
1. Resumo executivo
2. Análise da distribuição de equipamentos
3. Status atual do inventário
4. Recomendações estratégicas
5. Próximos passos sugeridos

Formate como um relatório profissional em português.`;

        try {
            const report = await this.callGemini(prompt);
            
            const html = `
                <div class="report-results">
                    <h4>📋 Relatório Executivo</h4>
                    <p><strong>Gerado em:</strong> ${new Date().toLocaleString('pt-BR')}</p>
                    
                    <div class="report-content">
                        ${report.replace(/\n/g, '<br>')}
                    </div>

                    <button onclick="aiAssistant.downloadReport()" class="download-btn">📥 Baixar Dados CSV</button>
                </div>
            `;

            document.getElementById('aiResults').innerHTML = html;
        } catch (error) {
            document.getElementById('aiResults').innerHTML = `<div class="error">Erro ao gerar relatório: ${error.message}</div>`;
        }
    }

    downloadReport() {
        const equipments = window.equipmentManager?.equipments || [];
        const csvContent = this.generateCSV(equipments);
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio_equipamentos_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    generateCSV(equipments) {
        const headers = ['Patrimônio', 'Tipo', 'Usuário', 'Localização', 'Status', 'Data Cadastro'];
        const rows = equipments.map(eq => [
            eq.patrimonio,
            eq.tipo,
            eq.usuario,
            eq.localizacao,
            eq.status,
            eq.dataCadastro
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    async makePredictions() {
        const equipments = window.equipmentManager?.equipments || [];
        
        const prompt = `Baseado nos dados dos equipamentos abaixo, faça previsões e recomendações:

${JSON.stringify(equipments, null, 2)}

Analise e forneça:
1. Equipamentos que podem precisar de manutenção em breve
2. Padrões de utilização identificados
3. Recomendações de otimização
4. Alertas preventivos
5. Sugestões de redistribuição

Seja específico e prático nas recomendações.`;

        try {
            const predictions = await this.callGemini(prompt);
            
            const html = `
                <div class="predictions-results">
                    <h4>🔮 Previsões e Recomendações</h4>
                    
                    <div class="prediction-content">
                        ${predictions.replace(/\n/g, '<br>')}
                    </div>
                </div>
            `;

            document.getElementById('aiResults').innerHTML = html;
        } catch (error) {
            document.getElementById('aiResults').innerHTML = `<div class="error">Erro ao gerar previsões: ${error.message}</div>`;
        }
    }

    showChat() {
        document.getElementById('aiChat').style.display = 'block';
        document.getElementById('aiResults').innerHTML = '';
        this.addChatMessage('Olá! Sou o assistente Gemini AI. Posso ajudar com análises dos equipamentos, relatórios e responder suas perguntas. O que você gostaria de saber?', false);
    }

    async sendMessage() {
        const input = document.getElementById('aiInput');
        const message = input.value.trim();
        
        if (!message) return;

        this.addChatMessage(message, true);
        input.value = '';

        this.addChatMessage('🤖 Pensando...', false, 'typing');

        try {
            const response = await this.generateChatResponse(message);
            const messages = document.getElementById('aiMessages');
            const typingMsg = messages.querySelector('.typing');
            if (typingMsg) typingMsg.remove();
            
            this.addChatMessage(response, false);
        } catch (error) {
            const messages = document.getElementById('aiMessages');
            const typingMsg = messages.querySelector('.typing');
            if (typingMsg) typingMsg.remove();
            
            this.addChatMessage('Desculpe, ocorreu um erro. Tente novamente.', false);
        }
    }

    addChatMessage(message, isUser, className = '') {
        const messagesDiv = document.getElementById('aiMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isUser ? 'user' : 'ai'} ${className}`;
        messageDiv.innerHTML = message.replace(/\n/g, '<br>');
        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    async generateChatResponse(message) {
        const equipments = window.equipmentManager?.equipments || [];
        
        const prompt = `Você é um assistente especializado em gestão de equipamentos de TI. 
        
Dados atuais dos equipamentos:
${JSON.stringify(equipments.slice(0, 5), null, 2)}

Pergunta do usuário: "${message}"

Responda de forma clara, objetiva e útil. Se a pergunta for sobre os equipamentos, use os dados fornecidos. Se for uma pergunta geral sobre gestão de TI, forneça orientações práticas.

Mantenha a resposta concisa (máximo 3 parágrafos).`;

        return await this.callGemini(prompt);
    }
}

// Inicializar assistente IA
document.addEventListener('DOMContentLoaded', () => {
    window.aiAssistant = new AIAssistant();
});