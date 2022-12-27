import Warning from '../../../src/components/Warning.vue';

describe('Warning', () => {
  it('should apply passed props values', () => {
    const propText = 'Warning Text';
    cy.mount(Warning, {
      propsData: { text: propText, align_left: true, animate: true },
    });
    const wrapperSelector = '[data-cy="wrapper"]';
    const textWrapperSelector = '[data-cy="text-wrapper"]';
    cy.get(wrapperSelector)
      .should('be.visible')
      .should('have.class', 'scale-in-center');
    cy.get(textWrapperSelector)
      .should('be.visible')
      .should('have.class', 'text-left')
      .and('have.text', propText);
  });
});
