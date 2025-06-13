# Test info

- Name: Authentication Flow E2E >> should handle session timeout gracefully
- Location: D:\PROJETOS\pharma.ai\tests\e2e\auth-flow.spec.ts:222:3

# Error details

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[placeholder="seu@email.com"]')

    at D:\PROJETOS\pharma.ai\tests\e2e\auth-flow.spec.ts:225:16
```

# Page snapshot

```yaml
- heading "Erro 404" [level=3]
- heading "Ops, Não encontramos essa página!" [level=1]:
  - strong: Ops,
  - text: Não encontramos essa página!
- paragraph: Parece que a página que você está procurando foi movida ou nunca existiu, certifique-se que digitou o endereço corretamente ou seguiu um link válido.
- link "Conheça-nos!":
  - /url: https://www.hostgator.com.br
- img "HostGator"
- img "illustration"
```

# Test source

```ts
  125 |     
  126 |     // Tentar acessar área administrativa novamente
  127 |     await page.goto('/admin')
  128 |     await expect(page).toHaveURL(/\/login/)
  129 |   })
  130 |
  131 |   test('should handle different user profiles correctly - PROPRIETARIO', async ({ page }) => {
  132 |     // Teste para proprietário
  133 |     await page.goto('/login')
  134 |     await page.fill('input[placeholder="seu@email.com"]', TEST_CONFIG.users.proprietario.email)
  135 |     await page.fill('input[placeholder="Sua senha"]', TEST_CONFIG.users.proprietario.password)
  136 |     await page.click('button[type="submit"]')
  137 |     
  138 |     await expect(page).toHaveURL(/\/admin/, { timeout: 15000 })
  139 |     
  140 |     // Verificar que está logado
  141 |     await expect(
  142 |       page.locator('button[aria-label="Menu do usuário"]').or(
  143 |         page.locator('button:has-text("PT")')
  144 |       ).first()
  145 |     ).toBeVisible({ timeout: 15000 })
  146 |     
  147 |     // Verificar se há links de navegação principais (primeiro elemento visível)
  148 |     await expect(page.locator('text=Dashboard').first()).toBeVisible({ timeout: 5000 })
  149 |     await expect(page.locator('text=Vendas').first()).toBeVisible({ timeout: 5000 })
  150 |     
  151 |     // Logout
  152 |     const userMenuButton = page.locator('button[aria-label="Menu do usuário"]').or(
  153 |       page.locator('button:has-text("PT")')
  154 |     ).first()
  155 |     
  156 |     await userMenuButton.click()
  157 |     await page.click('text=Sair')
  158 |     await expect(page).toHaveURL(/\/login/)
  159 |   })
  160 |
  161 |   // TESTES DE PERFIS ESPECÍFICOS - COMENTADOS TEMPORARIAMENTE
  162 |   // Cada perfil tem seu próprio dashboard, precisam de testes específicos
  163 |
  164 |   /*
  165 |   test('should handle different user profiles correctly - FARMACEUTICO', async ({ page }) => {
  166 |     // Login com farmacêutico
  167 |     await page.goto('/login')
  168 |     await page.fill('input[type="email"]', 'farmaceutico.teste@pharmaai.com')
  169 |     await page.fill('input[type="password"]', 'Teste123!')
  170 |     await page.click('button[type="submit"]')
  171 |     
  172 |     // Aguardar estar logado - FARMACEUTICO vai para DashboardOperacional
  173 |     await expect(page).toHaveURL(/\/admin/, { timeout: 15000 })
  174 |     
  175 |     // Verificar se aparece conteúdo do dashboard operacional
  176 |     await expect(page.locator('h1')).toContainText('Dashboard Operacional')
  177 |     
  178 |     // Logout específico do dashboard operacional
  179 |     await page.click('button:contains("Sair")')
  180 |     await expect(page).toHaveURL(/\/login/)
  181 |   })
  182 |
  183 |   test('should restrict access based on user profile - ATENDENTE', async ({ page }) => {
  184 |     // Login com atendente
  185 |     await page.goto('/login')
  186 |     await page.fill('input[type="email"]', 'atendente.teste@pharmaai.com')
  187 |     await page.fill('input[type="password"]', 'Teste123!')
  188 |     await page.click('button[type="submit"]')
  189 |     
  190 |     // Aguardar estar logado - ATENDENTE vai para DashboardAtendimento
  191 |     await expect(page).toHaveURL(/\/admin/, { timeout: 15000 })
  192 |     
  193 |     // Verificar se aparece conteúdo do dashboard de atendimento
  194 |     await expect(page.locator('h1')).toContainText('Dashboard Atendimento')
  195 |   })
  196 |
  197 |   test('should handle MANIPULADOR profile correctly', async ({ page }) => {
  198 |     // Login com manipulador
  199 |     await page.goto('/login')
  200 |     await page.fill('input[type="email"]', 'manipulador.teste@pharmaai.com')
  201 |     await page.fill('input[type="password"]', 'Teste123!')
  202 |     await page.click('button[type="submit"]')
  203 |     
  204 |     // Aguardar estar logado - MANIPULADOR vai para DashboardProducao
  205 |     await expect(page).toHaveURL(/\/admin/, { timeout: 15000 })
  206 |     
  207 |     // Verificar se aparece conteúdo do dashboard de produção
  208 |     await expect(page.locator('h1')).toContainText('Dashboard Produção')
  209 |   })
  210 |   */
  211 |
  212 |   test('should validate password reset flow', async ({ page }) => {
  213 |     await page.goto('/esqueci-senha')
  214 |     
  215 |     // Verificar se chegou na página correta (pode não ter h1 específico)
  216 |     await expect(page).toHaveURL(/\/esqueci-senha/)
  217 |     
  218 |     // Verificar se há campo de email para reset
  219 |     await expect(page.locator('input[type="email"]')).toBeVisible()
  220 |   })
  221 |
  222 |   test('should handle session timeout gracefully', async ({ page }) => {
  223 |     // Login com usuário de teste
  224 |     await page.goto('/login')
> 225 |     await page.fill('input[placeholder="seu@email.com"]', TEST_CONFIG.users.proprietario.email)
      |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  226 |     await page.fill('input[placeholder="Sua senha"]', TEST_CONFIG.users.proprietario.password)
  227 |     await page.click('button[type="submit"]')
  228 |     
  229 |     await expect(page).toHaveURL(/\/admin/, { timeout: 15000 })
  230 |     
  231 |     // Simular expiração de token
  232 |     await page.evaluate(() => {
  233 |       localStorage.clear()
  234 |       sessionStorage.clear()
  235 |     })
  236 |     
  237 |     // Tentar navegar
  238 |     await page.goto('/admin/produtos')
  239 |     
  240 |     // Deve ser redirecionado para login
  241 |     await expect(page).toHaveURL(/\/login/)
  242 |   })
  243 |
  244 |   test('should validate user information display after login', async ({ page }) => {
  245 |     // Login como proprietário
  246 |     await page.goto('/login')
  247 |     await page.fill('input[type="email"]', 'proprietario.teste@pharmaai.com')
  248 |     await page.fill('input[type="password"]', 'Teste123!')
  249 |     await page.click('button[type="submit"]')
  250 |     
  251 |     // Aguardar estar logado
  252 |     await expect(page).toHaveURL(/\/admin/, { timeout: 15000 })
  253 |     
  254 |     // Verificar se o menu do usuário aparece
  255 |     const userMenuButton = page.locator('button[aria-label="Menu do usuário"]').or(
  256 |       page.locator('button:has-text("PT")')
  257 |     ).first()
  258 |     
  259 |     await userMenuButton.click()
  260 |     
  261 |     // Verificar se há informações do usuário no menu dropdown
  262 |     await expect(page.locator('text=Meu Perfil')).toBeVisible()
  263 |     await expect(page.locator('text=Configurações')).toBeVisible()
  264 |     await expect(page.locator('text=Sair')).toBeVisible()
  265 |   })
  266 |
  267 |   test.skip('should perform a complete login flow', async ({ page }) => {
  268 |     // Ir para a página de login
  269 |     await page.goto('/login')
  270 |     
  271 |     // Verificar se a página de login carregou (verificar por input de email em vez de h1)
  272 |     await expect(page.locator('input[type="email"]')).toBeVisible()
  273 |     
  274 |     // Preencher credenciais - USAR PROPRIETARIO para acessar dashboard administrativo
  275 |     await page.fill('input[type="email"]', 'proprietario.teste@pharmaai.com')
  276 |     await page.fill('input[type="password"]', 'Teste123!')
  277 |     
  278 |     // Fazer login
  279 |     await page.click('button[type="submit"]')
  280 |     
  281 |     // Verificar se foi redirecionado para a área administrativa
  282 |     await expect(page).toHaveURL(/\/admin/, { timeout: 15000 })
  283 |     
  284 |     // Verificar se o menu do usuário aparece (iniciais PT para Proprietário Teste)
  285 |     await expect(
  286 |       page.locator('button[aria-label="Menu do usuário"]').or(
  287 |         page.locator('button:has-text("PT")')
  288 |       ).first()
  289 |     ).toBeVisible({ timeout: 15000 })
  290 |   })
  291 | }) 
```