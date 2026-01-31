import cypress from 'cypress';

export async function runScraper() {
    try {
        const runRes = await cypress.run({
            spec: './cypress/e2e/scraper.cy.ts'
        });

        console.log(runRes);
    } catch (err) {
        console.log("Error executing scraper: " + err);
        process.exit(1);
    }
}