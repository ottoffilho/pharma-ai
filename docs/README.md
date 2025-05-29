# Pharma.AI - Sistema de Gestão para Farmácias de Manipulação

## 🏥 Visão Geral

O **Pharma.AI** é um sistema completo para gestão de farmácias de manipulação, desenvolvido com arquitetura híbrida (monólito modular + microsserviços de IA). O projeto combina tecnologias modernas com inteligência artificial para otimizar processos farmacêuticos.

## 🚀 Status do Projeto

- **Fase Atual:** MVP (Fase 1) - 70% concluída
- **Status:** Em desenvolvimento ativo
- **Última atualização:** 2024-12-26

## 🛠️ Tecnologias

### Frontend
- **React 18.3.1** com TypeScript
- **Vite** como bundler
- **Tailwind CSS** + **shadcn/ui** para interface
- **React Router DOM** para roteamento
- **React Query** para gerenciamento de estado
- **React Hook Form** + **Zod** para formulários
- **Recharts** para gráficos

### Backend
- **Supabase** como BaaS (Backend as a Service)
- **PostgreSQL** com extensões (pgvector para IA)
- **Row Level Security (RLS)** implementado
- **Edge Functions** para lógica serverless
- **Supabase Auth** para autenticação

## 📋 Módulos Implementados

### ✅ Completos
- **M09 - Usuários e Permissões** (100%) - Sistema robusto de autenticação e autorização

### 🟢 Funcionais
- **M05 - Manipulação Básica** (85%) - Sistema de ordens de produção
- **M02 - Estoque** (75%) - Gestão de insumos e embalagens

### 🟡 Parciais
- **M06 - Financeiro** (60%) - Categorias e contas a pagar
- **M01 - Cadastros Essenciais** (50%) - Fornecedores implementados
- **M03 - Atendimento** (30%) - Estrutura básica de pedidos

### 🔴 Pendentes
- **M08 - Inteligência Artificial** (5%) - Estrutura criada
- **M04 - PDV e Vendas** (0%) - Não iniciado
- **M07 - Fiscal** (0%) - Não iniciado
- **M10 - Relatórios** (0%) - Não iniciado

## 🔧 Configuração do Ambiente

### Pré-requisitos
- Node.js 18+
- npm ou bun
- Conta no Supabase

### Variáveis de Ambiente
Crie um arquivo `.env` baseado no `.env.example`:

```env
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
VITE_SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
```

### Instalação e Execução

```bash
# Clone o repositório
git clone <URL_DO_REPOSITORIO>

# Navegue para o diretório
cd pharma-ai

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

### Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run build:dev    # Build para desenvolvimento
npm run lint         # Verificação de código
npm run preview      # Preview do build
```

