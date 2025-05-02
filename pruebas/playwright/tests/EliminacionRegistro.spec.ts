import { test, expect } from '@playwright/test';

test('Eliminacion de registro', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Ir al Historial' }).click();
  await page.locator('div:nth-child(4) > a').first().click();
  await page.getByRole('link', { name: 'Volver al Historial' }).click();
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => { });
  });
  await page.locator('.eliminar-evaluacion-form > .btn').first().click();
  await page.getByRole('link', { name: 'Inicio' }).click();
});