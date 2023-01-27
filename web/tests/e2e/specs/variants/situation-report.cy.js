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
      cy.get('[data-cy=situation-reports-text]')
        .should('be.visible')
        .and('have.text', ' SARS-CoV-2 (hCoV-19) Mutation Reports ');
      cy.get('[data-cy=situation-reports-page-title]')
        .should('be.visible')
        .and('have.class', 'mutation-header')
        .and('include.text', 'Mutation Tracker');

      // There should be custom reports category
      cy.get('[data-cy=custom-report-voc]')
        .should('be.visible')
        .and('include.text', 'Variants of Concern');
      cy.get('[data-cy=custom-report-voi]')
        .should('be.visible')
        .and('include.text', 'Variants of Interest');
      cy.get('[data-cy=custom-report-previous-voc]')
        .should('be.visible')
        .and('include.text', 'Previous Variants of Concern');
      cy.get('[data-cy=custom-report-de-escalated]')
        .should('be.visible')
        .and('include.text', 'De-escalated Variants');
      cy.get('[data-cy=custom-report-moc]')
        .should('be.visible')
        .and('include.text', 'Mutations of Concern');
      cy.get('[data-cy=custom-report-moi]')
        .should('be.visible')
        .and('include.text', 'Mutations of Interest');

      // Select my own lineage and/or mutation(s) toggle button
      cy.get('[data-cy=custom-report-collapse]')
        .should('be.visible')
        .and('include.text', 'Select my own lineage and/or mutation(s)')
        .click();
      cy.get('[data-cy=custom-report-collapse-panel]').should('be.visible');

      cy.get('[data-cy=variant-form-1]')
        .should('be.visible')
        .and('include.text', 'Choose variant type');
      cy.get('#pango').check({ force: true });
      cy.get('[data-cy=selected-type]')
        .should('be.visible')
        .and('include.text', '2  Select PANGO lineage');
      cy.get('[data-cy=type-head-select-input]')
        .should('be.visible')
        .type('BA', { delay: 500 });
      cy.get('[data-cy=type-head-select-dropdown]').should('be.visible');
      cy.get('[data-cy=type-head-select-dropdown]')
        .eq(0)
        .invoke('val')
        .then((val) => {
          cy.get('[data-cy=type-head-select-dropdown-item]')
            .contains('BA.2')
            .click();
        });
      cy.get('[data-cy=selected-lineage]')
        .should('be.visible')
        .and('include.text', 'Add BA.2 lineage');
    });
  });
});
