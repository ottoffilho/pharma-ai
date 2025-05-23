# Relatório de Segurança - Pharma.AI

## Resumo Executivo

Após análise completa do código-fonte do projeto Pharma.AI, foram identificadas vulnerabilidades que requerem atenção. Este relatório apresenta os problemas encontrados, classificados por severidade, e recomendações para mitigação.

| Métrica               | Quantidade |
|-----------------------|------------|
| Vulnerabilidades Críticas | 0        |
| Vulnerabilidades Altas | 2        |
| Vulnerabilidades Médias | 3        |
| Vulnerabilidades Baixas | 2        |
| Exposição de Dados    | Média     |

## Vulnerabilidades Altas (CVSS 7.0-8.9)

### Ausência de Validação de Inputs Consistente (CWE-20)
**Arquivos Afetados:**  
`src/components/estoque/InsumoForm.tsx:152`
`src/components/PrescriptionReviewForm.tsx:79-195`

**Descrição:**  
Existem inconsistências na validação de entrada em múltiplos formulários. Em `InsumoForm.tsx`, embora haja um esquema Zod para validação, não existe uma validação adequada para sanitização de inputs antes da inserção no banco de dados, permitindo potenciais injeções de SQL.

**Impacto:**  
Ataques de injeção SQL podem resultar em acesso não autorizado, modificação ou exclusão de dados no banco de dados.

**Recomendações:**  
1. Implementar sanitização de entrada consistente em todos os formulários antes de interagir com o banco de dados
2. Adicionar middleware de validação para garantir que todos os dados sejam verificados antes de chegar aos manipuladores de rota

```suggestion
// Em InsumoForm.tsx, linha 152
// Antes de inserir no banco de dados:
+ const sanitizedData = Object.entries(insumoData).reduce((acc, [key, value]) => {
+   // Sanitizar string inputs
+   acc[key] = typeof value === 'string' ? value.trim().replace(/['";<>]/g, '') : value;
+   return acc;
+ }, {} as Record<string, any>);
+ const { error } = await supabase.from("insumos").insert([sanitizedData]);
- const { error } = await supabase.from("insumos").insert([insumoData]);
```

### Hardcoded Project ID (CWE-798)
**Arquivos Afetados:**  
`supabase/config.toml:1`

**Descrição:**  
O ID do projeto Supabase está codificado diretamente no arquivo de configuração versionado. Isso expõe uma credencial que poderia ser usada para acessar o projeto.

**Impacto:**  
Exposição da infraestrutura do Supabase a acessos não autorizados.

**Recomendações:**  
1. Remover o ID do projeto do arquivo versionado
2. Utilizar variáveis de ambiente para todos os identificadores de projetos
3. Adicionar `config.toml` ao `.gitignore`

```suggestion
# Substituir no arquivo config.toml
+ # O ID do projeto deve ser definido como variável de ambiente
+ # project_id = process.env.SUPABASE_PROJECT_ID
- project_id = "hjwebmpvaaeogbfqxwub"
```

## Vulnerabilidades Médias (CVSS 4.0-6.9)

### Gerenciamento de Erros Inseguro (CWE-209)
**Arquivos Afetados:**  
`src/pages/Login.tsx:46-75`

**Descrição:**  
A página de login expõe detalhes de erros internos nas mensagens de erro ao usuário. Isso pode fornecer informações úteis para atacantes sobre o sistema.

**Impacto:**  
Facilita a engenharia reversa do sistema e ataques direcionados.

**Recomendações:**  
1. Generalizar mensagens de erro para usuários finais
2. Registrar detalhes completos de erros apenas em logs internos
3. Implementar um sistema de tratamento de erros centralizado

```suggestion
// Login.tsx, linha 64-70
+ // Usar mensagens genéricas para o usuário
+ toast({
+   title: "Erro ao realizar login",
+   description: "Credenciais inválidas ou problema no servidor. Tente novamente.",
+   variant: "destructive",
+ });
+ // Registrar o erro detalhado apenas internamente
+ console.error("Erro detalhado:", err);
- let errorMessage = "Verifique suas credenciais e tente novamente.";
- if (err && typeof err === 'object' && 'message' in err && typeof (err as AuthError).message === 'string') {
-   errorMessage = (err as AuthError).message;
- } else if (err instanceof Error) {
-   errorMessage = err.message;
- } else if (typeof err === 'string') {
-   errorMessage = err;
- }
- toast({
-   title: "Erro ao realizar login",
-   description: errorMessage,
-   variant: "destructive",
- });
```

