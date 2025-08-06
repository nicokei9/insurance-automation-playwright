/**
 * Script for extracting debtor policy data from the Porto Seguro web portal.
 * It logs in with three different users (stored in .env), navigates to the "Deudores" section,
 * filters by several delay categories, scrapes policy table data and saves the result in a local JSON file.
 * 
 * Tools: Playwright, dotenv, fs/promises
 * Target site: https://servicios.portoseguro.com.uy/OficinaVirtual/Paginas/frmlogin.aspx
 */

import { test, expect } from '@playwright/test';
import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Extract debtor data from Porto Seguro for all users', async ({ browser }) => {
  const users = [
    { envVarName: 'PORTO_USER_1', user: process.env.PORTO_USER_1, pass: process.env.PORTO_PASS_1 },
    { envVarName: 'PORTO_USER_2', user: process.env.PORTO_USER_2, pass: process.env.PORTO_PASS_2 },
    { envVarName: 'PORTO_USER_3', user: process.env.PORTO_USER_3, pass: process.env.PORTO_PASS_3 }
  ];

  const filters = [
    'Anuladas por falta de pago',
    'Más de 90 días',
    '61 a 90 días',
    '31 a 60 días',
    '21 a 30 días',
    '5 a 20 días'
  ];

  const allResults: {
    usuario: string;
    filtro: string;
    poliza: string;
    nombre: string;
    moneda: string;
    importe: string;
    cuotas: string;
    ceseCobertura: string;
    producto: string;
  }[] = [];

  for (const cred of users) {
    console.log(`\n🔐 Logging in with ${cred.user} (${cred.envVarName})...`);

    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('https://servicios.portoseguro.com.uy/OficinaVirtual/Paginas/frmlogin.aspx');
    await page.fill('#LoginControl_UserName', cred.user || '');
    await page.fill('#LoginControl_Password', cred.pass || '');
    await page.click('#LoginControl_btoLogin');

    await expect(page).not.toHaveURL(/frmlogin/);
    await page.hover('text=Consultas');
    await page.click('text=Deudores');
    await page.selectOption('#cboRamo', { label: 'Todos' });

    for (const currentFilter of filters) {
      console.log(`\n🔄 User: ${cred.user} - Filter: ${currentFilter}`);

      await page.selectOption('#cboAtraso', { label: currentFilter });
      await page.click('#Button1');
      await page.waitForTimeout(5000);

      const table = await page.$('#gridDeudores');
      const firstTd = table ? await table.$('td') : null;
      const text = firstTd ? (await firstTd.textContent())?.trim() : '';

      if (!table || text?.includes('No tiene deudores que cumplan esas condiciones')) {
        console.log('🔍 No debtors found for this condition');
        continue;
      }

      const rows = await page.$$('#gridDeudores tbody tr');

      for (const row of rows) {
        const cells = await row.$$('td');
        if (cells.length >= 11) {
          const poliza = await cells[0].textContent();
          const nombre = await cells[3].textContent();
          const moneda = await cells[5].textContent();
          const importe = await cells[6].textContent();
          const cuotas = await cells[7].textContent();
          const cese = await cells[9].textContent();
          const producto = await cells[10].textContent();

          allResults.push({
            usuario: cred.user || '',
            filtro: currentFilter,
            poliza: poliza?.trim() || '',
            nombre: nombre?.trim() || '',
            moneda: moneda?.trim() || '',
            importe: importe?.trim() || '',
            cuotas: cuotas?.trim() || '',
            ceseCobertura: cese?.trim() || '',
            producto: producto?.trim() || ''
          });
        }
      }

      console.log(`✅ Finished filter "${currentFilter}" for user ${cred.user}`);
    }

    await context.close();
  }

  const filename = path.join(__dirname, '..', '..', 'reports', 'porto', 'porto-output.json');
  await fs.writeFile(filename, JSON.stringify(allResults, null, 2), 'utf-8');
  console.log(`\n💾 All data saved to ${filename}`);
});