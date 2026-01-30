interface PipState {
    rows: number,
    cols: number,
    droppableCells: boolean[]
    cellRelations: string[]
};

function getCellColor(elem: JQuery<HTMLElement>): string {
    const COLOR_PATTERNS = [/purple/, /pink/, /orange/, /teal/, /blue/, /green/];
    const COLORS = ['PURPLE', 'PINK', 'ORANGE', 'TEAL', "BLUE", "GREEN"]; 


    const child = elem.children()[0];
    const classes = [...child.classList];
    
    for (let i = 0; i < COLOR_PATTERNS.length; i++) {
        if (classes.some(item => COLOR_PATTERNS[i].test(item))) {
            return COLORS[i];
        }
    } 

    return "NONE";
}

function getPipsData(mode: string) {
    const pipState: PipState = {
        rows: 0,
        cols: 0,
        droppableCells: [],
        cellRelations: []
    };

    cy.get(`[data-testid="${mode.toUpperCase()}-toggle-button"]`).click();
    cy.get('[data-testid="play-button"]').click();

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

    // Gethers cell colors and constraints to determine relationships
    cy.get('[class^="Board-module_regions_"]')
        .children()
        .each(($el) => {
            if ($el.children().length == 0) {
                pipState.cellRelations.push('NONE');
            } else if ($el.children().length == 1) {
                pipState.cellRelations.push(getCellColor($el));
            } else {
                let pipStateText = "";

                pipStateText += getCellColor($el);

                const constraintWrapper = $el.children()[1];
                const constraint = constraintWrapper.children[0];

                // "=" is implemented in a class whereas the other constraints are in element contained text
                pipStateText += "_" + (constraint.textContent ? constraint.textContent : "=");

                pipState.cellRelations.push(pipStateText);  
            }
        });

    cy.writeFile(`data/pips_${mode}.json`, pipState);
}

describe('scraper', () => {
    it('scrapes pips game data', () => {
        cy.visit('https://www.nytimes.com/games/pips');

        cy.get('[data-testid="play-button"]').click();
        cy.get('[data-testid="modal-close"]').click();

        cy.get('[data-testid="back-button"]').click();

        getPipsData('easy');

        cy.get('[data-testid="back-button"]').click();
        
        getPipsData('medium');

        cy.get('[data-testid="back-button"]').click();

        getPipsData('hard');
    });
});