### Verificação de Autenticação Vulnerável a Race Conditions (CWE-362)
**Arquivos Afetados:**  
`src/components/Auth/PrivateRoute.tsx:11-26`

**Descrição:**  
A implementação do PrivateRoute pode ser vulnerável a condições de corrida devido à chamada assíncrona para verificar a sessão, deixando uma breve janela onde o componente pode renderizar o conteúdo protegido antes da autenticação ser concluída.

**Impacto:**  
Possibilidade de acesso momentâneo a conteúdo restrito antes do redirecionamento.

**Recomendações:**  
1. Melhore o sistema de carregamento para garantir que o conteúdo protegido nunca seja renderizado até a autenticação ser concluída
2. Implemente um estado inicial explícito de "carregando" antes de qualquer verificação

```suggestion
// Em PrivateRoute.tsx
+ // Iniciar explicitamente como null para garantir estado de carregamento
+ const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
- const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

// Modificar o useEffect para evitar a race condition
+ useEffect(() => {
+   let isMounted = true;
+   
+   const checkAuth = async () => {
+     try {
+       // Verificar sessão existente primeiro
+       const { data: { session } } = await supabase.auth.getSession();
+       
+       if (isMounted) {
+         setIsAuthenticated(!!session);
+       }
+       
+       // Configurar listener para mudanças de estado após confirmar estado inicial
+       const { data: { subscription } } = supabase.auth.onAuthStateChange(
+         (event, session) => {
+           if (isMounted) {
+             setIsAuthenticated(!!session);
+           }
+         }
+       );
+       
+       return () => {
+         subscription.unsubscribe();
+         isMounted = false;
+       };
+     } catch (error) {
+       console.error('Error checking authentication status:', error);
+       if (isMounted) {
+         setIsAuthenticated(false);
+       }
+     }
+   };
+   
+   checkAuth();
+   
+   return () => {
+     isMounted = false;
+   };
+ }, []);
```

### Validação Inadequada de Arquivos Enviados (CWE-434)
**Arquivos Afetados:**  
`src/components/FileUploadDropzone.tsx:1-62`

**Descrição:**  
O componente de upload de arquivos não implementa verificações rigorosas para tipos de arquivo e tamanho. A validação é limitada a informações fornecidas pelo cliente, sem verificação do conteúdo real do arquivo.

**Impacto:**  
Possibilidade de upload de arquivos maliciosos, incluindo scripts executáveis disfarçados.

**Recomendações:**  
1. Implementar validação baseada no conteúdo dos arquivos, não apenas nas extensões
2. Adicionar limites explícitos de tamanho de arquivo
3. Escanear arquivos enviados em busca de malware

```suggestion
// FileUploadDropzone.tsx:
// Adicionar validações mais rigorosas
+ const validateFileContent = (file: File): Promise<boolean> => {
+   return new Promise((resolve) => {
+     // Verificar tamanho máximo (10MB neste exemplo)
+     if (file.size > 10 * 1024 * 1024) {
+       resolve(false);
+       return;
+     }
+     
+     // Para imagens, verificar o conteúdo real
+     if (file.type.startsWith('image/')) {
+       const reader = new FileReader();
+       reader.onload = (e) => {
+         const img = new Image();
+         img.onload = () => resolve(true);
+         img.onerror = () => resolve(false);
+         img.src = e.target?.result as string;
+       };
+       reader.onerror = () => resolve(false);
+       reader.readAsDataURL(file);
+     } else {
+       // Para PDFs e outros tipos, verificar assinatura de arquivo
+       const reader = new FileReader();
+       reader.onload = (e) => {
+         const arr = new Uint8Array(e.target?.result as ArrayBuffer).subarray(0, 4);
+         let header = "";
+         for(let i = 0; i < arr.length; i++) {
+           header += arr[i].toString(16);
+         }
+         // Verificar assinaturas de PDF, DOCX, etc.
+         const isPdf = header === "25504446"; // %PDF
+         // Adicionar outras assinaturas conforme necessário
+         resolve(isPdf);
+       };
+       reader.readAsArrayBuffer(file.slice(0, 4));
+     }
+   });
+ }
+ 
+ const onDrop = useCallback(async (acceptedFiles: File[]) => {
+   const validatedFiles = [];
+   for (const file of acceptedFiles) {
+     const isValid = await validateFileContent(file);
+     if (isValid) {
+       validatedFiles.push(file);
+     }
+   }
+   onFilesChange(validatedFiles);
+ }, [onFilesChange]);
```

