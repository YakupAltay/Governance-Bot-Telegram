import { CronJob } from "cron";
import { Chains } from "../config/chains.js";
import LcdClient from "../lib/lcd.js";
import database from "../services/database.js";
import { sendProposalToTelegram } from "../services/telegram.js";

export default function checkProposalsJob() {
    let isRunning = false;
    const cronJob = new CronJob('* * * * *', async () => {
        if (isRunning) {
            console.log('checkProposalsJob is already running.');
            return;
        }

        isRunning = true;
        try {
            console.log('checkProposalsJob started.');

            const chains = Chains['chains'];
            await Promise.all(chains.map(chain => processProposals(chain)));

            console.log('checkProposalsJob finished.');
        } catch (error) {
            console.log('checkProposalsJob got error', error);
        } finally {
            isRunning = false;
        }
    });
    cronJob.start();
}

async function processProposals(chain) {
    try {
        const lcdClient = new LcdClient(chain.lcd);
        const proposals = await lcdClient.getProposals();

        proposals.forEach(async proposal => {
            // check proposal is new
            if (proposal.status != 'PROPOSAL_STATUS_VOTING_PERIOD') {
                return;
            }

            try {
                await sendProposalToTelegram(proposal, chain);
                await database.createProposal(proposal.id, chain.name);
            } catch (err) {
                console.log(err);
            }
        });
    } catch (error) {
        console.log(`[${chain.name}] processProposals error`, error);
    }

}