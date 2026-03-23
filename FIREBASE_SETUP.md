# Configuração do Firebase

## Passo 1: Criar projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Digite o nome do projeto (ex: "regtech-equipamentos")
4. Desabilite Google Analytics (opcional)
5. Clique em "Criar projeto"

## Passo 2: Configurar Firestore Database

1. No painel do Firebase, clique em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha "Iniciar no modo de teste" (por enquanto)
4. Selecione uma localização (ex: southamerica-east1)
5. Clique em "Concluído"

## Passo 3: Configurar Authentication (Opcional)

1. Clique em "Authentication"
2. Vá na aba "Sign-in method"
3. Habilite "Email/senha"

## Passo 4: Obter credenciais

1. Clique no ícone de engrenagem > "Configurações do projeto"
2. Role até "Seus aplicativos"
3. Clique no ícone "</>" (Web)
4. Digite um nome para o app (ex: "regtech-web")
5. Clique em "Registrar app"
6. Copie as credenciais mostradas

## Passo 5: Configurar no código

Abra o arquivo `firebase-config.js` e substitua as credenciais:

```javascript
const firebaseConfig = {
    apiKey: "sua-api-key-aqui",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto-id",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "123456789",
    appId: "sua-app-id"
};
```

## Passo 6: Configurar regras do Firestore

No Firebase Console, vá em "Firestore Database" > "Regras" e use:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura e escrita para todos (temporário)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**IMPORTANTE:** Essas regras são para desenvolvimento. Em produção, configure regras mais restritivas.

## Passo 7: Testar

1. Abra o sistema no navegador
2. Faça login
3. Cadastre um equipamento
4. Verifique se aparece no Firestore Console

## Estrutura dos dados no Firestore

Coleção: `equipamentos`
Documentos com campos:
- `tipo`: string
- `patrimonio`: string
- `usuario`: string
- `localizacao`: string
- `status`: string
- `dataCadastro`: string
- `createdAt`: timestamp

## Funcionalidades implementadas

✅ Cadastro de equipamentos no Firebase
✅ Listagem em tempo real
✅ Exclusão de equipamentos
✅ Fallback para localStorage se Firebase falhar
✅ Ordenação por data de criação

## Próximos passos (opcional)

- Implementar autenticação real do Firebase
- Adicionar edição de equipamentos
- Configurar regras de segurança
- Adicionar validação de dados
- Implementar sincronização offline