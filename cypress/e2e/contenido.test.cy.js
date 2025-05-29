describe('Pruebas de contenido en vistas EJS', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Verifica contenido en la página de Inicio', () => {
    cy.contains('Bienvenidos').should('exist');
    cy.get('a[href="/Cuestionario_Riesgos"]').should('exist');
    cy.get('a[href="/Historial"]').should('exist');
    cy.get('img[src="/imagenes/Logo.png"]').should('exist');
  });

  it('Verifica contenido en el formulario de evaluación', () => {
    cy.visit('/Cuestionario_Riesgos');
    cy.contains('Detección de Riesgo - Nivel 1 y 2').should('exist');
    cy.get('input[name="nombre"]').should('exist');
    cy.get('input[name="episodio"]').should('exist');
    cy.get('form#testForm').should('exist');
    cy.get('input[type="radio"]').should('have.length.at.least', 24);
    cy.get('button[type="submit"]').contains('Finalizar Evaluación').should('exist');
  });

  it('Verifica contenido en la página de historial sin filtros', () => {
    cy.visit('/Historial');
    cy.contains('Historial de Evaluaciones').should('exist');
    cy.get('form').should('exist');
    cy.get('input[name="nombre"]').should('exist');
    cy.get('input[name="episodio"]').should('exist');
    cy.get('select[name="categoria"]').should('exist');
  });

  it('Carga detalles de una evaluación existente (requiere ID válido)', () => {
    const idEvaluacion = 10;
    cy.visit(`/Detalles_Evaluacion/${idEvaluacion}`);
    cy.contains('Detalles de la Evaluación').should('exist');
    cy.get('table').should('exist');
    cy.contains('Psicológico').should('exist');
    cy.contains('Biológico').should('exist');
    cy.contains('Social').should('exist');
    cy.get('#btnExportarPDF').should('exist');
  });

  it('Muestra correctamente la página de error personalizada', () => {
    cy.visit('/ruta-inexistente', { failOnStatusCode: false });
    cy.contains('Página no encontrada').should('exist');
    cy.get('a[href="/"]').should('contain', 'Volver al inicio');
  });
});
