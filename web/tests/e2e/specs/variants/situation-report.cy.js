describe('situation report test (e2e)', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('situation report workflow', () => {
    cy.get('[data-cy=nav-genomics]').find('[data-cy=variants]').click();
    cy.get('[data-cy=genomics-dropdown]').should('be.visible');
    cy.get('[data-cy=genomics-dropdown]').then(($el2) => {
      expect($el2).to.have.length(1);
      cy.get('[data-cy=item-situation-reports]')
        .should('have.length', 1)
        .and('have.text', ' Lineage | Mutation Tracker ')
        .click();
      cy.wait(2000);
      cy.get('[data-cy=situation-reports-title]')
        .should('be.visible')
        .and('have.text', ' SARS-CoV-2 (hCoV-19) Mutation Reports ');
    });
  });
});
