describe('Compare locations over time test (e2e)', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('workflow test', () => {
    cy.get('[data-cy=nav-epidemiology]').find('[data-cy=case-deaths]').click();
    cy.get('[data-cy=epidemiology-dropdown]').should('be.visible');
    cy.get('[data-cy=epidemiology-dropdown]').then(($el1) => {
      expect($el1).to.have.length(1);
      cy.get('[data-cy=item-epidemiology]')
        .should('be.visible')
        .and('have.text', ' Compare locations over time ')
        .click();
      cy.get('[data-cy=epi-no-location-title]')
        .should('be.visible')
        .and('have.text', ' Please select a location ');
      cy.get('[data-cy=epi-nearest-location-btn]')
        .should('be.visible')
        .and('have.text', ' Find nearest location ');
      cy.get('[data-cy=autocomplete-input-label]')
        .should('be.visible')
        .and('have.text', ' select locations ');

      cy.get('[data-cy=autocomplete-input]').type('United', { delay: 500 });
      cy.contains('United Kingdom').click();
      cy.wait(8000);

      cy.get('[data-cy=location-item-chip]')
        .should('be.visible')
        .and('have.text', ' United Kingdom ');
      cy.get('[data-cy=location-item-chip-icon]').should('be.visible');

      cy.get('[data-cy=epi-select-cases]').should('be.visible');
      cy.get('[data-cy=epi-location-label]')
        .should('be.visible')
        .and('have.text', ' in United Kingdom ');

      cy.get('[data-cy=normalize-population-checkbox]').check({ force: true });
      cy.wait(5000);

      cy.get('[data-cy=bar-graph-group]').should('be.visible');
    });
  });
});
