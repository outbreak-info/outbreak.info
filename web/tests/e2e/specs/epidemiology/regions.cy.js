describe('Explore regions (e2e test)', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('explore regions workflow test', () => {
    cy.get('[data-cy=nav-epidemiology]').find('[data-cy=case-deaths]').click();
    cy.get('[data-cy=epidemiology-dropdown]').should('be.visible');
    cy.get('[data-cy=epidemiology-dropdown]').then(($el1) => {
      expect($el1).to.have.length(1);
      cy.get('[data-cy=item-regions]')
        .should('be.visible')
        .and('have.text', ' Explore regions ')
        .click();
      cy.wait(1000);
    });
  });
});
