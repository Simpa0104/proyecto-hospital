import { test, expect } from '@playwright/test';

//15. Prueba de navegacion
test('test', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('link', { name: 'Ir al test' }).click();
    await page.getByRole('textbox').click();
    await page.getByRole('textbox').press('CapsLock');
    await page.getByRole('textbox').fill('P');
    await page.getByRole('textbox').press('CapsLock');
    await page.getByRole('textbox').fill('Prueba ');
    await page.getByRole('textbox').press('CapsLock');
    await page.getByRole('textbox').fill('Prueba P');
    await page.getByRole('textbox').press('CapsLock');
    await page.getByRole('textbox').fill('Prueba Play');
    await page.getByRole('textbox').press('CapsLock');
    await page.getByRole('textbox').fill('Prueba PlayW');
    await page.getByRole('textbox').press('CapsLock');
    await page.getByRole('textbox').fill('Prueba PlayWright');
    await page.getByRole('textbox').press('Tab');
    await page.getByRole('spinbutton').fill('123456789');
    await page.locator('.btn-group > label').first().click();
    await page.locator('div:nth-child(5) > .card-body > .btn-group > label').first().click();
    await page.locator('div:nth-child(6) > .card-body > .btn-group > label').first().click();
    await page.locator('div:nth-child(7) > .card-body > .btn-group > label').first().click();
    await page.locator('div:nth-child(8) > .card-body > .btn-group > label').first().click();
    await page.locator('div:nth-child(9) > .card-body > .btn-group > label').first().click();
    await page.locator('div:nth-child(11) > .card-body > .btn-group > label').first().click();
    await page.locator('div:nth-child(13) > .card-body > .btn-group > label').first().click();
    await page.locator('div:nth-child(14) > .card-body > .btn-group > label').first().click();
    await page.locator('div:nth-child(12) > .card-body > .btn-group > label').first().click();
    await page.locator('div:nth-child(15) > .card-body > .btn-group > label').first().click();
    await page.locator('div:nth-child(16) > .card-body > .btn-group > label').first().click();
    await page.getByRole('button', { name: 'Finalizar Evaluación' }).click();
    await page.getByRole('link', { name: 'Volver al Historial' }).click();
    await page.getByRole('link', { name: 'Inicio' }).click();
    await page.getByRole('link', { name: 'Ir al Historial' }).click();
    await page.locator('div:nth-child(4) > a').first().click();
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Exportar a PDF' }).click();
    const download = await downloadPromise;
    await page.getByRole('link', { name: 'Volver al Historial' }).click();
    page.once('dialog', dialog => {
        console.log(`Dialog message: ${dialog.message()}`);
        dialog.dismiss().catch(() => { });
    });
    await page.locator('div:nth-child(2) > .card > .card-body > div:nth-child(4) > .eliminar-evaluacion-form > .btn').click();
    await page.getByRole('link', { name: 'Inicio' }).click();
});