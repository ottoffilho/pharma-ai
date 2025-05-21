# Contexto do Projeto Homeo-AI

## 1. Visão Geral do Projeto

Homeo-AI é uma aplicação web abrangente projetada para Farmácias de Manipulação, oferecendo uma plataforma rica em funcionalidades para gerenciamento de prescrições, inventário, pedidos, transações financeiras e gerenciamento de usuários. O nome "Homeo-AI" sugere um foco na aplicação de inteligência artificial para processamento de prescrições homeopáticas.

A aplicação é dividida em um frontend moderno e interativo e um backend robusto baseado em Supabase para gerenciamento de dados e autenticação.

## 2. Funcionalidades Principais

A aplicação oferece uma vasta gama de funcionalidades, incluindo:

*   **Gerenciamento de Usuário e Autenticação:**
    *   Autenticação completa (login, logout).
    *   Proteção de rotas com verificação de autenticação.
    *   Diferentes níveis de acesso para usuários internos.

*   **Gestão de Prescrições:**
    *   Upload e processamento de prescrições médicas.
    *   Análise de prescrições potencialmente com assistência de IA.
    *   Validação e acompanhamento do status das prescrições.
    *   Detalhamento de medicamentos prescritos.

*   **Gestão de Estoque:**
    *   Cadastro e gerenciamento de insumos (matérias-primas).
    *   Controle de estoque com alertas de estoque mínimo.
    *   Gestão de custos unitários e informações de fornecedores.
    *   Controle de lotes de insumos com rastreamento de validade.
    *   Gerenciamento de embalagens e seu estoque.

*   **Gestão de Pedidos:**
    *   Criação de pedidos a partir de prescrições processadas.
    *   Acompanhamento do status de pedidos.
    *   Previsão de data de entrega.
    *   Gestão de pagamentos e valores.

*   **Controle Financeiro:**
    *   Categorização de transações financeiras.
    *   Registro de fluxo de caixa (receitas e despesas).
    *   Vinculação de transações com pedidos.
    *   Relatórios financeiros básicos.

*   **Gestão de Usuários Internos:**
    *   Administração de usuários da plataforma.
    *   Atribuição de cargos e perfis de acesso.
    *   Associação de ações com usuários específicos.

## 3. Arquitetura Técnica

O Homeo-AI utiliza uma arquitetura moderna com um frontend React e Supabase como Backend-as-a-Service (BaaS).

### 3.1. Frontend

*   **Framework/Biblioteca:** React.js com TypeScript.
*   **Build Tool:** Vite.
*   **Estilização:** Tailwind CSS com componentes shadcn/ui (construídos sobre Radix UI).
*   **Roteamento:** React Router DOM.
*   **Gerenciamento de Estado (Dados do Servidor):** TanStack Query (React Query).
*   **Formulários:** React Hook Form com validação Zod.
*   **Comunicação com Backend:**
    *   Interage diretamente com Supabase via `supabase-js` para autenticação, banco de dados e armazenamento.
*   **Outras Bibliotecas:** Lucide Icons, Sonner (toasts), date-fns, recharts, etc.
*   **Componentes UI Reutilizáveis:**
    *   Estão organizados em `src/components/` incluindo componentes de UI base e layouts específicos.
    *   AdminLayout: Template para todas as páginas administrativas.
    *   Diversos componentes específicos para cada área funcional (pedidos, estoque, etc.).
*   **Hooks Customizados:**
    *   Utilizados para lógica de negócios reutilizável e interações com Supabase.

### 3.2. Backend (Supabase)

*   **Banco de Dados:** PostgreSQL hospedado no Supabase.
*   **Autenticação:** Supabase Auth para gerenciamento de usuários e sessões.
*   **Storage:** Armazenamento de arquivos (potencialmente para imagens de prescrições).
*   **Tabelas Principais:**
    *   `insumos`: Matérias-primas do inventário.
    *   `embalagens`: Materiais de embalagem.
    *   `lotes_insumos`: Lotes do inventário.
    *   `fornecedores`: Fornecedores de insumos e embalagens.
    *   `receitas_raw`: Prescrições brutas.
    *   `receitas_processadas`: Prescrições analisadas e processadas.
    *   `pedidos`: Pedidos gerados a partir de prescrições.
    *   `categorias_financeiras`: Categorias para transações financeiras.
    *   `movimentacoes_caixa`: Transações financeiras (entrada/saída).
    *   `usuarios_internos`: Usuários da plataforma.

