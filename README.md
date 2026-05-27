# ⚡ ZeroVinTTech

> **Plataforma de Economia Circular e Descarte Sustentável para Alunos da Unisales**

A **ZeroVinTTech** é uma plataforma criada para promover a economia circular escolar, conectar alunos para doação de dispositivos e peças eletrônicas, e incentivar o descarte responsável de e-waste (lixo eletrônico) dentro do campus da Unisales.

Com um design moderno de alto contraste, alta usabilidade e integração de dados em tempo real, mitigamos a geração de lixo eletrônico, incentivamos o aprendizado de hardware através da reutilização e promovemos ações de impacto social e ambiental na comunidade acadêmica.

---

## 🎨 O Projeto: Visão Geral

O projeto resolve dois problemas principais utilizando tecnologia e engajamento comunitário:
1. **Descarte Incorreto de Hardware:** Componentes de computadores, celulares e periféricos que ainda poderiam ser úteis muitas vezes são jogados no lixo comum ou permanecem esquecidos.
2. **Acesso Facilitado para Estudantes:** Alunos de tecnologia e engenharia frequentemente necessitam de peças de hardware para projetos, laboratórios e estudos acadêmicos.

---

## ✨ Principais Funcionalidades

### 🌟 1. Mural de Doações
* **Catálogo Ativo:** Filtro inteligente de doações por categoria (*periféricos, componentes eletrônicos, notebooks, celulares, videogames, computadores, equipamentos de rede e outros*).
* **Filtro de Estado de Conservação:** Identifique rapidamente se o item é *Novo*, *Usado - Bom* ou *Para Conserto* (ideal para quem quer praticar eletrônica/reparação).
* **Multi-Foto:** Visualização detalhada das fotos reais dos componentes.

### 💬 2. Chat em Tempo Real
* **Negociação Direta:** Sistema de chat integrado ao Firestore, permitindo que o doador e o solicitante conversem sem precisar expor redes sociais ou números de telefone pessoais.
* **Segurança na Entrega:** Combine a entrega de forma segura diretamente nas dependências ou laboratórios da Unisales.

### 📝 3. Fluxo de Solicitação Justificado
* **Pedido Formal:** O interessado em um item de doação envia uma proposta explicando o motivo (ex: *"preciso para o projeto integrador de IoT"*).
* **Gestão do Doador:** No painel de perfil, o doador pode avaliar as justificativas, aceitar a mais relevante e recusar as demais.
* **Transição de Status automático:** Quando aceito, o item muda seu status para "solicitado" ou "doado", organizando o mural de forma automatizada.

### 📊 4. Métricas de Impacto & Eventos de Descarte
* **Coletas Ecológicas:** Divulgação de datas das campanhas de arrecadação de lixo eletrônico no campus da Unisales.
* **Impactômetro:** Painel dinâmico que exibe o total de quilogramas (Kg) de lixo eletrônico coletados e reciclados de forma correta ao longo do tempo.

### 👤 5. Perfis Estudantis Autênticos
* **Verificação por RA (Registro Acadêmico):** Cadastro estruturado exigindo o RA do aluno para garantir que apenas membros da comunidade universitária transacionem no local.
* **Painel do Usuário:** Gerencie suas doações ativas, visualize o status das suas solicitações de hardware e gerencie suas mensagens recebidas.

---

## 🛠️ Stack Tecnológica

* **Frontend:**
  * **[React 19](https://react.dev/)** com controle de estado reativo e hooks funcionais.
  * **[Vite](https://vite.dev/)** como build tool ultra-rápida.
  * **[TypeScript](https://www.typescriptlang.org/)** para tipagem forte e segurança do código.
  * **[Tailwind CSS v4](https://tailwindcss.com/)** para estilo e responsividade impecáveis.
  * **[Motion (Framer Motion)](https://motion.dev/)** para micro-animações, transições suaves de rotas e feedbacks visuais.
  * **[Lucide React](https://lucide.dev/)** para biblioteca moderna de vetores e ícones.

* **Backend & Infraestrutura:**
  * **[Firebase Auth](https://firebase.google.com/docs/auth):** Fluxo seguro de autenticação (Cadastro, Login, Recuperação de Senha).
  * **[Firestore Database](https://firebase.google.com/docs/firestore):** Banco de dados NoSQL No Real-time para chats, doações, solicitações e dados acadêmicos.
  * **[Firestore Security Rules](https://firebase.google.com/docs/firestore/security/rules):** Camada server-side rigorosa de proteção e validação de dados que impede acesso malicioso e escrita de dados corrompidos.

---

## 🔒 Segurança e Regras do Firestore

O projeto foi construído sob um rigoroso princípio de **Privacidade por Padrão (Privacy-by-Design)**. Suas regras de segurança do Firestore (`firestore.rules`) garantem:

1. **Proteção de Informações Pessoais (PII):** Os dados sensíveis dos perfis de usuários (como e-mail e RA) são acessíveis **única e exclusivamente** pelo próprio estudante autenticado ou por um administrador da plataforma.
2. **Esquema de Validação Server-Side:** Nenhuma escrita corrompida ou inválida é aceita pelo banco. Funções de integridade protegem campos essenciais:
   * **Usuários:** Validação sintática do e-mail acadêmico, tamanho do nome e cumprimento do formato do RA.
   * **Doações:** Validação de enumerações rígidas para categorias e estado físico, e limites estritos para tamanho de títulos e textos.
   * **Mensagens:** Limitação de tamanho de mensagens de chat (até 1000 caracteres) para evitar abusos corporativos de rede.
3. **Restrição por Contexto Estudantil:** Apenas usuários devidamente cadastrados e autenticados podem ler doações ou interagir com o chat.

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
* Ter o **[Node.js](https://nodejs.org/)** instalado (versão 18+ recomendada).

### Passo a Passo

1. **Clonar o Repositório:**
   ```bash
   git clone https://github.com/seu-usuario/zerovinttech.git
   cd zerovinttech
   ```

2. **Instalar as Dependências:**
   ```bash
   npm install
   ```

3. **Configurar o Firebase:**
   Crie ou use o arquivo `firebase-applet-config.json` na raiz da pasta com o seguinte formato, preenchendo as chaves do seu projeto no console do Firebase:
   ```json
   {
     "projectId": "seu-projeto-id",
     "appId": "seu-app-id",
     "apiKey": "sua-api-key",
     "authDomain": "seu-auth-domain",
     "firestoreDatabaseId": "seu-database-id",
     "storageBucket": "seu-storage-bucket",
     "messagingSenderId": "seu-sender-id",
     "measurementId": ""
   }
   ```

4. **Publicar as Regras de Segurança (Opcional - via Firebase CLI):**
   ```bash
   firebase deploy --only firestore:rules
   ```

5. **Iniciar o Servidor Local de Desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse a URL gerada no terminal (geralmente `http://localhost:3000`).

6. **Gerar Versão de Produção:**
   ```bash
   npm run build
   ```
   Os arquivos finais otimizados serão gerados na pasta `/dist`.

---

## 📄 Licença

Este projeto é desenvolvido para fins acadêmicos e educacionais em parceria com alunos da **Unisales**. Sinta-se livre para adaptar e melhorar a iniciativa para incentivar campanhas de economia circular de TI na sua universidade.

---
*ZeroVinTTech — Transformando descarte tecnológico em aprendizado e solidariedade.* 🌿💻