## Vulnerabilidades Baixas (CVSS ≤ 3.9)

### Falta de Política de Senha Robusta (CWE-521)
**Arquivos Afetados:**  
`src/pages/Login.tsx:1-133`

**Descrição:**  
Não existe uma política clara para força de senha ou limitação de tentativas de login no sistema de autenticação.

**Impacto:**  
Possibilidade de ataques de força bruta e uso de senhas fracas.

**Recomendações:**  
1. Implementar política de senhas com requisitos mínimos (comprimento, complexidade)
2. Adicionar limitação de taxa (rate limiting) para tentativas de login
3. Implementar bloqueio temporário após múltiplas tentativas falhas

```suggestion
// Login.tsx
// Adicionar validação de força de senha e rate limiting
+ // Implementar verificação de força de senha no cliente
+ const isStrongPassword = (password: string): boolean => {
+   // Senha deve ter pelo menos 8 caracteres
+   if (password.length < 8) return false;
+   
+   // Deve conter pelo menos um número
+   if (!/\d/.test(password)) return false;
+   
+   // Deve conter pelo menos uma letra maiúscula
+   if (!/[A-Z]/.test(password)) return false;
+   
+   // Deve conter pelo menos um caractere especial
+   if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
+   
+   return true;
+ }
```

### Credenciais Expostas em Logs (CWE-532)
**Arquivos Afetados:**  
`src/components/estoque/InsumoForm.tsx:122-154`

**Descrição:**  
Existem vários `console.error` no código que podem expor dados sensíveis em registros de log.

**Impacto:**  
Exposição potencial de dados sensíveis a pessoas com acesso aos logs.

**Recomendações:**  
1. Implementar um sistema de logging centralizado com níveis apropriados
2. Sanitizar dados sensíveis antes de registrar erros
3. Usar bibliotecas de logging que suportem redação automática de informações sensíveis

```suggestion
// InsumoForm.tsx linha 143
+ // Sanitizar dados sensíveis antes de logar
+ console.error("Erro ao salvar insumo:", error.code || 'Erro desconhecido');
- console.error("Erro ao salvar insumo:", error);
```

## Checklist de Conformidade
- [x] Detecção de vulnerabilidades de injeção (OWASP A03:2021)
- [x] Identificação de componentes vulneráveis (OWASP A06:2021)
- [x] Avaliação de falhas de controle de acesso (OWASP A01:2021)
- [x] Verificação de problemas de design de segurança (OWASP A04:2021)
- [ ] Testes de penetração completos (pendente)
- [ ] Verificação de configurações de segurança para produção (pendente)
- [ ] Avaliação de segurança de APIs externas (pendente)

## Próximos Passos Recomendados

1. **Imediato (1-2 dias):**
   - Corrigir as vulnerabilidades altas identificadas
   - Remover credenciais hardcoded do código-fonte

2. **Curto prazo (1-2 semanas):**
   - Implementar sanitização de entrada consistente
   - Melhorar gestão de erros e logging
   - Reforçar validação de arquivos enviados

3. **Médio prazo (1 mês):**
   - Implementar política de senhas robustas
   - Realizar um code review completo com foco em segurança
   - Adicionar testes automatizados para casos de segurança

4. **Longo prazo (2-3 meses):**
   - Implementar análise de segurança contínua no CI/CD
   - Realizar teste de penetração completo
   - Revisar e atualizar a política de segurança 