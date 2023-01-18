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

    cy.get('[data-cy=search-variant]')
      .should('be.visible')
      .and('have.attr', 'href')
      .and('include', '/situation-reports');
    cy.get('[data-cy=search-variant-title]')
      .should('be.visible')
      .and('have.text', 'Variants');
    cy.get('[data-cy=search-variant-description]')
      .should('be.visible')
      .and(
        'have.text',
        ' Explore SARS-CoV-2 lineage, variant, and mutation situation reports ',
      );

    cy.get('[data-cy=search-resources]')
      .should('be.visible')
      .and('have.attr', 'href')
      .and('include', '/resources');
    cy.get('[data-cy=search-resources-title]')
      .should('be.visible')
      .and('have.text', ' Research Library ');
    cy.get('[data-cy=search-resources-description]')
      .should('be.visible')
      .and(
        'have.text',
        ' Find COVID-19 and SARS-CoV-2 publications, clinical trials, datasets, protocols, and more ',
      );
  });

  it('should open covid-19 trend chart by typing location in searchbar', () => {
    cy.get('[data-cy=search-bar]')
      .should('be.visible')
      .and('have.class', 'form-control');
    cy.get('[data-cy=search-bar]').type('California', { delay: 1000 });
    cy.get('[data-cy=search-bar-dropdown]').should('be.visible');
    cy.get('[data-cy=search-bar-dropdown]')
      .eq(0)
      .invoke('val')
      .then((val) => {
        cy.get('[data-cy=search-options]')
          .contains('California')
          .then(($el) => {
            $el.click();
          });
      });
  });

  it('it should open covid chart page by clicking hint location', () => {
    cy.get('[data-cy=epi-california]')
      .should('be.visible')
      .and('have.text', ' California ')
      .click();
    cy.url().should('include', '/epidemiology?location=USA_US-CA');
  });
});
