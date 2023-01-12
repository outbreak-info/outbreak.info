describe('Home page test', () => {
  it('should open home page', () => {
    cy.visit('/');
    const homepageText =
      ' an open-source database of SARS-CoV-2 variant data, COVID-19 epidemiology data, and published research ';
    cy.get('[data-cy=home-page-title]').should('have.text', homepageText);
    cy.get('[data-cy=home-page-logo]').should('be.visible');
  });
});
