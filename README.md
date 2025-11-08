# Payments Vue App

Aplicação Vue.js para gerenciar pagamentos que consome a API do sistema payments-api.

## Tecnologias Utilizadas

- **Vue.js 3** - Framework JavaScript progressivo
- **Vue Router 4** - Roteamento para Single Page Applications
- **Axios** - Cliente HTTP para requisições à API
- **Moment.js** - Manipulação e formatação de datas
- **Vite** - Build tool e servidor de desenvolvimento
- **CSS3** - Estilização customizada

## Pré-requisitos

- Node.js 16+ instalado
- npm ou yarn
- API payments-api rodando (por padrão na porta 5000)

## Instalação

1. **Clone ou baixe o projeto**
   ```bash
   cd payments-vue-app
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure a URL da API**
   
   Edite o arquivo `src/services/api.js` e ajuste a URL da API se necessário:
   ```javascript
   const API_BASE_URL = 'http://localhost:5000/api/v1'
   ```

## Como executar

### Modo desenvolvimento
```bash
npm run dev
```
A aplicação estará disponível em `http://localhost:3000`

### Build para produção
```bash
npm run build
```

### Preview da build de produção
```bash
npm run preview
```

## Personalização

### Alterando a URL da API
Edite `src/services/api.js`:
```javascript
const API_BASE_URL = 'https://sua-api.com/api/v1'
```

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT.