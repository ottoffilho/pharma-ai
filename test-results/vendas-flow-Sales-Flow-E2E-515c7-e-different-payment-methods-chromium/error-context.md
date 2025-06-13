# Test info

- Name: Sales Flow E2E >> should handle different payment methods
- Location: D:\PROJETOS\pharma.ai\tests\e2e\vendas-flow.spec.ts:127:3

# Error details

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[type="email"]')

    at D:\PROJETOS\pharma.ai\tests\e2e\vendas-flow.spec.ts:7:16
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
   2 |
   3 | test.describe('Sales Flow E2E', () => {
   4 |   test.beforeEach(async ({ page }) => {
   5 |     // Setup: fazer login como atendente
   6 |     await page.goto('/login')
>  7 |     await page.fill('input[type="email"]', 'atendente.teste@pharmaai.com')
     |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
   8 |     await page.fill('input[type="password"]', 'Teste123!')
   9 |     await page.click('button[type="submit"]')
   10 |     
   11 |     // Aguardar estar logado
   12 |     await expect(page).toHaveURL(/\/admin/, { timeout: 10000 })
   13 |   })
   14 |
   15 |   test('should open cash register before starting sales', async ({ page }) => {
   16 |     await page.goto('/admin')
   17 |
   18 |     // Garantir que submenu Vendas esteja expandido
   19 |     await page.click('a[href="/admin/vendas"]', { force: true })
   20 |
   21 |     // Ir para PDV
   22 |     await page.click('a[href="/admin/vendas/pdv"]', { force: true })
   23 |     
   24 |     // Se caixa não estiver aberto, deve mostrar opção para abrir
   25 |     const openCashButton = page.locator('button[data-testid="abrir-caixa"]')
   26 |     
   27 |     if (await openCashButton.isVisible()) {
   28 |       // Abrir caixa
   29 |       await openCashButton.click()
   30 |       
   31 |       // Preencher valor inicial
   32 |       await page.fill('input[data-testid="valor-inicial"]', '100.00')
   33 |       await page.click('button[data-testid="confirmar-abertura"]')
   34 |       
   35 |       // Verificar que caixa foi aberto
   36 |       await expect(page.locator('[data-testid="status-caixa"]')).toContainText('Aberto')
   37 |     }
   38 |   })
   39 |
   40 |   test('should create a complete sale flow', async ({ page }) => {
   41 |     // Navegar para PDV
   42 |     await page.goto('/admin/vendas/pdv')
   43 |     
   44 |     // Verificar elementos da tela de PDV
   45 |     await expect(page.locator('h1')).toContainText('PDV')
   46 |     
   47 |     // Aguardar carregar interface de busca
   48 |     await page.waitForSelector('input[placeholder*="Digite o nome"]', { timeout: 10000 })
   49 |     
   50 |     // Buscar primeiro produto
   51 |     await page.fill('input[placeholder*="Digite o nome"]', 'Bulbo')
   52 |     await page.waitForTimeout(2000) // Aguardar busca carregar
   53 |     
   54 |     // Clicar no primeiro produto encontrado se existir
   55 |     const primeiroProduto = page.locator('.cursor-pointer').first()
   56 |     if (await primeiroProduto.isVisible()) {
   57 |       await primeiroProduto.click()
   58 |       
   59 |       // Verificar que há itens no carrinho - usar texto específico
   60 |       await expect(page.locator('text=Carrinho de Compras')).toBeVisible()
   61 |     }
   62 |     
   63 |     // Buscar segundo produto
   64 |     await page.fill('input[placeholder*="Digite o nome"]', 'Frasco')
   65 |     await page.waitForTimeout(2000)
   66 |     
   67 |     // Clicar no segundo produto se existir
   68 |     const segundoProduto = page.locator('.cursor-pointer').first()
   69 |     if (await segundoProduto.isVisible()) {
   70 |       await segundoProduto.click()
   71 |     }
   72 |     
   73 |     // Verificar que há itens no carrinho
   74 |     await expect(page.locator('text=Carrinho de Compras')).toBeVisible()
   75 |     
   76 |     // Tentar finalizar venda (pode não ter botão implementado ainda)
   77 |     const finalizarButton = page.locator('button:has-text("Finalizar")').first()
   78 |     if (await finalizarButton.isVisible() && await finalizarButton.isEnabled()) {
   79 |       await finalizarButton.click()
   80 |     }
   81 |   })
   82 |
   83 |   test('should remove items from sale', async ({ page }) => {
   84 |     await page.goto('/admin/vendas/pdv')
   85 |     
   86 |     // Aguardar carregar interface
   87 |     await page.waitForSelector('input[placeholder*="Digite o nome"]', { timeout: 10000 })
   88 |     
   89 |     // Adicionar produto
   90 |     await page.fill('input[placeholder*="Digite o nome"]', 'Bulbo')
   91 |     await page.waitForTimeout(2000)
   92 |     
   93 |     const produto = page.locator('.cursor-pointer').first()
   94 |     if (await produto.isVisible()) {
   95 |       await produto.click()
   96 |     }
   97 |     
   98 |     // Verificar se há botão de remover (pode não estar implementado)
   99 |     const removerButton = page.locator('button:has-text("Remover")')
  100 |     if (await removerButton.isVisible()) {
  101 |       await removerButton.click()
  102 |     }
  103 |   })
  104 |
  105 |   test('should validate quantity input', async ({ page }) => {
  106 |     await page.goto('/admin/vendas/pdv')
  107 |     
```