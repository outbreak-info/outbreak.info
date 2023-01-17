describe('Home page test', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should open home page', () => {
    const homepageText =
      ' an open-source database of SARS-CoV-2 variant data, COVID-19 epidemiology data, and published research ';
    cy.get('[data-cy=home-page-title]').should('have.text', homepageText);
    cy.get('[data-cy=home-page-logo]').should('be.visible');
  });

  it('search bar section should be displayed', () => {
    cy.get('[data-cy=search-epidemiology]')
      .should('be.visible')
      .and('have.attr', 'href')
      .and('include', '/epidemiology');
    cy.get('[data-cy=search-epi-title]')
      .should('be.visible')
      .and('have.text', ' COVID-19 Cases & Deaths ');
    cy.get('[data-cy=search-epi-description]')
      .should('be.visible')
      .and(
        'have.text',
        ' View COVID-19 trends by region, country, state/province, U.S. metropolitan area, or U.S. county ',
      );
  });
});
