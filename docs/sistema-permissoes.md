# Sistema de Permissões Hierárquicas - Pharma.AI

## 📋 Visão Geral

O sistema de permissões do Pharma.AI implementa controle de acesso granular baseado em perfis de usuário, garantindo que cada funcionário tenha acesso apenas às funcionalidades necessárias para seu trabalho.

## 🔐 Perfis de Usuário

### 👑 **PROPRIETÁRIO**
- **Dashboard**: Administrativo
- **Acesso**: Completo a todos os módulos
- **Permissões**: Criar, editar, excluir, aprovar, exportar
- **Características**:
  - Gestão completa de usuários
  - Acesso a relatórios financeiros
  - Configurações do sistema
  - Auditoria de ações

### 👨‍💼 **FARMACÊUTICO**
- **Dashboard**: Operacional
- **Acesso**: Módulos operacionais e de produção
- **Permissões**: Manipulação, estoque, atendimento, relatórios operacionais
- **Restrições**: Sem acesso a financeiro detalhado
- **Características**:
  - Aprovação de fórmulas
  - Controle de qualidade
  - Supervisão de produção

### 👩‍💻 **ATENDENTE**
- **Dashboard**: Atendimento
- **Acesso**: Módulos de atendimento e PDV
- **Permissões**: Atendimento, consulta de estoque, PDV
- **Restrições**: Não pode alterar preços ou cadastros críticos
- **Características**:
  - Foco no atendimento ao cliente
  - Criação de pedidos e orçamentos
  - Consulta de informações

### 🧪 **MANIPULADOR**
- **Dashboard**: Produção
- **Acesso**: Módulos de produção
- **Permissões**: Ordens de produção, controle de qualidade
- **Restrições**: Sem acesso a custos e margem
- **Características**:
  - Atualização de status de produção
  - Controle de qualidade
  - Rastreabilidade de processos

## 🛠️ Como Usar

### 1. **Configuração Inicial**

```tsx
// App.tsx
import { AuthProvider } from './modules/usuarios-permissoes';

function App() {
  return (
    <AuthProvider>
      {/* Sua aplicação */}
    </AuthProvider>
  );
}
```

### 2. **Proteção de Componentes**

```tsx
import { ProtectedComponent, ModuloSistema, AcaoPermissao } from './modules/usuarios-permissoes';

// Proteger um componente específico
<ProtectedComponent
  modulo={ModuloSistema.FINANCEIRO}
  acao={AcaoPermissao.LER}
  fallback={<div>Sem permissão</div>}
>
  <ComponenteFinanceiro />
</ProtectedComponent>

// Usando HOC
const ComponenteProtegido = withPermission(
  ModuloSistema.USUARIOS_PERMISSOES,
  AcaoPermissao.CRIAR
)(MeuComponente);
```

### 3. **Verificação de Permissões em Hooks**

```tsx
import { useAuth, usePermissoes } from './modules/usuarios-permissoes';

function MeuComponente() {
  const { verificarPermissao } = useAuth();
  const { isProprietario, podeAcessarFinanceiro } = usePermissoes();

  const podeEditar = verificarPermissao(
    ModuloSistema.ESTOQUE,
    AcaoPermissao.EDITAR
  );

  return (
    <div>
      {isProprietario() && <BotaoAdmin />}
      {podeAcessarFinanceiro() && <RelatorioFinanceiro />}
      {podeEditar && <BotaoEditar />}
    </div>
  );
}
```

### 4. **Componentes de Proteção Específicos**

```tsx
import { ProprietarioOnly, FarmaceuticoOnly, PerfilBased } from './modules/usuarios-permissoes';

// Apenas para proprietários
<ProprietarioOnly fallback={<AcessoNegado />}>
  <ConfiguracoesAvancadas />
</ProprietarioOnly>

// Para farmacêuticos e proprietários
<FarmaceuticoOnly>
  <AprovacaoFormulas />
</FarmaceuticoOnly>

// Para perfis específicos
<PerfilBased perfis={['PROPRIETARIO', 'FARMACEUTICO']}>
  <RelatoriosOperacionais />
</PerfilBased>
```

### 5. **Dashboards Automáticos**

```tsx
import { DashboardRouter } from './modules/usuarios-permissoes';

// O router automaticamente direciona para o dashboard correto
function AdminArea() {
  return <DashboardRouter />;
}
```

## 🔧 Estrutura de Dados

### Tabelas no Supabase

