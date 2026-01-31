interface PipState {
    rows: number,
    cols: number,
    cells: string[],
    pieces: number[][]; 
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

// Determines the dimensions of the game board
function getBoardDimensions(pipState: PipState): void {
    cy.get('[class^="Board-module_boardContainer_"]').then($el => {
        const style = window.getComputedStyle($el[0]);
        const rows = style.getPropertyValue('--rows');
        const cols = style.getPropertyValue('--cols');

        pipState.rows = parseInt(rows);
        pipState.cols = parseInt(cols);
    });
}

// Determines the droppable cells on the board
function getPlayableCells(pipState: PipState): void {
    cy.get('[class^="Board-module_droppable_"]')
        .children()
        .each(($el) => {
            const classes = [...$el[0].classList];

            if (classes.includes('Board-module_hidden__DkSxz')) {
                pipState.cells.push("INVALID");
            } else {
                pipState.cells.push("VALID"); 
            }
        });
}

// Gethers cell colors and constraints to determine relationships
function getCellRelationships(pipState: PipState): void {
    cy.get('[class^="Board-module_regions_"]')
        .children()
        .each(($el, index) => {
            if ($el.children().length == 1) {
                pipState.cells[index] += '_' + getCellColor($el);
            } else if ($el.children().length == 2) {
                let pipStateText = "";

                pipStateText += getCellColor($el);

                const constraintWrapper = $el.children()[1];
                const constraint = constraintWrapper.children[0];

                if (constraint.textContent) {
                    pipStateText += '_' + constraint.textContent;
                } else {
                    const classes = [...constraint.children[0].classList];

                    if (classes.some(item => /notEqual/.test(item))) {
                        pipStateText += '_' + '!=';
                    }  else {
                        pipStateText += '_' + '=';
                    }
                }

                pipState.cells[index] += '_' + pipStateText;  
            }
        });
}

// Gathers piece data
function getPieces(pipState: PipState): void {
    cy.get('[class^="Tray-module_tray__"]')
        .children()
        .each($el => {
            const pieceData: number[] = [];

            $el.find('[class^="Domino-module_halfDomino"]').each((index, $btn) => {
                const numWrapper = $btn.children[0];
                pieceData.push(numWrapper.children.length);
            });

            pipState.pieces.push(pieceData);
        })
}

// Creates a game state object and populates its fields
function getPipsData(mode: string): void {
    const pipState: PipState = {
        rows: 0,
        cols: 0,
        cells: [],
        pieces: []
    };

    cy.get(`[data-testid="${mode.toUpperCase()}-toggle-button"]`).click();
    cy.get('[data-testid="play-button"]').click();

    getBoardDimensions(pipState);
    getPlayableCells(pipState);
    getCellRelationships(pipState);
    getPieces(pipState);

    cy.writeFile(`data/pips_${mode}.json`, pipState);
}

describe('scraper', () => {
    it('scrapes pips game data', () => {
        cy.visit('https://www.nytimes.com/games/pips');

        // Return to menu
        cy.get('[data-testid="play-button"]').click();
        cy.get('[data-testid="modal-close"]').click();
        cy.get('[data-testid="back-button"]').click();

        // Iterate through difficulties and gather data
        getPipsData('easy');

        cy.get('[data-testid="back-button"]').click();
        
        getPipsData('medium');

        cy.get('[data-testid="back-button"]').click();

        getPipsData('hard');
    });
});