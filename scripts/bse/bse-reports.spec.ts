/**
 * Script to download specific reports from the BSE (Banco de Seguros del Estado) advisor portal.
 * Logs in with multiple users, navigates to the exportables section, generates reports,
 * and downloads them in .xls format. Verifies success using Playwright's expect() and throws on failure.
 * 
 * Tools: Playwright, dotenv
 * Target site: https://portaldelasesor.bse.com.uy
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

// Fix for __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOWNLOAD_DIR = path.join(__dirname, '..', '..', 'reports', 'bse');

const MAX_ATTEMPTS = 40;
const WAIT_TIME = 15000;

test('Download BSE reports for all users', async ({ browser }) => {
  const reports = [
    {
      label: 'Facturas a vencer próximos 12 días',
      fileName: 'facturas12dias',
    },
    {
      label: 'Pólizas en condiciones de ser rehabilitadas',
      fileName: 'rehabilitadas',
    },
  ];

  const users = [
    { user: process.env.BSE_USER_1, pass: process.env.BSE_PASS_1 },
    { user: process.env.BSE_USER_2, pass: process.env.BSE_PASS_2 },
    { user: process.env.BSE_USER_3, pass: process.env.BSE_PASS_3 },
  ];

  for (const user of users) {
    console.log(`\n🔐 Logging in with user: ${user.user}`);

    const context = await browser.newContext({ acceptDownloads: true });
    const page = await context.newPage();

    await page.goto('https://portaldelasesor.bse.com.uy');
    await page.fill('#userID', user.user || '');
    await page.fill('#password', user.pass || '');
    await page.click('#login\\.button\\.login');
    await page.waitForTimeout(5000);

    // Navigate to Exportables
    await page.waitForSelector('a[title="Escritorio Comercial"]', { timeout: 10000 });
    await page.hover('a[title="Escritorio Comercial"]');
    await page.waitForTimeout(2000);

    await page.waitForSelector(
      'a.subdroplink[href="/wps/myportal/portal-asesor/escritorio-comercial/consultas"]',
      { timeout: 10000 }
    );
    await page.hover(
      'a.subdroplink[href="/wps/myportal/portal-asesor/escritorio-comercial/consultas"]'
    );
    await page.waitForTimeout(2000);

    await page.waitForSelector(
      'a[href="/wps/myportal/portal-asesor/escritorio-comercial/consultas/consulta-exportables"]',
      { timeout: 10000 }
    );
    await page.click(
      'a[href="/wps/myportal/portal-asesor/escritorio-comercial/consultas/consulta-exportables"]'
    );
    await page.waitForTimeout(3000);

    for (const report of reports) {
      console.log(`📄 Processing report: ${report.label}`);

      await page.click('label.ui-selectonemenu-label');
      await page.waitForTimeout(1000);

      console.log(`🔍 Selecting report option: ${report.label}`);
      const reportOption = await page.$(`li[data-label="${report.label}"]`);
      if (!reportOption) {
        console.log(`❌ Could not find option "${report.label}" for user ${user.user}`);
        continue;
      }

      const isVisible = await reportOption.isVisible();
      if (!isVisible) {
        console.log(`❌ Option "${report.label}" is not visible for user ${user.user}`);
        continue;
      }

      await page.waitForTimeout(500);
      await reportOption.click();

      await expect(page.locator('a.btn-boton-principal:text("Generar")')).toBeVisible({ timeout: 5000 });
      await page.click('a.btn-boton-principal:text("Generar")');
      await page.waitForTimeout(2000);

      let downloaded = false;

      for (let i = 0; i < MAX_ATTEMPTS; i++) {
        await page.click('a.btn-boton-principal:text("Buscar")');
        await page.waitForTimeout(2000);

        const statusCell = await page.textContent('tr[data-ri="0"] td:nth-child(3)');
        const status = statusCell?.trim().toLowerCase();
        console.log(`🧾 Report status for ${report.label}: ${status}`);

        if (status === 'error') {
          console.log(`❌ Portal returned "Error" for report: ${report.label} (${user.user})`);
          break;
        }

        const excelIcon = await page.$('tr[data-ri="0"] span.icon-file-excel');
        if (excelIcon) {
          const [download] = await Promise.all([
            page.waitForEvent('download'),
            excelIcon.click(),
          ]);

          const timestamp = new Date()
            .toISOString()
            .replace(/[-:]/g, '')
            .replace('T', '_')
            .slice(0, 15);

          const filePath = path.join(
            DOWNLOAD_DIR,
            `${user.user}_${report.fileName}_${timestamp}.xls`
          );

          await download.saveAs(filePath);
          console.log(`✅ Report downloaded: ${report.label} → ${filePath}`);
          downloaded = true;
          break;
        }

        console.log(`⏳ Attempt ${i + 1}/${MAX_ATTEMPTS} waiting for report to be ready...`);
        await page.waitForTimeout(WAIT_TIME);
      }

      expect(downloaded).toBe(true);
      if (!downloaded) {
        throw new Error(`❌ Report "${report.label}" could not be downloaded for user ${user.user}`);
      }
    }

    await context.close();
    console.log(`🚪 Session closed for user: ${user.user}`);
  }

  console.log('\n🎉 All reports processed.');
});
