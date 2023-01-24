describe('Access data tables (e2e)', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('access data tables workflow test', () => {
    cy.get('[data-cy=nav-epidemiology]').find('[data-cy=case-deaths]').click();
    cy.get('[data-cy=epidemiology-dropdown]').should('be.visible');
    cy.get('[data-cy=epidemiology-dropdown]').then(($el1) => {
      expect($el1).to.have.length(1);
      cy.get('[data-cy=item-access-datatable]')
        .should('be.visible')
        .and('have.text', ' Access data tables ')
        .click();
      cy.wait(1000);
    });
  });
});
