# Test info

- Name: Pharma.AI Basic Tests >> should show login form
- Location: D:\PROJETOS\pharma.ai\tests\e2e\app-basic-test.spec.ts:25:3

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

Locator: locator('input[type="email"]')
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for locator('input[type="email"]')

    at D:\PROJETOS\pharma.ai\tests\e2e\app-basic-test.spec.ts:29:55
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
   3 | test.describe('Pharma.AI Basic Tests', () => {
   4 |   test('should load the homepage', async ({ page }) => {
   5 |     await page.goto('/')
   6 |     
   7 |     // Verificar se a página carregou
   8 |     await expect(page).toHaveTitle(/Pharma/)
   9 |     
  10 |     // Verificar se há algum elemento da aplicação
  11 |     await page.waitForLoadState('networkidle')
  12 |     
  13 |     console.log('✅ Homepage loaded successfully!')
  14 |   })
  15 |
  16 |   test('should redirect to login when accessing admin without auth', async ({ page }) => {
  17 |     await page.goto('/admin')
  18 |     
  19 |     // Deve ser redirecionado para login
  20 |     await page.waitForURL(/login/, { timeout: 10000 })
  21 |     
  22 |     console.log('✅ Redirect to login working!')
  23 |   })
  24 |
  25 |   test('should show login form', async ({ page }) => {
  26 |     await page.goto('/login')
  27 |     
  28 |     // Verificar se elementos básicos de login estão presentes
> 29 |     await expect(page.locator('input[type="email"]')).toBeVisible()
     |                                                       ^ Error: Timed out 5000ms waiting for expect(locator).toBeVisible()
  30 |     await expect(page.locator('input[type="password"]')).toBeVisible()
  31 |     
  32 |     console.log('✅ Login form is visible!')
  33 |   })
  34 | }) 
```