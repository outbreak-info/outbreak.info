describe('Find similar locations (e2e)', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('find similar locations workflow test', () => {
    cy.get('[data-cy=nav-epidemiology]').find('[data-cy=case-deaths]').click();
    cy.get('[data-cy=epidemiology-dropdown]').should('be.visible');
    cy.get('[data-cy=epidemiology-dropdown]').then(($el1) => {
      expect($el1).to.have.length(1);
      cy.get('[data-cy=item-compare]')
        .should('be.visible')
        .and('have.text', ' Find similar locations ')
        .click();
      cy.wait(1000);
    });
  });
});