## 4. Estrutura de Pastas Relevantes

*   **`/` (Raiz):**
    *   `package.json`: Dependências e scripts do frontend.
    *   `vite.config.ts`: Configuração do Vite.
    *   `tailwind.config.ts`: Configuração do Tailwind CSS.
    *   `tsconfig.json`: Configuração do TypeScript.
    *   `index.html`: Ponto de entrada do HTML.
    *   `README.md`: Informações gerais do projeto.
*   **`src/`:** Código fonte do frontend React.
    *   `main.tsx`: Ponto de entrada da aplicação React.
    *   `App.tsx`: Componente principal, configuração de rotas e providers globais.
    *   `components/`: Componentes UI reutilizáveis.
        *   `ui/`: Componentes de UI base (shadcn).
        *   `layouts/`: Templates de layout como AdminLayout.
        *   `Auth/`: Componentes relacionados à autenticação.
    *   `pages/`: Componentes de página para cada funcionalidade.
        *   `admin/`: Páginas administrativas organizadas por funcionalidade.
            *   `pedidos/`: Gestão de pedidos e prescrições.
            *   `estoque/`: Gestão de insumos, embalagens e lotes.
            *   `financeiro/`: Gestão financeira.
            *   `usuarios/`: Gestão de usuários.
    *   `hooks/`: Hooks customizados para lógica de negócios.
    *   `integrations/`: Código para interagir com serviços externos.
        *   `supabase/`: Cliente e tipos do Supabase.
    *   `lib/`: Utilitários e funções auxiliares.
*   **`public/`:** Arquivos estáticos servidos diretamente.
*   **`supabase/`:** Configuração para a CLI do Supabase.
    *   `config.toml`: ID do projeto Supabase.

## 5. Como Executar o Projeto

1.  Clone o repositório.
2.  Instale as dependências: `npm install`.
3.  Inicie o servidor de desenvolvimento: `npm run dev`.
4.  Acesse a aplicação no endereço fornecido (geralmente `http://localhost:5173`).

**Nota:** Como o backend é totalmente baseado no Supabase, não é necessário executar um servidor de backend separadamente. No entanto, para desenvolvimento local, podem ser necessárias configurações adicionais (como variáveis de ambiente) para conectar ao projeto Supabase correto.

## 6. Pontos de Destaque e Complexidade

*   **Análise de Prescrições:** Potencial uso de IA para processar e entender receitas médicas (homeopáticas).
*   **Gerenciamento de Estoque Farmacêutico:** Controle detalhado de matérias-primas, lotes e validade.
*   **Controle Financeiro:** Sistema integrado para rastreamento de transações relacionadas a pedidos.
*   **Fluxo Completo:** Da prescrição ao pedido finalizado, passando por validação e produção.
*   **Dashboard Administrativo:** Visão consolidada de métricas chave do negócio.
*   **Potencial de Escalabilidade:** A estrutura permite expansão para módulos adicionais (como faturamento detalhado, análise de custos e tendências).

## 7. Próximos Passos (Planejados)

*   **Alertas de Estoque Avançados:** Notificações automáticas quando o estoque estiver abaixo do mínimo.
*   **Módulo Financeiro Expandido:** Relatórios financeiros detalhados e análise de rentabilidade.
*   **Cálculo de Custos por Pedido:** Análise detalhada de custos de produção.
*   **Gráficos e Análises de Tendências:** Visualizações de dados para pedidos e faturamento ao longo do tempo.

Este documento fornece um contexto inicial sobre o projeto Homeo-AI. A análise foi baseada no código disponível, estrutura de arquivos e funcionalidades implementadas. 