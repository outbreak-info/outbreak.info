describe('Explore interactive maps (e2e)', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('interactive map workflow test', () => {
    cy.get('[data-cy=nav-epidemiology]').find('[data-cy=case-deaths]').click();
    cy.get('[data-cy=epidemiology-dropdown]').should('be.visible');
    cy.get('[data-cy=epidemiology-dropdown]').then(($el1) => {
      expect($el1).to.have.length(1);
      cy.get('[data-cy=item-maps]')
        .should('be.visible')
        .and('have.text', ' Explore interactive maps ')
        .click();
      cy.wait(1000);
      cy.get('[data-cy=map-all-country-btn]').should('be.visible');
      cy.get('[data-cy=map-us-states-btn]').should('be.visible');
      cy.get('[data-cy=map-us-metro-btn]').should('be.visible');
      cy.get('[data-cy=map-us-counties-btn]').should('be.visible');

      // test select variable dropdown
      cy.get('[data-cy=select-variable-dropdown]')
        .should('be.visible')
        .select('total cases per capita')
        .invoke('text')
        .should('include', 'total cases per capita');
    });
  });
});
