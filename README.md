# CRUD com Node.js + MongoDB — Docker & Docker Compose

API REST completa com interface web para gerenciamento de usuários, containerizada com Docker. O projeto serve de base para entender a diferença entre **dockerizar apenas a aplicação**, **dockerizar apenas o banco**, e **orquestrar tudo com Docker Compose**.

---

## 🗂️ Estrutura do Projeto

```
crud-mongodb/
├── public/
│   ├── index.html       # Interface web do CRUD
│   ├── index.css        # Estilos
│   └── index.js        # Lógica do frontend (fetch API)
├── app.js               # Servidor Express + Mongoose
├── Dockerfile           # Imagem da API Node.js
├── docker-compose.yml   # Orquestração API + MongoDB
├── package.json
└── .gitignore
```

---

## 🛠️ Tecnologias

- **Node.js 18** com Express 5
- **MongoDB** (via Mongoose 9)
- **Docker** e **Docker Compose**
- Frontend em HTML/CSS/JS puro (servido como estático pelo Express)

---

## 📦 Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e rodando
- (Opcional) Node.js 20+ para rodar localmente sem Docker

---

## 🚀 Formas de Rodar o Projeto

O projeto pode ser executado de **três formas diferentes**, cada uma com um nível diferente de containerização.

---

### Forma 1 — Tudo local (sem Docker)

Útil para desenvolvimento rápido. Requer MongoDB instalado localmente.

**1. Instalar dependências:**
```bash
npm install
```

**2. Em `app.js`, garantir a connection string local:**
```js
mongoose.connect("mongodb://localhost:27017/cruddb")
```

**3. Iniciar o servidor:**
```bash
node app.js
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

### Forma 2 — Apenas o MongoDB no Docker (API local)

Sobe só o banco em container, a API roda direto na máquina. Útil para não precisar instalar MongoDB localmente.

**1. Subir o MongoDB:**
```bash
docker run -d --name mongodb -p 27017:27017 mongo
```

**2. Em `app.js`, usar a connection string `localhost`:**
```js
mongoose.connect("mongodb://localhost:27017/cruddb")
```

**3. Rodar a API normalmente:**
```bash
node app.js
```

**Parar e remover o container do MongoDB:**
```bash
docker stop mongodb
docker rm mongodb
```

---

### Forma 3 — Apenas a API no Docker (MongoDB local)

Containeriza somente a aplicação Node.js.

**1. Build da imagem:**
```bash
docker build -t crud-api .
```

**2. Rodar o container:**
```bash
docker run -d -p 3000:3000 --name node-api crud-api
```

> ⚠️ A API tentará conectar em `mongodb://mongo:27017/cruddb`, o que **não vai funcionar** sem Docker Compose, pois o hostname `mongo` não resolve. Para esta forma, ajuste a connection string em `app.js` para `localhost` e use `--network host` no Linux, ou `host.docker.internal` no Mac/Windows:
> ```bash
> docker run -d -p 3000:3000 -e MONGO_URL=mongodb://host.docker.internal:27017/cruddb --name node-api crud-api
> ```

---

### Forma 4 — Docker Compose (recomendada ✅)

Orquestra a API e o MongoDB juntos, com rede interna automática entre os containers.

**1. Em `app.js`, garantir a connection string para o Compose:**
```js
mongoose.connect("mongodb://mongo:27017/cruddb")
```

> O hostname `mongo` corresponde ao nome do serviço definido no `docker-compose.yml`.

**2. Subir tudo:**
```bash
docker compose up --build
```

> Use `--build` para forçar o rebuild da imagem da API ao fazer alterações no código.

**Subir em background (detached):**
```bash
docker compose up --build -d
```

**Ver os logs:**
```bash
docker compose logs -f
```

**Parar os containers sem remover:**
```bash
docker compose stop
```

**Parar e remover containers e rede:**
```bash
docker compose down
```

**Parar, remover containers e apagar os volumes (dados do banco):**
```bash
docker compose down -v
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 🌐 Endpoints da API

| Método | Rota          | Descrição                     |
|--------|---------------|-------------------------------|
| GET    | `/users`      | Lista todos os usuários       |
| POST   | `/users`      | Cria um novo usuário          |
| PUT    | `/users/:id`  | Atualiza um usuário pelo ID   |
| DELETE | `/users/:id`  | Remove um usuário pelo ID     |

**Exemplo de body para POST/PUT:**
```json
{
  "name": "Lucas",
  "age": 21
}
```

---

## ⚖️ Docker vs Docker Compose — Diferenças

| Aspecto | `docker run` (Docker puro) | `docker compose` |
|---|---|---|
| **Uso** | Sobe **um container** por vez | Sobe **múltiplos containers** de uma vez |
| **Rede** | Precisa configurar manualmente com `--network` | Cria uma rede interna automática entre os serviços |
| **Comunicação entre containers** | Complexo (flags extras, IPs manuais) | Simples: usa o **nome do serviço** como hostname |
| **Configuração** | Flags longas na linha de comando | Declarativa via `docker-compose.yml` |
| **Reprodutibilidade** | Depende de quem executa lembrar todos os flags | Basta rodar `docker compose up` |
| **Ideal para** | Containers isolados e scripts simples | Aplicações com múltiplos serviços (API + DB, etc.) |

### Por que `mongo` funciona como hostname no Compose?

Quando o Compose sobe os serviços, ele cria automaticamente uma **rede virtual** (bridge network) e registra cada serviço pelo nome definido no `docker-compose.yml`. Por isso, a API consegue alcançar o banco usando `mongodb://mongo:27017` — o Docker resolve `mongo` para o IP interno do container do MongoDB, sem nenhuma configuração adicional.

---

## 📄 Dockerfile explicado

```dockerfile
FROM node:18            # Imagem base com Node.js 18
WORKDIR /app            # Define o diretório de trabalho dentro do container
COPY package*.json ./   # Copia os manifests antes do código (cache de layers)
RUN npm install         # Instala as dependências
COPY . .                # Copia o restante do código
EXPOSE 3000             # Documenta que a app usa a porta 3000
CMD ["node","app.js"]   # Comando padrão ao iniciar o container
```

> O padrão de copiar `package*.json` antes do `COPY . .` é uma **otimização de cache**: se o código mudar mas as dependências não, o Docker reutiliza a layer do `npm install`, tornando os builds mais rápidos.

---

## 📄 docker-compose.yml explicado

```yaml
version: "3"

services:
  mongo:                        # Serviço do banco de dados
    image: mongo                # Usa a imagem oficial do MongoDB
    container_name: mongodb     # Nome amigável do container
    ports:
      - "27017:27017"           # Expõe o MongoDB para a máquina host (opcional)

  api:                          # Serviço da aplicação Node.js
    build: .                    # Builda a imagem usando o Dockerfile local
    container_name: node-api
    ports:
      - "3000:3000"             # Mapeia porta do container para o host
    depends_on:
      - mongo                   # Garante que o mongo sobe antes da api
```

> `depends_on` garante a **ordem de inicialização**, mas não espera o MongoDB estar pronto para aceitar conexões. Em produção, usar healthchecks ou lógica de retry na aplicação.

---

## 🔧 Comandos úteis de diagnóstico

```bash
# Listar containers rodando
docker ps

# Listar todos os containers (incluindo parados)
docker ps -a

# Ver logs de um container específico
docker logs node-api
docker logs mongodb

# Entrar no shell de um container
docker exec -it node-api sh
docker exec -it mongodb mongosh

# Listar imagens locais
docker images

# Remover uma imagem
docker rmi crud-api

# Remover todos os containers parados
docker container prune
```