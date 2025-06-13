# Test info

- Name: Pharma.AI Basic Tests >> should load the homepage
- Location: D:\PROJETOS\pharma.ai\tests\e2e\app-basic-test.spec.ts:4:3

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toHaveTitle(expected)

Locator: locator(':root')
Expected pattern: /Pharma/
Received string:  "403 - Acesso negado"
Call log:
  - expect.toHaveTitle with timeout 5000ms
  - waiting for locator(':root')
    8 × locator resolved to <html lang="pt-br" class="no-js">…</html>
      - unexpected value "403 - Acesso negado"

    at D:\PROJETOS\pharma.ai\tests\e2e\app-basic-test.spec.ts:8:24
```

# Page snapshot

```yaml
- banner:
  - link "HostGator Hospedagem de Sites":
    - /url: https://www.hostgator.com.br/?utm_source=interno&utm_medium=link&utm_campaign=page403
    - img "HostGator Hospedagem de Sites"
  - heading "Erro 403 Acesso negado" [level=1]
- term:
  - link "Por que estou vendo esta página?":
    - /url: "#"
- term:
  - link "Existe algo que eu possa fazer?":
    - /url: "#"
- term:
  - link "Compreendendo o sistema de permissões de arquivos":
    - /url: "#"
- term:
  - link "Como modificar seu arquivo .htaccess":
    - /url: "#"
- term:
  - link "Como modificar as permissões de arquivos e diretórios":
    - /url: "#"
- contentinfo:
  - paragraph:
    - text: Esse site é hospedado pela HostGator
    - link "Conheça nossos planos":
      - /url: https://www.hostgator.com.br/hospedagem-de-sites.php?utm_source=interno&utm_medium=link&utm_campaign=page403
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
>  8 |     await expect(page).toHaveTitle(/Pharma/)
     |                        ^ Error: Timed out 5000ms waiting for expect(locator).toHaveTitle(expected)
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
  29 |     await expect(page.locator('input[type="email"]')).toBeVisible()
  30 |     await expect(page.locator('input[type="password"]')).toBeVisible()
  31 |     
  32 |     console.log('✅ Login form is visible!')
  33 |   })
  34 | }) 
```