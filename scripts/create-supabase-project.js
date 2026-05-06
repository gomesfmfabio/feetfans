const { chromium } = require('playwright');
const fs = require('fs');

async function createSupabaseProject() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000 // Slow down for stability
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔐 Fazendo login no Supabase...');

    // Go to dashboard
    await page.goto('https://supabase.com/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Check if already logged in
    const currentUrl = page.url();

    if (!currentUrl.includes('dashboard/projects') && !currentUrl.includes('dashboard/org')) {
      // Need to login
      console.log('📧 Fazendo login...');

      // Look for sign in button/link
      try {
        const signInButton = page.locator('text=Sign in, a[href*="sign-in"], button:has-text("Sign in")').first();
        await signInButton.click({ timeout: 5000 });
        await page.waitForTimeout(2000);
      } catch (e) {
        console.log('⚠️  Botão Sign in não encontrado, tentando direto...');
      }

      // Fill email
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      await emailInput.fill('feetfansoficial@gmail.com');
      await page.waitForTimeout(500);

      // Fill password
      const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
      await passwordInput.fill('E1g9m8d9us!');
      await page.waitForTimeout(500);

      // Click sign in
      const submitButton = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Continue")').first();
      await submitButton.click();

      console.log('⏳ Aguardando login...');
      await page.waitForTimeout(5000);
    }

    console.log('✅ Login realizado!');
    console.log('📍 URL atual:', page.url());

    // Now create project
    console.log('🏗️  Procurando botão New Project...');

    // Wait for page to load
    await page.waitForTimeout(3000);

    // Try to find and click "New project" button
    const newProjectSelectors = [
      'button:has-text("New project")',
      'a:has-text("New project")',
      'text=New project',
      '[data-testid="new-project-button"]'
    ];

    let projectButtonClicked = false;
    for (const selector of newProjectSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          console.log(`✅ Clicando em: ${selector}`);
          await element.click();
          projectButtonClicked = true;
          await page.waitForTimeout(3000);
          break;
        }
      } catch (e) {
        // Continue
      }
    }

    if (!projectButtonClicked) {
      console.log('⚠️  Botão New Project não encontrado automaticamente');
      console.log('📋 Por favor, clique manualmente em "New project"');
      console.log('⏳ Aguardando 30 segundos para você clicar...');
      await page.waitForTimeout(30000);
    }

    // Fill project details
    console.log('📝 Preenchendo detalhes do projeto...');

    // Project name
    try {
      const nameInput = page.locator('input[name="name"], input[placeholder*="project name" i], input[id*="name"]').first();
      if (await nameInput.isVisible({ timeout: 3000 })) {
        await nameInput.fill('feetfans-app');
        console.log('✅ Nome do projeto: feetfans-app');
      }
    } catch (e) {
      console.log('⚠️  Campo nome não encontrado');
    }

    // Database password
    try {
      const passwordField = page.locator('input[type="password"], input[name="dbPass"], input[placeholder*="password" i]').first();
      if (await passwordField.isVisible({ timeout: 3000 })) {
        await passwordField.fill('E1g9m8d9us!');
        console.log('✅ Senha do database configurada');
      }
    } catch (e) {
      console.log('⚠️  Campo senha não encontrado');
    }

    // Region - try to select us-east-1
    try {
      // Look for region selector (could be select, combobox, or custom dropdown)
      const regionSelectors = [
        'select[name="region"]',
        '[role="combobox"]',
        'button:has-text("Region")',
        'div:has-text("Region")'
      ];

      for (const selector of regionSelectors) {
        try {
          const regionElement = page.locator(selector).first();
          if (await regionElement.isVisible({ timeout: 2000 })) {
            await regionElement.click();
            await page.waitForTimeout(1000);

            // Try to find and click us-east-1 or East US
            const usEastOptions = [
              'text=East US',
              'text=/.*us-east.*/i',
              'text=/.*North Virginia.*/i'
            ];

            for (const optionSelector of usEastOptions) {
              try {
                const option = page.locator(optionSelector).first();
                if (await option.isVisible({ timeout: 1000 })) {
                  await option.click();
                  console.log('✅ Região selecionada: East US');
                  break;
                }
              } catch (e) {
                // Continue
              }
            }
            break;
          }
        } catch (e) {
          // Continue
        }
      }
    } catch (e) {
      console.log('⚠️  Seletor de região não encontrado (usará default)');
    }

    await page.waitForTimeout(2000);

    // Click Create Project
    console.log('🚀 Criando projeto...');
    try {
      const createButton = page.locator('button:has-text("Create new project"), button[type="submit"]').first();
      if (await createButton.isVisible({ timeout: 3000 })) {
        await createButton.click();
        console.log('✅ Botão Create clicado!');
      }
    } catch (e) {
      console.log('⚠️  Botão Create não encontrado automaticamente');
      console.log('📋 Por favor, clique manualmente em "Create new project"');
    }

    // Wait for project creation (can take 1-2 minutes)
    console.log('⏳ Aguardando criação do projeto (1-2 minutos)...');
    await page.waitForTimeout(120000); // 2 minutes

    // Navigate to API settings
    console.log('🔑 Navegando para Settings > API...');

    // Try to find settings
    const settingsSelectors = [
      'a:has-text("Settings")',
      'text=Settings',
      '[data-testid="settings-link"]'
    ];

    for (const selector of settingsSelectors) {
      try {
        const settingsLink = page.locator(selector).first();
        if (await settingsLink.isVisible({ timeout: 3000 })) {
          await settingsLink.click();
          await page.waitForTimeout(2000);
          break;
        }
      } catch (e) {
        // Continue
      }
    }

    // Click API
    const apiSelectors = [
      'a:has-text("API")',
      'text=API',
      'button:has-text("API")'
    ];

    for (const selector of apiSelectors) {
      try {
        const apiLink = page.locator(selector).first();
        if (await apiLink.isVisible({ timeout: 3000 })) {
          await apiLink.click();
          await page.waitForTimeout(3000);
          break;
        }
      } catch (e) {
        // Continue
      }
    }

    console.log('📋 Capturando credenciais...');

    // Try to capture credentials
    let supabaseUrl = '';
    let supabaseAnonKey = '';

    // Look for URL (usually labeled as "Project URL" or "API URL")
    try {
      // Find text that looks like https://xxxxx.supabase.co
      const urlPattern = /https:\/\/[a-z0-9-]+\.supabase\.co/g;
      const pageContent = await page.content();
      const urlMatches = pageContent.match(urlPattern);

      if (urlMatches && urlMatches.length > 0) {
        supabaseUrl = urlMatches[0];
        console.log(`✅ SUPABASE_URL encontrada: ${supabaseUrl}`);
      }
    } catch (e) {
      console.log('⚠️  URL não capturada automaticamente');
    }

    // Look for anon key (starts with eyJ)
    try {
      // Find JWT-like string (starts with eyJ)
      const jwtPattern = /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*/g;
      const pageContent = await page.content();
      const jwtMatches = pageContent.match(jwtPattern);

      if (jwtMatches && jwtMatches.length > 0) {
        // Usually the anon/public key is one of the longer ones
        const sortedByLength = jwtMatches.sort((a, b) => b.length - a.length);
        supabaseAnonKey = sortedByLength[0];
        console.log(`✅ SUPABASE_ANON_KEY encontrada (${supabaseAnonKey.length} caracteres)`);
      }
    } catch (e) {
      console.log('⚠️  Anon key não capturada automaticamente');
    }

    // Save to file
    if (supabaseUrl && supabaseAnonKey) {
      const envContent = `
# Supabase Credentials - FeetFans App
SUPABASE_URL=${supabaseUrl}
SUPABASE_ANON_KEY=${supabaseAnonKey}
DATABASE_PASSWORD=E1g9m8d9us!
`;

      fs.writeFileSync('supabase-credentials.txt', envContent.trim());

      console.log('');
      console.log('🎉 CREDENCIAIS CAPTURADAS COM SUCESSO!');
      console.log('');
      console.log('📁 Salvas em: supabase-credentials.txt');
      console.log('');
      console.log('SUPABASE_URL=' + supabaseUrl);
      console.log('SUPABASE_ANON_KEY=' + supabaseAnonKey.substring(0, 50) + '...');
      console.log('');
    } else {
      console.log('');
      console.log('⚠️  Não foi possível capturar credenciais automaticamente');
      console.log('📋 Por favor, copie manualmente da página:');
      console.log('   Settings > API');
      console.log('   - Project URL');
      console.log('   - anon/public key');
      console.log('');
      console.log('🌐 Navegador permanecerá aberto.');
    }

    console.log('⏳ Aguardando 60 segundos antes de fechar...');
    await page.waitForTimeout(60000);

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.log('');
    console.log('📋 Por favor, complete manualmente:');
    console.log('   1. Acesse Settings > API no dashboard');
    console.log('   2. Copie Project URL e anon/public key');
    console.log('');
  } finally {
    await browser.close();
    console.log('✅ Navegador fechado');
  }
}

createSupabaseProject().catch(console.error);
