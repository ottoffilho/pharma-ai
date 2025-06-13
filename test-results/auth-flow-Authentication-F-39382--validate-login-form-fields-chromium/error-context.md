# Test info

- Name: Authentication Flow E2E >> should validate login form fields
- Location: D:\PROJETOS\pharma.ai\tests\e2e\auth-flow.spec.ts:40:3

# Error details

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button[type="submit"]')

    at D:\PROJETOS\pharma.ai\tests\e2e\auth-flow.spec.ts:44:16
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
   1 | import { test, expect } from '@playwright/test'
   2 | import { TEST_CONFIG } from '../test-config'
   3 |
   4 | test.describe('Authentication Flow E2E', () => {
   5 |   test.beforeEach(async ({ page }) => {
   6 |     // Limpar localStorage antes de cada teste
   7 |     await page.goto('/')
   8 |     await page.evaluate(() => {
   9 |       localStorage.clear()
   10 |       sessionStorage.clear()
   11 |     })
   12 |   })
   13 |
   14 |   test('should redirect to login when accessing admin without authentication', async ({ page }) => {
   15 |     await page.goto('/admin')
   16 |     await expect(page).toHaveURL(/\/login/)
   17 |   })
   18 |
   19 |   test('should load the login page correctly', async ({ page }) => {
   20 |     await page.goto('/login')
   21 |     
   22 |     // Verificar título ou elementos únicos da página
   23 |     await expect(page.locator('h3')).toContainText('Fazer Login')
   24 |   })
   25 |
   26 |   test('should show login form correctly', async ({ page }) => {
   27 |     await page.goto('/login')
   28 |     
   29 |     // Verificar campos do formulário
   30 |     await expect(page.locator('input[placeholder="seu@email.com"]')).toBeVisible()
   31 |     await expect(page.locator('input[placeholder="Sua senha"]')).toBeVisible()
   32 |     
   33 |     // Verificar botão de entrar
   34 |     await expect(page.locator('button[type="submit"]')).toContainText('Entrar')
   35 |     
   36 |     // Verificar link para esqueci senha (usando seletor mais específico)
   37 |     await expect(page.getByRole('button', { name: 'Esqueci minha senha' })).toBeVisible()
   38 |   })
   39 |
   40 |   test('should validate login form fields', async ({ page }) => {
   41 |     await page.goto('/login')
   42 |     
   43 |     // Tentar submeter formulário vazio
>  44 |     await page.click('button[type="submit"]')
      |                ^ Error: page.click: Test timeout of 30000ms exceeded.
   45 |     
   46 |     // Aguardar mensagens de validação aparecerem
   47 |     await expect(page.locator('text=Email inválido')).toBeVisible({ timeout: 3000 })
   48 |     await expect(page.locator('text=Senha é obrigatória')).toBeVisible({ timeout: 3000 })
   49 |   })
   50 |
   51 |   test('should handle login error for invalid credentials', async ({ page }) => {
   52 |     await page.goto('/login')
   53 |     
   54 |     // Preencher com credenciais inválidas
   55 |     await page.fill('input[placeholder="seu@email.com"]', 'usuario@inexistente.com')
   56 |     await page.fill('input[placeholder="Sua senha"]', 'senhaerrada')
   57 |     
   58 |     // Submeter formulário
   59 |     await page.click('button[type="submit"]')
   60 |     
   61 |     // Aguardar mensagem de erro (primeiro elemento que aparecer)
   62 |     await expect(page.locator('text=Credenciais inválidas').first()).toBeVisible({ timeout: 10000 })
   63 |   })
   64 |
   65 |   test('should login successfully with proprietario credentials', async ({ page }) => {
   66 |     await page.goto('/login')
   67 |     
   68 |     // Fazer login com credenciais do proprietário de teste
   69 |     await page.fill('input[placeholder="seu@email.com"]', TEST_CONFIG.users.proprietario.email)
   70 |     await page.fill('input[placeholder="Sua senha"]', TEST_CONFIG.users.proprietario.password)
   71 |     await page.click('button[type="submit"]')
   72 |     
   73 |     // Aguardar redirecionamento para dashboard administrativo
   74 |     await expect(page).toHaveURL(/\/admin/, { timeout: 15000 })
   75 |     
   76 |     // Verificar se o menu do usuário está presente (usar primeiro elemento encontrado)
   77 |     await expect(
   78 |       page.locator('button[aria-label="Menu do usuário"]').or(
   79 |         page.locator('button:has-text("PT")')
   80 |       ).first()
   81 |     ).toBeVisible({ timeout: 15000 })
   82 |   })
   83 |
   84 |   test('should remember login state after page refresh', async ({ page }) => {
   85 |     // Login como proprietário
   86 |     await page.goto('/login')
   87 |     await page.fill('input[type="email"]', 'proprietario.teste@pharmaai.com')
   88 |     await page.fill('input[type="password"]', 'Teste123!')
   89 |     await page.click('button[type="submit"]')
   90 |     
   91 |     // Aguardar estar logado
   92 |     await expect(page).toHaveURL(/\/admin/, { timeout: 15000 })
   93 |     
   94 |     // Refresh da página
   95 |     await page.reload()
   96 |     
   97 |     // Deve continuar logado e mostrar o menu do usuário
   98 |     await expect(
   99 |       page.locator('button[aria-label="Menu do usuário"]').or(
  100 |         page.locator('button:has-text("PT")')
  101 |       ).first()
  102 |     ).toBeVisible({ timeout: 15000 })
  103 |   })
  104 |
  105 |   test('should logout successfully', async ({ page }) => {
  106 |     // Login como proprietário (que tem acesso ao dashboard administrativo)
  107 |     await page.goto('/login')
  108 |     await page.fill('input[type="email"]', 'proprietario.teste@pharmaai.com')
  109 |     await page.fill('input[type="password"]', 'Teste123!')
  110 |     await page.click('button[type="submit"]')
  111 |     
  112 |     // Aguardar estar logado no dashboard administrativo
  113 |     await expect(page).toHaveURL(/\/admin/, { timeout: 15000 })
  114 |     
  115 |     // Fazer logout - usar primeiro menu encontrado (PT = Proprietário Teste)
  116 |     const userMenuButton = page.locator('button[aria-label="Menu do usuário"]').or(
  117 |       page.locator('button:has-text("PT")')
  118 |     ).first()
  119 |     
  120 |     await userMenuButton.click()
  121 |     await page.click('text=Sair')
  122 |     
  123 |     // Deve ser redirecionado para login
  124 |     await expect(page).toHaveURL(/\/login/)
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
```