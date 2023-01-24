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

  it('it should open covid chart by clicking hint locations', () => {
    cy.get('[data-cy=epi-california]')
      .should('be.visible')
      .and('have.text', ' California ')
      .click();
    cy.url().should('include', '/epidemiology?location=USA_US-CA');
    cy.wait(5000);
    cy.go(-1);
    cy.get('[data-cy=epi-brazil]')
      .should('be.visible')
      .and('have.text', ' Brazil ')
      .click();
    cy.url().should('include', '/epidemiology?location=BRA');
    cy.wait(5000);
    cy.go(-1);
    cy.get('[data-cy=epi-kansas]')
      .should('be.visible')
      .and('have.text', ' Kansas City metro area ')
      .click();
    cy.url().should('include', '/epidemiology?location=USA_US-KS-28140');
    cy.wait(5000);
    cy.go(-1);
    cy.get('[data-cy=genomics-us]')
      .should('be.visible')
      .and('have.text', ' USA ')
      .click();
    cy.url().should('include', '/location-reports?loc=USA');
  });

  it('toggle button: What can I do with outbreak.info and next buttons', () => {
    cy.get('[data-cy=toggle-summary-btn]')
      .should('be.visible')
      .and('have.text', ' What can I do with outbreak.info? ')
      .click();
    cy.get('[data-cy=summary-title]')
      .should('be.visible')
      .and('have.text', ' What can I do with outbreak.info? ');
    cy.get('[data-cy=btn-sources]')
      .should('be.visible')
      .and('have.attr', 'href')
      .and('include', '/sources');
    cy.get('[data-cy=btn-sources-text]')
      .should('be.visible')
      .and('have.text', ' Where do we get our data? ')
      .click();
    cy.url().should('include', '/sources');
    cy.wait(3000);
    cy.go(-1);
    cy.get('[data-cy=btn-latest]')
      .should('be.visible')
      .and('have.attr', 'href')
      .and('include', '/latest');
    cy.get('[data-cy=btn-latest-text]')
      .should('be.visible')
      .and('have.text', " What's new at outbreak.info? ")
      .click();
    cy.url().should('include', '/latest');
    cy.wait(3000);
    cy.go(-1);
    cy.get('[data-cy=btn-about-job]')
      .should('be.visible')
      .and('have.attr', 'href')
      .and('include', '/about#jobs');
    cy.get('[data-cy=btn-job-text]')
      .should('be.visible')
      .and('have.text', " We're hiring! ")
      .click();
    cy.url().should('include', '/about#jobs');
    cy.wait(3000);
    cy.go(-1);
  });
});
