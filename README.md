# Audio Transcription System

Sistema para **upload, processamento e transcrição de áudios**, composto por um **frontend web** e um **backend em FastAPI** responsável pelo recebimento e processamento inicial dos arquivos.

O projeto foi concebido para permitir a evolução futura para um pipeline completo de transcrição de áudio utilizando modelos de **Speech-to-Text**.

---

# Arquitetura do Projeto

```
audio-transcription-system
│
├── backend/        # API responsável por receber e armazenar os áudios
├── frontend/       # Interface web para envio e visualização de transcrições
├── docs/           # Documentação adicional do projeto
└── README.md
```

---

# Objetivos do Projeto

* Receber arquivos de áudio via interface web
* Armazenar os arquivos enviados
* Processar os áudios para transcrição
* Disponibilizar as transcrições para consulta

---

# Tecnologias Utilizadas

## Backend

* Python
* FastAPI
* Uvicorn

## Frontend

*(definir conforme evolução do projeto)*

Possíveis tecnologias:

* React
* TailwindCSS

---

# Fluxo básico do sistema

```
Frontend
   ↓
Upload de áudio
   ↓
Backend (FastAPI)
   ↓
Armazenamento do arquivo
   ↓
Processamento / Transcrição (futuro)
   ↓
Retorno do texto transcrito
```

---

# Status do Projeto

Fase inicial de desenvolvimento.

Funcionalidades atuais:

* Upload de arquivos de áudio
* Armazenamento local dos arquivos

Funcionalidades planejadas:

* Transcrição automática
* Histórico de áudios enviados
* Download das transcrições
* Processamento assíncrono de tarefas

---

# Backend

A documentação completa da API pode ser encontrada em:

```
backend/README.md
```

---

# Execução (visão geral)

### 1 - Clonar o repositório

```
git clone <repo>
cd audio-transcription-system
```

### 2 - Executar o backend

```
cd backend
uvicorn main:app --reload
```

### 3 - Acessar a documentação da API

```
http://localhost:8000/docs
```

---

# Acesso pelo celular (rede local)

O microfone só funciona em **contexto seguro** (HTTPS ou localhost). Para acessar o sistema de outro dispositivo na mesma rede Wi-Fi (ex: celular), siga os passos abaixo:

> **Nota:** a URL do backend é derivada automaticamente pelo frontend a partir do endereço do navegador — não é necessário configurar nenhuma variável de ambiente para isso.

### 1 - Descobrir o IP da máquina

```bash
# Linux / macOS
ip route get 1 | awk '{print $7; exit}'
# ou
hostname -I | awk '{print $1}'

# Windows
ipconfig
```

### 2 - Gerar um certificado autoassinado para o backend

```bash
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes \
  -subj "/CN=localhost" \
  -addext "subjectAltName=IP:127.0.0.1,IP:192.168.1.100"
```

> Substitua `192.168.1.100` pelo IP real da sua máquina. Os arquivos `key.pem` e `cert.pem` são usados apenas em desenvolvimento — **não os comite no repositório**.

### 3 - Iniciar o backend com HTTPS e acessível na rede

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 \
  --ssl-keyfile ../key.pem --ssl-certfile ../cert.pem
```

### 4 - Iniciar o frontend com HTTPS e exposição na rede

```bash
cd frontend
npm run dev
```

O servidor Vite exibirá URLs semelhantes a:

```
  HTTPS:  https://localhost:5173/
  HTTPS:  https://192.168.1.100:5173/
```

### 5 - Aceitar os certificados autoassinados

Antes de usar o app no celular, abra cada URL no **navegador do celular** e aceite o aviso de segurança ("Avançado" → "Prosseguir assim mesmo"):

1. `https://192.168.1.100:8000` — backend
2. `https://192.168.1.100:5173` — frontend

> O aviso aparece porque o certificado é autoassinado. Isso é normal em desenvolvimento local.

### 6 - Usar o app no celular

Após aceitar ambos os certificados, acesse: `https://192.168.1.100:5173`

O frontend detecta automaticamente o IP e envia as requisições para `https://192.168.1.100:8000`.

---

# Licença

Definir conforme política do projeto.
