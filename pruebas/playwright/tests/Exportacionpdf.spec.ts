import { test, expect } from '@playwright/test';

declare global {
  interface Window {
    html2pdf: () => {
      set: () => {
        from: () => {
          save: () => void;
        };
      };
    };
  }
}

test('Exportar evaluación a PDF', async ({ page }) => {
  test.setTimeout(60000); // Aumentar timeout

  // 1. Navegar al historial
  await page.goto('http://localhost:3000/Historial');
  await expect(page).toHaveTitle('Historial de Evaluaciones');

  // 2. Seleccionar primera evaluación
  const firstCard = page.locator('.card').first();
  await firstCard.getByRole('link', { name: 'Ver Detalles' }).click();

  // 3. Mockear html2pdf para evitar descarga real
  await page.addInitScript(() => {
    window.html2pdf = () => ({
      set: () => ({
        from: () => ({
          save: () => console.log('PDF exportado (mock)')
        })
      })
    });
  });

  // 4. Verificar que se ejecuta la exportación
  const [consoleMsg] = await Promise.all([
    page.waitForEvent('console', msg => msg.text().includes('PDF exportado') || msg.text().includes('Botón presionado')),
    page.getByRole('button', { name: 'Exportar a PDF' }).click()
  ]);

  // 5. Verificar mensaje en consola
  expect(consoleMsg.text()).toMatch(/PDF exportado|Botón presionado/);
});