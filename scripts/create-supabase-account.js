const { chromium } = require('playwright');

async function createSupabaseAccount() {
  const browser = await chromium.launch({ headless: false }); // headless: false para ver o que está acontecendo
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🌐 Acessando Supabase...');
    await page.goto('https://supabase.com');

    // Aguardar e clicar no botão de Sign Up
    console.log('🔍 Procurando botão de Sign Up...');
    await page.waitForTimeout(2000);

    // Tentar encontrar e clicar no botão "Start your project" ou "Sign up"
    const signupSelectors = [
      'text=Start your project',
      'text=Sign up',
      'text=Get started',
      'a[href*="dashboard.supabase"]',
      'a[href*="app.supabase"]'
    ];

    let clicked = false;
    for (const selector of signupSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible({ timeout: 1000 })) {
          console.log(`✅ Encontrado: ${selector}`);
          await element.click();
          clicked = true;
          break;
        }
      } catch (e) {
        // Continuar tentando outros seletores
      }
    }

    if (!clicked) {
      // Navegar diretamente para o dashboard
      console.log('📍 Navegando diretamente para dashboard...');
      await page.goto('https://supabase.com/dashboard');
    }

    await page.waitForTimeout(3000);

    // Procurar pelo formulário de sign up
    console.log('📝 Procurando formulário de cadastro...');

    // Verificar se há um link "Sign up" ou "Create account"
    const signupLinkSelectors = [
      'text=Sign up',
      'text=Create account',
      'text=Create an account',
      'a[href*="sign-up"]',
      'button:has-text("Sign up")'
    ];

    for (const selector of signupLinkSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible({ timeout: 1000 })) {
          console.log(`✅ Clicando em: ${selector}`);
          await element.click();
          await page.waitForTimeout(2000);
          break;
        }
      } catch (e) {
        // Continuar
      }
    }

    // Preencher email
    console.log('📧 Preenchendo email...');
    const emailSelectors = [
      'input[type="email"]',
      'input[name="email"]',
      'input[placeholder*="email" i]'
    ];

    for (const selector of emailSelectors) {
      try {
        const emailInput = await page.locator(selector).first();
        if (await emailInput.isVisible({ timeout: 1000 })) {
          await emailInput.fill('feetfansoficial@gmail.com');
          console.log('✅ Email preenchido');
          break;
        }
      } catch (e) {
        // Continuar
      }
    }

    // Preencher senha
    console.log('🔐 Preenchendo senha...');
    const passwordSelectors = [
      'input[type="password"]',
      'input[name="password"]',
      'input[placeholder*="password" i]'
    ];

    for (const selector of passwordSelectors) {
      try {
        const passwordInput = await page.locator(selector).first();
        if (await passwordInput.isVisible({ timeout: 1000 })) {
          await passwordInput.fill('E1g9m8d9us!');
          console.log('✅ Senha preenchida');
          break;
        }
      } catch (e) {
        // Continuar
      }
    }

    // Clicar no botão de submit
    console.log('🚀 Enviando formulário...');
    const submitSelectors = [
      'button[type="submit"]',
      'button:has-text("Sign up")',
      'button:has-text("Create account")',
      'button:has-text("Continue")'
    ];

    for (const selector of submitSelectors) {
      try {
        const submitButton = await page.locator(selector).first();
        if (await submitButton.isVisible({ timeout: 1000 })) {
          await submitButton.click();
          console.log('✅ Formulário enviado');
          break;
        }
      } catch (e) {
        // Continuar
      }
    }

    // Aguardar resposta
    await page.waitForTimeout(5000);

    console.log('');
    console.log('⏸️  PAUSADO - Verificação de Email Necessária');
    console.log('');
    console.log('📧 Um email de verificação foi enviado para: feetfansoficial@gmail.com');
    console.log('');
    console.log('👉 AÇÃO NECESSÁRIA:');
    console.log('   1. Abra seu email');
    console.log('   2. Procure por email do Supabase');
    console.log('   3. Clique no link de verificação');
    console.log('   4. Volte aqui e pressione Enter para continuar');
    console.log('');

    // Aguardar input do usuário
    await new Promise(resolve => {
      process.stdin.once('data', () => resolve());
    });

    console.log('');
    console.log('✅ Continuando...');

    // Aguardar um pouco mais
    await page.waitForTimeout(3000);

    // Verificar se está na dashboard
    const currentUrl = page.url();
    console.log(`📍 URL atual: ${currentUrl}`);

    // Tentar criar projeto
    if (currentUrl.includes('dashboard') || currentUrl.includes('app.supabase')) {
      console.log('🏗️  Criando projeto...');

      // Procurar botão "New project" ou similar
      const newProjectSelectors = [
        'text=New project',
        'text=Create project',
        'button:has-text("New project")'
      ];

      for (const selector of newProjectSelectors) {
        try {
          const element = await page.locator(selector).first();
          if (await element.isVisible({ timeout: 2000 })) {
            await element.click();
            await page.waitForTimeout(2000);
            break;
          }
        } catch (e) {
          // Continuar
        }
      }

      // Preencher nome do projeto
      const projectNameInput = await page.locator('input[name="name"], input[placeholder*="project name" i]').first();
      if (await projectNameInput.isVisible({ timeout: 2000 })) {
        await projectNameInput.fill('feetfans-app');
      }

      // Selecionar região
      const regionSelect = await page.locator('select, [role="combobox"]').first();
      if (await regionSelect.isVisible({ timeout: 2000 })) {
        // Tentar selecionar us-east-1
        try {
          await regionSelect.selectOption({ label: /us-east/i });
        } catch (e) {
          console.log('⚠️  Não foi possível selecionar região automaticamente');
        }
      }

      // Preencher senha do database (geralmente a mesma senha)
      const dbPasswordInput = await page.locator('input[type="password"]').first();
      if (await dbPasswordInput.isVisible({ timeout: 2000 })) {
        await dbPasswordInput.fill('E1g9m8d9us!');
      }

      // Clicar em "Create project"
      const createProjectButton = await page.locator('button:has-text("Create project"), button:has-text("Create new project")').first();
      if (await createProjectButton.isVisible({ timeout: 2000 })) {
        await createProjectButton.click();
      }

      console.log('⏳ Aguardando criação do projeto (pode levar até 2 minutos)...');
      await page.waitForTimeout(120000); // 2 minutos

      // Tentar capturar as credenciais
      console.log('🔑 Procurando credenciais...');

      // Navegar para Settings > API
      try {
        await page.goto(currentUrl + '/settings/api');
        await page.waitForTimeout(3000);

        // Tentar capturar SUPABASE_URL
        const urlElement = await page.locator('text=/https:\\/\\/.*\\.supabase\\.co/').first();
        if (await urlElement.isVisible({ timeout: 2000 })) {
          const supabaseUrl = await urlElement.textContent();
          console.log('');
          console.log('✅ CREDENCIAIS ENCONTRADAS:');
          console.log('');
          console.log(`SUPABASE_URL=${supabaseUrl}`);
          console.log('');
          console.log('⚠️  SUPABASE_ANON_KEY: Copie manualmente da página Settings > API');
          console.log('');
        }
      } catch (e) {
        console.log('⚠️  Não foi possível capturar credenciais automaticamente');
        console.log('📋 Por favor, copie manualmente de Settings > API:');
        console.log('   - Project URL (SUPABASE_URL)');
        console.log('   - anon/public key (SUPABASE_ANON_KEY)');
      }

      console.log('');
      console.log('🌐 Navegador permanecerá aberto para você copiar as credenciais.');
      console.log('   Pressione Enter quando terminar.');
      console.log('');

      await new Promise(resolve => {
        process.stdin.once('data', () => resolve());
      });

    } else {
      console.log('⚠️  Não foi possível acessar o dashboard automaticamente.');
      console.log('📋 Por favor, complete manualmente:');
      console.log('   1. Verifique seu email');
      console.log('   2. Faça login no Supabase');
      console.log('   3. Crie projeto "feetfans-app"');
      console.log('   4. Copie as credenciais de Settings > API');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.log('');
    console.log('📋 Processo manual necessário:');
    console.log('   1. Acesse https://supabase.com');
    console.log('   2. Sign up com: feetfansoficial@gmail.com');
    console.log('   3. Verifique email');
    console.log('   4. Crie projeto "feetfans-app"');
    console.log('   5. Copie credenciais de Settings > API');
  } finally {
    // Não fechar o browser automaticamente
    console.log('');
    console.log('💡 Pressione Enter para fechar o navegador.');
    await new Promise(resolve => {
      process.stdin.once('data', () => resolve());
    });
    await browser.close();
  }
}

createSupabaseAccount().catch(console.error);