```sql
-- Perfis de usuário
CREATE TABLE perfis_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR NOT NULL,
  tipo VARCHAR NOT NULL,
  dashboard VARCHAR NOT NULL,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Permissões disponíveis
CREATE TABLE permissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo VARCHAR NOT NULL,
  acao VARCHAR NOT NULL,
  nivel VARCHAR NOT NULL,
  descricao TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Relacionamento perfil-permissões
CREATE TABLE permissoes_perfil (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id UUID REFERENCES perfis_usuario(id),
  permissao_id UUID REFERENCES permissoes(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Usuários
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id),
  email VARCHAR UNIQUE NOT NULL,
  nome VARCHAR NOT NULL,
  telefone VARCHAR,
  perfil_id UUID REFERENCES perfis_usuario(id),
  ativo BOOLEAN DEFAULT true,
  ultimo_acesso TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Logs de auditoria
CREATE TABLE logs_auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id),
  acao VARCHAR NOT NULL,
  modulo VARCHAR NOT NULL,
  recurso VARCHAR NOT NULL,
  dados_anteriores JSONB,
  dados_novos JSONB,
  ip_address VARCHAR,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### RLS (Row Level Security)

```sql
-- Usuários só podem ver seus próprios dados (exceto proprietários)
CREATE POLICY "usuarios_policy" ON usuarios
FOR ALL TO authenticated
USING (
  auth.uid() = auth_id OR 
  EXISTS (
    SELECT 1 FROM usuarios u 
    JOIN perfis_usuario p ON u.perfil_id = p.id 
    WHERE u.auth_id = auth.uid() AND p.tipo = 'PROPRIETARIO'
  )
);

-- Logs de auditoria apenas para proprietários
CREATE POLICY "logs_auditoria_policy" ON logs_auditoria
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios u 
    JOIN perfis_usuario p ON u.perfil_id = p.id 
    WHERE u.auth_id = auth.uid() AND p.tipo = 'PROPRIETARIO'
  )
);
```

## 🔒 Segurança

### Proteções Implementadas

1. **Autenticação Dupla**: Supabase Auth + verificação de perfil
2. **RLS**: Políticas de segurança no banco de dados
3. **Auditoria**: Log de todas as ações críticas
4. **Soft Delete**: Dados "excluídos" ficam marcados
5. **Versionamento**: Histórico de alterações
6. **Rate Limiting**: Proteção contra ataques
7. **Validação Dupla**: Frontend e backend

### Prevenção de Ataques

- **SQL Injection**: Queries parametrizadas
- **XSS**: Sanitização de inputs
- **CSRF**: Tokens de validação
- **Privilege Escalation**: Verificação em múltiplas camadas

## 📊 Monitoramento

### Métricas Disponíveis

```tsx
import { useUsuarios } from './modules/usuarios-permissoes';

function Dashboard() {
  const { estatisticas } = useUsuarios();
  
  // estatisticas.total - Total de usuários
  // estatisticas.ativos - Usuários ativos
  // estatisticas.por_perfil - Distribuição por perfil
  // estatisticas.ultimos_acessos - Acessos recentes
}
```

### Logs de Auditoria

Todas as ações críticas são registradas:
- Login/Logout
- Criação/Edição/Exclusão de dados
- Mudanças de permissões
- Acessos negados

## 🚀 Próximos Passos

1. **Implementar 2FA** (Autenticação de dois fatores)
2. **Dashboard Operacional** para farmacêuticos
3. **Dashboard de Produção** para manipuladores
4. **Relatórios de Segurança** avançados
5. **Integração com LDAP/AD** para empresas
6. **Permissões temporárias** (horário, data)
7. **Aprovação em múltiplas etapas**

## 📝 Exemplos Práticos

### Cenário 1: Atendente tentando acessar financeiro

```tsx
// O componente não será renderizado
<ProtectedComponent
  modulo={ModuloSistema.FINANCEIRO}
  acao={AcaoPermissao.LER}
>
  <RelatorioVendas /> {/* Não aparece para atendente */}
</ProtectedComponent>
```

### Cenário 2: Proprietário gerenciando usuários

```tsx
function GestaoUsuarios() {
  const { podeGerenciarUsuarios } = usePermissoes();
  const { criarUsuario, listarUsuarios } = useUsuarios();
  
  if (!podeGerenciarUsuarios()) {
    return <AcessoNegado />;
  }
  
  // Interface completa de gestão
  return <InterfaceGestaoUsuarios />;
}
```

### Cenário 3: Farmacêutico aprovando fórmulas

```tsx
function AprovacaoFormulas() {
  const { podeAprovarManipulacoes } = usePermissoes();
  
  return (
    <div>
      {podeAprovarManipulacoes() ? (
        <BotaoAprovar />
      ) : (
        <span>Aguardando aprovação do farmacêutico</span>
      )}
    </div>
  );
}
```

## 🎯 Benefícios

1. **Segurança**: Controle granular de acesso
2. **Flexibilidade**: Perfis customizáveis
3. **Auditoria**: Rastreabilidade completa
4. **UX**: Dashboards específicos por função
5. **Escalabilidade**: Suporte a crescimento da equipe
6. **Compliance**: Atende requisitos regulatórios
7. **Manutenibilidade**: Código organizado e modular 