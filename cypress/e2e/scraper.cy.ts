interface PipState {
    rows: number,
    cols: number,
    droppableCells: boolean[]
    cellRelations: string[]
};

const pipState: PipState = {
    rows: 0,
    cols: 0,
    droppableCells: [],
    cellRelations: []
};

const COLOR_PATTERNS = [/purple/, /pink/, /orange/, /teal/];
const COLORS = ['PURPLE', 'PINK', 'ORANGE', 'TEAL'];

describe('scraper', () => {
    it('scrapes pips game data', () => {
        cy.visit('https://www.nytimes.com/games/pips');

        cy.get('[data-testid="play-button"]').click();
        cy.get('[data-testid="modal-close"]').click();

        // Using board container element styling to obtain dimensions
        cy.get('[class^="Board-module_boardContainer_"]').then($el => {
            const style = window.getComputedStyle($el[0]);
            const rows = style.getPropertyValue('--rows');
            const cols = style.getPropertyValue('--cols');

            pipState.rows = parseInt(rows);
            pipState.cols = parseInt(cols);
        });

        // Determining the droppable cells on the board
        cy.get('[class^="Board-module_droppable_"]')
            .children()
            .each(($el) => {
                const classes = [...$el[0].classList];

                if (classes.includes("Board-module_hidden__DkSxz")) {
                    pipState.droppableCells.push(false);
                } else {
                    pipState.droppableCells.push(true); 
                }
            });

        // Determining the relationships of cells
        cy.get('[class^="Board-module_regions_"]')
            .children()
            .each(($el) => {
                if ($el.children().length == 0) {
                    pipState.cellRelations.push('NONE');
                } else if ($el.children().length == 1) {
                    const child = $el.children()[0];
                    const classes = [...child.classList];
                    
                    for (let i = 0; i < COLOR_PATTERNS.length; i++) {
                        if (classes.some(item => COLOR_PATTERNS[i].test(item))) {
                            pipState.cellRelations.push(COLORS[i]); 
                            break;
                        }
                    }
                } else {
                    let pipStateText = "";
                    const child1 = $el.children()[0];
                    const classes = [...child1.classList];

                    for (let i = 0; i < COLOR_PATTERNS.length; i++) {
                        if (classes.some(item => COLOR_PATTERNS[i].test(item))) {
                            pipStateText += COLORS[i];
                            break;
                        }
                    }

                    const child2 = $el.children()[1];
                    const granchild = child2.children[0];
                    pipStateText += "_" + granchild.textContent;

                    pipState.cellRelations.push(pipStateText);  
                }
            });
    });
});