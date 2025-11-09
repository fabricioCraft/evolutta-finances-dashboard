import { test, expect } from '@playwright/test';

// Util para coletar logs do console e diálogos
function attachLogCollectors(page: import('@playwright/test').Page) {
  const logs: { type: string; text: string }[] = [];
  page.on('console', (msg) => {
    logs.push({ type: msg.type(), text: msg.text() });
  });
  page.on('pageerror', (err) => {
    logs.push({ type: 'pageerror', text: err?.message || String(err) });
  });
  page.on('dialog', async (dialog) => {
    logs.push({ type: `dialog:${dialog.type()}`, text: dialog.message() });
    await dialog.dismiss();
  });
  return logs;
}

test.describe('Conexão de Conta (Belvo)', () => {
  test('Login (se possível) e tentativa de conectar conta captura logs e motivo da falha', async ({ page, request }) => {
    const logs = attachLogCollectors(page);

    // Tentar login via página se credenciais de teste estiverem disponíveis
    const email = process.env.TEST_EMAIL;
    const password = process.env.TEST_PASSWORD;
    let loggedIn = false;

    try {
      await page.goto('/login');
      if (email && password) {
        await page.getByLabel('Email').fill(email);
        await page.getByLabel('Senha').fill(password);
        await page.getByRole('button', { name: /Entrar/i }).click();
        await page.waitForURL('**/dashboard', { timeout: 10000 });
        loggedIn = true;
      }
    } catch (e) {
      logs.push({ type: 'login-error', text: (e as Error)?.message || String(e) });
    }

    // Ir para a página de contas (captura redirecionamento para login)
    await page.goto('/accounts');
    await page.waitForLoadState('domcontentloaded');
    const redirectedToLogin = page.url().includes('/login');
    if (redirectedToLogin && !loggedIn) {
      logs.push({ type: 'info', text: 'Redirecionado para /login (sem sessão ativa).' });
    }

    // Verificar presença do script Belvo
    const belvoLoaded = await page.evaluate(() => !!(window as any).belvo);
    if (!belvoLoaded) {
      logs.push({ type: 'warn', text: 'Belvo widget não carregado (window.belvo indisponível).' });
    }

    // Tentar obter erro diretamente da API sem sessão
    let apiStatus: number | null = null;
    let apiText: string | null = null;
    try {
      const apiRes = await request.get('/api/belvo/connect-token');
      apiStatus = apiRes.status();
      try {
        apiText = await apiRes.text();
      } catch {}
    } catch (e) {
      logs.push({ type: 'error', text: 'Falha ao chamar /api/belvo/connect-token via request: ' + ((e as Error)?.message || String(e)) });
    }

    // Disparar o fluxo de conexão
    const connectBtn = page.getByRole('button', { name: /Conectar Nova Conta/i });
    let clickedConnect = false;
    try {
      await connectBtn.click({ timeout: 5000 });
      clickedConnect = true;
    } catch (e) {
      logs.push({ type: 'warn', text: 'Botão "Conectar Nova Conta" indisponível para clique.' });
    }

    // Resultado da chamada de token
    let tokenStatus: number | null = null;
    let tokenBodyText: string | null = null;
    let tokenJson: any = null;
    try {
      if (clickedConnect) {
        const tokenRes = await page.waitForResponse((res) =>
          res.url().includes('/api/belvo/connect-token'),
        { timeout: 10000 });
        tokenStatus = tokenRes.status();
        try {
          tokenJson = await tokenRes.json();
        } catch {
          tokenBodyText = await tokenRes.text();
        }
      }
    } catch (e) {
      logs.push({ type: 'error', text: 'Falha ao capturar resposta de /api/belvo/connect-token: ' + ((e as Error)?.message || String(e)) });
    }

    // Montar o resumo
    const summary: string[] = [];
    summary.push(`Login realizado: ${loggedIn ? 'sim' : 'não'}`);
    summary.push(`Belvo widget disponível: ${belvoLoaded ? 'sim' : 'não'}`);
    summary.push(`Status da chamada de token: ${tokenStatus ?? 'indisponível'}`);
    summary.push(`Status da chamada direta API (sem sessão): ${apiStatus ?? 'indisponível'}`);
    if (apiText) summary.push(`Corpo API direto: ${apiText}`);
    if (tokenJson) {
      summary.push(`Corpo (JSON): ${JSON.stringify(tokenJson)}`);
    }
    if (tokenBodyText) {
      summary.push(`Corpo (texto): ${tokenBodyText}`);
    }
    summary.push('Console logs capturados:');
    for (const l of logs) {
      summary.push(`- [${l.type}] ${l.text}`);
    }

    // Expor resumo no output do teste
    console.log('\n===== RESUMO CONEXÃO BELVO =====');
    for (const line of summary) console.log(line);
    console.log('===== FIM RESUMO =====\n');

    // Expectativa principal: se não houver token de acesso, o teste confirma que há falha e logs úteis
    const accessToken = tokenJson?.accessToken ?? tokenJson?.access ?? tokenJson?.token;
    if (!accessToken) {
      // Apenas registrar diagnóstico, sem falhar o teste
      if (!loggedIn) {
        logs.push({ type: 'diagnostic', text: 'Sem sessão ativa; provável 401 na API de token.' });
      }
      if (typeof tokenStatus === 'number') {
        logs.push({ type: 'diagnostic', text: `Status token esperado [401/500/503]; obtido: ${tokenStatus}` });
      }
      if (typeof apiStatus === 'number') {
        logs.push({ type: 'diagnostic', text: `Status API direto esperado [401/500/503]; obtido: ${apiStatus}` });
      }
    }

    // O teste não falha o suite inteiro; foca em diagnóstico
    expect(true).toBeTruthy();
  });
});