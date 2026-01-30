interface PipState {
    rows: number,
    cols: number,
    droppableCells: number[]
};

const pipState: PipState = {
    rows: 0,
    cols: 0,
    droppableCells: []
};

describe('scraper', () => {
    it('scraping pip data', () => {
        cy.visit('https://www.nytimes.com/games/pips');

        cy.get('[data-testid="play-button"]').click();
        cy.get('[data-testid="modal-close"]').click();

        // Using board container element styling to obtain dimensions
        cy.get('[class^="Board-module_boardContainer"]').then($el => {
            const style = window.getComputedStyle($el[0]);
            const rows = style.getPropertyValue('--rows');
            const cols = style.getPropertyValue('--cols');

            pipState.rows = parseInt(rows);
            pipState.cols = parseInt(cols);
        });

        // Determining the droppable cells on the board
        cy.get('[class^="Board-module_droppable"]')
            .children()
            .each(($el) => {
                const classes = [...$el[0].classList];

                if (classes.includes("Board-module_hidden__DkSxz")) {
                    pipState.droppableCells.push(0);
                } else {
                    pipState.droppableCells.push(1); 
                }
            });
    });
});