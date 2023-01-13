describe('test footer flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('there should be footer navigation items', () => {
    cy.get('[data-cy=footer]')
      .should('be.visible')
      .and('have.class', 'bg-main__darker')
      .and('have.id', 'footer-sitemap');

    // section epidemiology
    cy.get('[data-cy=footer-section-epi]')
      .should('be.visible')
      .and('have.class', 'footer-section');
    cy.get('[data-cy=epi-title]')
      .should('be.visible')
      .and('have.class', 'navbar-footer-title')
      .and('have.text', ' COVID-19 Cases & Deaths ');
    cy.get('[data-cy=footer-nav-epi]')
      .should('be.visible')
      .and('have.class', 'navbar-nav');

    cy.get('[data-cy=epi-group-epidemiology]')
      .should('be.visible')
      .and('have.class', 'nav-item');
    cy.get('[data-cy=footer-item-epidemiology]')
      .should('be.visible')
      .and('have.class', 'nav-link')
      .and('have.text', ' Compare locations over time ')
      .and('have.attr', 'href')
      .and('include', '/epidemiology');

    cy.get('[data-cy=epi-group-maps]')
      .should('be.visible')
      .and('have.class', 'nav-item');
    cy.get('[data-cy=footer-item-maps]')
      .should('be.visible')
      .and('have.class', 'nav-link')
      .and('have.text', ' Explore interactive maps ')
      .and('have.attr', 'href')
      .and('include', '/maps');

    cy.get('[data-cy=epi-group-compare]')
      .should('be.visible')
      .and('have.class', 'nav-item');
    cy.get('[data-cy=footer-item-compare]')
      .should('be.visible')
      .and('have.class', 'nav-link')
      .and('have.text', ' Find similar locations ')
      .and('have.attr', 'href')
      .and('include', '/compare');

    cy.get('[data-cy=epi-group-regions]')
      .should('be.visible')
      .and('have.class', 'nav-item');
    cy.get('[data-cy=footer-item-regions]')
      .should('be.visible')
      .and('have.class', 'nav-link')
      .and('have.text', ' Explore regions ')
      .and('have.attr', 'href')
      .and('include', '/regions');

    cy.get('[data-cy=epi-group-datatable]')
      .should('be.visible')
      .and('have.class', 'nav-item');
    cy.get('[data-cy=footer-item-datatable]')
      .should('be.visible')
      .and('have.class', 'nav-link')
      .and('have.text', ' Access data tables ')
      .and('have.attr', 'href')
      .and('include', '/data');

    // section genomics
    cy.get('[data-cy=footer-section-genomics]')
      .should('be.visible')
      .and('have.class', 'footer-section');
    cy.get('[data-cy=genomics-title]')
      .should('be.visible')
      .and('have.class', 'navbar-footer-title')
      .and('have.text', ' Variants ');
    cy.get('[data-cy=footer-nav-genomics]')
      .should('be.visible')
      .and('have.class', 'navbar-nav');

    cy.get('[data-cy=genomics-group-situation-reports]')
      .should('be.visible')
      .and('have.class', 'nav-item');
    cy.get('[data-cy=footer-item-situation-reports]')
      .should('be.visible')
      .and('have.class', 'nav-link')
      .and('have.text', ' Lineage | Mutation Tracker ')
      .and('have.attr', 'href')
      .and('include', '/situation-reports');

    cy.get('[data-cy=genomics-group-location-reports]')
      .should('be.visible')
      .and('have.class', 'nav-item');
    cy.get('[data-cy=footer-item-location-reports]')
      .should('be.visible')
      .and('have.class', 'nav-link')
      .and('have.text', ' Location Tracker ')
      .and('have.attr', 'href')
      .and('include', '/location-reports');

    cy.get('[data-cy=genomics-group-lineage-compare]')
      .should('be.visible')
      .and('have.class', 'nav-item');
    cy.get('[data-cy=footer-item-lineage-comparison]')
      .should('be.visible')
      .and('have.class', 'nav-link')
      .and('have.text', ' Lineage Comparison ')
      .and('have.attr', 'href')
      .and('include', '/compare-lineages');

    cy.get('[data-cy=genomics-group-interpreting-reports]')
      .should('be.visible')
      .and('have.class', 'nav-item');
    cy.get('[data-cy=footer-item-interpreting-reports]')
      .should('be.visible')
      .and('have.class', 'nav-link')
      .and('have.text', ' Interpreting Reports ')
      .and('have.attr', 'href')
      .and('include', '/situation-reports/caveats');

    // section resources
    cy.get('[data-cy=footer-section-resources]')
      .should('be.visible')
      .and('have.class', 'footer-section');
    cy.get('[data-cy=resources-title]')
      .should('be.visible')
      .and('have.class', 'navbar-footer-title')
      .and('have.text', ' Research Library ');
    cy.get('[data-cy=footer-nav-resources]')
      .should('be.visible')
      .and('have.class', 'navbar-nav');

    cy.get('[data-cy=resources-group-find-research]')
      .should('be.visible')
      .and('have.class', 'nav-item');
    cy.get('[data-cy=footer-item-find-research]')
      .should('be.visible')
      .and('have.class', 'nav-link')
      .and('have.text', ' Find research ')
      .and('have.attr', 'href')
      .and('include', '/resources');

    cy.get('[data-cy=resources-group-download-metadata]')
      .should('be.visible')
      .and('have.class', 'nav-item');
    cy.get('[data-cy=footer-item-download-metadata]')
      .should('be.visible')
      .and('have.class', 'nav-link')
      .and('have.text', ' Download metadata ')
      .and('have.attr', 'href')
      .and('include', '/sources#resources');

    cy.get('[data-cy=resources-group-schema]')
      .should('be.visible')
      .and('have.class', 'nav-item');
    cy.get('[data-cy=footer-item-schema]')
      .should('be.visible')
      .and('have.class', 'nav-link')
      .and('have.text', ' View & adapt schema ')
      .and('have.attr', 'href')
      .and('include', '/schema');

    // section about
    cy.get('[data-cy=footer-section-about]')
      .should('be.visible')
      .and('have.class', 'footer-section');
    cy.get('[data-cy=about-title]')
      .should('be.visible')
      .and('have.class', 'navbar-footer-title')
      .and('have.text', 'About');
    cy.get('[data-cy=footer-nav-about]')
      .should('be.visible')
      .and('have.class', 'navbar-nav');

    cy.get('[data-cy=about-group-about-us]')
      .should('be.visible')
      .and('have.class', 'nav-item');
    cy.get('[data-cy=footer-item-about-us]')
      .should('be.visible')
      .and('have.class', 'nav-link')
      .and('have.text', ' About us ')
      .and('have.attr', 'href')
      .and('include', '/about');

    cy.get('[data-cy=about-group-data-sources]')
      .should('be.visible')
      .and('have.class', 'nav-item');
    cy.get('[data-cy=footer-item-data-sources]')
      .should('be.visible')
      .and('have.class', 'nav-link')
      .and('have.text', ' Data sources ')
      .and('have.attr', 'href')
      .and('include', '/sources');

    cy.get('[data-cy=about-group-blog')
      .should('be.visible')
      .and('have.class', 'nav-item');
    cy.get('[data-cy=footer-item-blog]')
      .should('be.visible')
      .and('have.class', 'nav-link')
      .and('have.text', ' Blog ')
      .and('have.attr', 'href')
      .and('include', 'blog.outbreak.info');

    cy.get('[data-cy=about-group-faq]')
      .should('be.visible')
      .and('have.class', 'nav-item');
    cy.get('[data-cy=footer-item-faq]')
      .should('be.visible')
      .and('have.class', 'nav-link')
      .and('have.text', ' FAQ ')
      .and('have.attr', 'href')
      .and('include', '/faq');

    cy.get('[data-cy=about-group-latest-changes]')
      .should('be.visible')
      .and('have.class', 'nav-item');
    cy.get('[data-cy=footer-item-latest-changes]')
      .should('be.visible')
      .and('have.class', 'nav-link')
      .and('have.text', ' Latest changes ')
      .and('have.attr', 'href')
      .and('include', '/latest');

    cy.get('[data-cy=about-group-cite]')
      .should('be.visible')
      .and('have.class', 'nav-item');
    cy.get('[data-cy=footer-item-cite]')
      .should('be.visible')
      .and('have.class', 'nav-link')
      .and('have.text', ' How to cite ')
      .and('have.attr', 'href')
      .and('include', '/citation');

    cy.get('[data-cy=about-group-media]')
      .should('be.visible')
      .and('have.class', 'nav-item');
    cy.get('[data-cy=footer-item-media]')
      .should('be.visible')
      .and('have.class', 'nav-link')
      .and('have.text', ' In the media ')
      .and('have.attr', 'href')
      .and('include', '/press');
  });

  it('footer contact us test', () => {
    // section contact us
    cy.get('[data-cy=footer-section-contact-us]')
      .should('be.visible')
      .and('have.class', 'footer-section');
    cy.get('[data-cy=contact-us-title]')
      .should('be.visible')
      .and('have.class', 'navbar-footer-title')
      .and('have.text', ' Contact us ');
    cy.get('[data-cy=footer-nav-contact-us]')
      .should('be.visible')
      .and('have.class', 'navbar-nav');

    cy.get('[data-cy=contact-us-help]')
      .should('be.visible')
      .and('have.class', 'nav-item');
    cy.get('[data-cy=item-help-link]')
      .should('be.visible')
      .and('have.class', 'nav-link')
      .and('have.text', ' help@outbreak.info ')
      .and('have.attr', 'href')
      .and('include', 'help@outbreak.info');

    cy.get('[data-cy=contact-us-submit-issue]')
      .should('be.visible')
      .and('have.class', 'nav-item');
    cy.get('[data-cy=item-submit-issue-github]')
      .should('be.visible')
      .and('have.class', 'nav-link')
      .and('have.text', ' Submit an issue on Github ')
      .and('have.attr', 'href')
      .and('include', 'github.com/outbreak-info/outbreak.info/issues');

    //TODO: email subscription test
    cy.get('[data-cy=email-subscription]').should('be.visible');
  });

  it('footer logos test', () => {
    // footer logos
    cy.get('[data-cy=footer-logos]').should('be.visible');
    cy.get('[data-cy=footer-logo-sulab]')
      .should('be.visible')
      .and('have.attr', 'href')
      .and('include', 'http://sulab.org/');
    cy.get('[data-cy=sulab-image]')
      .should('be.visible')
      .and('have.attr', 'src');
    cy.get('[data-cy=footer-logo-wulab]')
      .should('be.visible')
      .and('have.attr', 'href')
      .and('include', 'http://wulab.io/');
    cy.get('[data-cy=wulab-image]')
      .should('be.visible')
      .and('have.attr', 'src');
    cy.get('[data-cy=footer-logo-andersen-lab]')
      .should('be.visible')
      .and('have.attr', 'href')
      .and('include', 'https://andersen-lab.com/');
    cy.get('[data-cy=andersen-lab-image]')
      .should('be.visible')
      .and('have.attr', 'src');
    cy.get('[data-cy=footer-logo-scripps]')
      .should('be.visible')
      .and('have.attr', 'href')
      .and('include', 'https://www.scripps.edu/');
    cy.get('[data-cy=scripps-image]')
      .should('be.visible')
      .and('have.attr', 'src');
    cy.get('[data-cy=footer-logo-cvisb]')
      .should('be.visible')
      .and('have.attr', 'href')
      .and('include', 'https://cvisb.org/');
    cy.get('[data-cy=cvisb-image]')
      .should('be.visible')
      .and('have.attr', 'src');
    cy.get('[data-cy=footer-logo-global-health]')
      .should('be.visible')
      .and('have.attr', 'href')
      .and('include', 'https://globalhealth.scripps.edu/');
    cy.get('[data-cy=global-health-image]')
      .should('be.visible')
      .and('have.attr', 'src');
    cy.get('[data-cy=footer-logo-searchcovid]')
      .should('be.visible')
      .and('have.attr', 'href')
      .and('include', 'https://searchcovid.info/');
    cy.get('[data-cy=searchcovid-image]')
      .should('be.visible')
      .and('have.attr', 'src');
    cy.get('[data-cy=footer-logo-niaid]')
      .should('be.visible')
      .and('have.attr', 'href')
      .and('include', 'https://www.niaid.nih.gov/');
    cy.get('[data-cy=niaid-image]')
      .should('be.visible')
      .and('have.attr', 'src');
    cy.get('[data-cy=footer-logo-cd2h]')
      .should('be.visible')
      .and('have.attr', 'href')
      .and('include', 'https://ctsa.ncats.nih.gov/cd2h/');
    cy.get('[data-cy=cd2h-image]').should('be.visible').and('have.attr', 'src');
  });

  it('footer terms test', () => {
    // bottom of footer; terms
    cy.get('[data-cy=bottom-item-cite]')
      .should('be.visible')
      .and('have.attr', 'href')
      .and('include', '/citation');
    cy.get('[data-cy=bottom-item-github]')
      .should('be.visible')
      .and('have.attr', 'href')
      .and('include', 'https://github.com/outbreak-info');
    cy.get('[data-cy=bottom-item-privacy]')
      .should('be.visible')
      .and('have.text', ' Privacy Policy ')
      .and('have.attr', 'href')
      .and('include', '/privacy');
    cy.get('[data-cy=bottom-item-terms]')
      .should('be.visible')
      .and('have.text', ' Terms ')
      .and('have.attr', 'href')
      .and('include', '/terms');
  });
});