## 🏗️ Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (shadcn/ui)
│   ├── layouts/        # Layouts da aplicação
│   ├── Auth/           # Componentes de autenticação
│   └── [modulos]/      # Componentes específicos por módulo
├── modules/            # Módulos do sistema
│   └── usuarios-permissoes/  # Módulo completo implementado
├── pages/              # Páginas da aplicação
│   ├── admin/          # Área administrativa
│   └── [outras]/       # Páginas públicas
├── services/           # Serviços de integração
├── hooks/              # Custom hooks
├── contexts/           # Contextos React
├── types/              # Definições de tipos TypeScript
├── utils/              # Funções utilitárias
└── lib/                # Configurações de bibliotecas
```

## 🔐 Sistema de Autenticação

### Perfis de Usuário
- **Proprietário:** Acesso total ao sistema
- **Farmacêutico:** Foco em produção e controle de qualidade
- **Atendente:** Foco em atendimento ao cliente
- **Manipulador:** Foco em ordens de produção

### Fluxo de Autenticação
1. Login via Supabase Auth
2. Verificação de perfil na tabela `usuarios`
3. Carregamento de permissões
4. Redirecionamento para dashboard específico
5. Proteção de rotas por permissões

## 🗄️ Banco de Dados

### Principais Tabelas
- `usuarios` - Dados dos usuários
- `auth.users` - Autenticação Supabase
- `ordens_producao` - Sistema de produção
- `insumos` e `lotes_insumos` - Gestão de estoque
- `embalagens` - Embalagens
- `fornecedores` - Fornecedores
- `categorias_financeiras` - Categorias financeiras

### Segurança
- **Row Level Security (RLS)** habilitado em todas as tabelas
- Políticas baseadas em `auth.uid()`
- Controle granular por usuário/perfil

## 🎯 Próximos Passos

### Prioridade Alta (1-2 semanas)
1. Unificar dashboards administrativos
2. Finalizar interfaces de produção
3. Melhorar experiência do usuário

### Prioridade Média (1-2 meses)
1. Completar sistema de atendimento
2. Implementar primeiras funcionalidades de IA
3. Adicionar testes automatizados

### Prioridade Baixa (3+ meses)
1. Sistema de PDV
2. Módulo fiscal
3. Relatórios avançados

## 🤝 Contribuição

### Padrões de Código
- TypeScript obrigatório
- Componentes funcionais com hooks
- Props tipadas
- ESLint configurado

### Estrutura de Commits
- `feat:` - Novas funcionalidades
- `fix:` - Correções de bugs
- `docs:` - Documentação
- `refactor:` - Refatorações
- `test:` - Testes

## 📚 Documentação

Para documentação detalhada, consulte:
- `.cursor/contexto-pharma-ai.md` - Contexto geral do projeto
- `.cursor/estado-implementacao.md` - Estado atual da implementação
- `.cursor/rules.md` - Regras específicas de desenvolvimento
- `.cursor/regras-projeto.md` - Regras gerais do projeto

## 🛠️ Solução de Problemas

### Tabelas Deletadas no Banco de Dados

Se você encontrar erros relacionados a tabelas não existentes no banco de dados, siga estas etapas para restaurar:

#### Sintomas do Problema
- Erros de consulta como "relation does not exist" no console
- Telas de carregamento infinito ao recarregar a aplicação
- Impossibilidade de fazer login ou navegar pela aplicação

#### Solução 1: Usando o Script de Restauração
1. Verifique se você tem a variável `VITE_SUPABASE_SERVICE_ROLE_KEY` configurada no seu `.env`
2. Execute o script de restauração:
   ```bash
   node ./src/scripts/restore-db.js
   ```
3. Se tiver sucesso, reinicie a aplicação

#### Solução 2: Execução Manual no Console SQL
1. Acesse o painel do Supabase para seu projeto
2. Vá para a seção "SQL Editor"
3. Copie e cole o conteúdo do arquivo `src/scripts/recriacao-tabelas.sql`
4. Execute o script SQL
5. Reinicie a aplicação

#### Solução de Emergência: Logout
Se você estiver preso em um loop de carregamento:
1. Use o botão "Logout de Emergência" no canto inferior direito da tela
2. Se não for visível, acesse diretamente `/login` na URL
3. Limpe os dados de armazenamento do navegador (localStorage e sessionStorage)

### Deslogamentos Frequentes

#### Sintomas do Problema
- Perda de sessão ao navegar entre páginas
- Redirecionamentos inesperados para tela de login

#### Solução
1. Verifique se as tabelas `usuarios` e `perfis_usuario` existem
2. Certifique-se que seu usuário existe na tabela `usuarios`
3. Verifique se há uma política RLS adequada para a tabela `usuarios`
4. Aumente o TTL do cache de autenticação em `src/modules/usuarios-permissoes/hooks/useAuthSimple.ts`

## 🔗 Links Úteis

- **Supabase Dashboard:** [Link do projeto Supabase]
- **Figma Design:** [Link do design se disponível]
- **Documentação da API:** [Link da documentação se disponível]

## 📄 Licença

Este projeto é proprietário e confidencial.

## 📞 Contato

Para dúvidas ou suporte, entre em contato com a equipe de desenvolvimento.

---

*Última atualização: 2024-12-26*
