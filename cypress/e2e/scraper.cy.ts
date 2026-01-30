const pipState = {
    rows: 0,
    cols: 0
};

describe('scraper', () => {
    it('scraping pip data', () => {
        cy.visit('https://www.nytimes.com/games/pips');

        cy.get('[data-testid="play-button"]').click();
        cy.get('[data-testid="modal-close"]').click();

        cy.get('[class="Board-module_boardContainer__xtRPE"]').then($el => {
          // Using board container element styling to obtain dimensions
          const style = window.getComputedStyle($el[0]);
          const rows = style.getPropertyValue('--rows');
          const cols = style.getPropertyValue('--cols');

          pipState.rows = parseInt(rows);
          pipState.cols = parseInt(cols);
        });
    });
});