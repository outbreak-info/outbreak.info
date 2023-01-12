describe('header test (e2e)', () => {
  it('navigation test', () => {
    cy.visit('/');
    cy.get('[data-cy=navigation]').should('be.visible');
    cy.get('[data-cy=nav-link]').then(($el) => {
      expect($el).to.have.length(1);
      const navEpidemiologySelector = cy.get('[data-cy=nav-epidemiology]');
      const navGenomicsSelector = cy.get('[data-cy=nav-genomics]');
      const navResourceSelector = cy.get('[data-cy=nav-resources]');
      const navApiSelector = cy.get('[data-cy=nav-api]');
      const navAboutSelector = cy.get('[data-cy=nav-about]');
      navEpidemiologySelector.should('have.length', 1);
      navGenomicsSelector.should('have.length', 1);
      navResourceSelector.should('have.length', 1);
      navApiSelector.should('have.length', 1);
      navAboutSelector.should('have.length', 1);

      // Epidemiology
      cy.get('[data-cy=nav-epidemiology]')
        .find('[data-cy=case-deaths]')
        .click();
      cy.get('[data-cy=epidemiology-dropdown]').should('be.visible');
      cy.get('[data-cy=epidemiology-dropdown]').then(($el1) => {
        expect($el1).to.have.length(1);
        cy.get('[data-cy=item-epidemiology]')
          .should('have.length', 1)
          .and('have.text', ' Compare locations over time ')
          .and('have.attr', 'href')
          .and('include', '/epidemiology');
        cy.get('[data-cy=item-maps]')
          .should('have.length', 1)
          .and('have.text', ' Explore interactive maps ')
          .and('have.attr', 'href')
          .and('include', '/maps');
        cy.get('[data-cy=item-compare]')
          .should('have.length', 1)
          .and('have.text', ' Find similar locations ')
          .and('have.attr', 'href')
          .and('include', '/compare');
        cy.get('[data-cy=item-regions]')
          .should('have.length', 1)
          .and('have.text', ' Explore regions ')
          .and('have.attr', 'href')
          .and('include', '/regions');
        cy.get('[data-cy=item-access-datatable]')
          .should('have.length', 1)
          .and('have.text', ' Access data tables ')
          .and('have.attr', 'href')
          .and('include', '/data');
      });

      // Genomics
      cy.get('[data-cy=nav-genomics]').find('[data-cy=variants]').click();
      cy.get('[data-cy=genomics-dropdown]').should('be.visible');
      cy.get('[data-cy=genomics-dropdown]').then(($el2) => {
        expect($el2).to.have.length(1);
        cy.get('[data-cy=item-situation-reports]')
          .should('have.length', 1)
          .and('have.text', ' Lineage | Mutation Tracker ')
          .and('have.attr', 'href')
          .and('include', '/situation-reports');
        cy.get('[data-cy=item-location-reports]')
          .should('have.length', 1)
          .and('have.text', ' Location Tracker ')
          .and('have.attr', 'href')
          .and('include', '/location-reports');
        cy.get('[data-cy=item-situation-report-comparison]')
          .should('have.length', 1)
          .and('have.text', ' Lineage Comparison ')
          .and('have.attr', 'href')
          .and('include', '/compare-lineages');
        cy.get('[data-cy=item-interpreting-reports]')
          .should('have.length', 1)
          .and('have.text', ' Interpreting Reports ')
          .and('have.attr', 'href')
          .and('include', '/situation-reports/caveats');
      });

      // Resources
      cy.get('[data-cy=nav-resources]')
        .find('[data-cy=research-library]')
        .click();
      cy.get('[data-cy=resources-dropdown]').should('be.visible');
      cy.get('[data-cy=resources-dropdown]').then(($el3) => {
        expect($el3).to.have.length(1);
        cy.get('[data-cy=item-find-research]')
          .should('have.length', 1)
          .and('have.text', ' Find research ')
          .and('have.attr', 'href')
          .and('include', '/resources');
        cy.get('[data-cy=item-download-metadata]')
          .should('have.length', 1)
          .and('have.text', ' Download metadata ')
          .and('have.attr', 'href')
          .and('include', '/sources#resources');
        cy.get('[data-cy=item-schema]')
          .should('have.length', 1)
          .and('have.text', ' View & adapt schema ')
          .and('have.attr', 'href')
          .and('include', '/schema');
      });

      // API
      cy.get('[data-cy=nav-api]').then(($el4) => {
        expect($el4).to.have.length(1);
        cy.get('[data-cy=item-outbreak-api]')
          .should('have.class', 'nav-link')
          .and('have.text', ' API ')
          .and('have.attr', 'href')
          .and('include', 'api.outbreak.info');
      });

      // About
      cy.get('[data-cy=nav-about]').find('[data-cy=outbreak-about]').click();
      cy.get('[data-cy=about-dropdown]').should('be.visible');
      cy.get('[data-cy=about-dropdown]').then(($el5) => {
        expect($el5).to.have.length(1);

        cy.get('[data-cy=item-about]')
          .should('have.length', 1)
          .and('have.text', ' About ')
          .and('have.attr', 'href')
          .and('include', '/about');

        cy.get('[data-cy=item-data-sources]')
          .should('have.length', 1)
          .and('have.text', ' Data sources ')
          .and('have.attr', 'href')
          .and('include', '/sources');

        cy.get('[data-cy=item-blog]')
          .should('have.length', 1)
          .and('have.text', ' Blog ')
          .and('have.attr', 'href')
          .and('include', 'blog.outbreak.info');

        cy.get('[data-cy=item-faq]')
          .should('have.length', 1)
          .and('have.text', ' FAQ ')
          .and('have.attr', 'href')
          .and('include', '/faq');

        cy.get('[data-cy=item-latest-changes]')
          .should('have.length', 1)
          .and('have.text', ' Latest changes ')
          .and('have.attr', 'href')
          .and('include', '/latest');

        cy.get('[data-cy=item-cite]')
          .should('have.length', 1)
          .and('have.text', ' How to cite ')
          .and('have.attr', 'href')
          .and('include', '/citation');

        cy.get('[data-cy=item-media]')
          .should('have.length', 1)
          .and('have.text', ' In the media ')
          .and('have.attr', 'href')
          .and('include', '/press');
      });
    });
  });

  it('notice section test', () => {
    cy.visit('/');
    cy.get('[data-cy=notice-section]')
      .should('be.visible')
      .contains(
        'Access all SARS-CoV-2 variant data, Research Library metadata',
      );
    cy.get('[data-cy=notice-text]').then(($el) => {
      expect($el.text()).to.contain('The outbreak.info');
      expect($el.text()).to.contain('is now live!');
      cy.get('[data-cy=outbreak-api]')
        .should('have.class', 'text-light')
        .and('have.attr', 'href')
        .and('include', 'api.outbreak.info');
      cy.get('[data-cy=r-package]')
        .should('have.class', 'text-light')
        .and('have.attr', 'href')
        .and('include', 'outbreak-info.github.io/R-outbreak-info');
    });
  });
});
