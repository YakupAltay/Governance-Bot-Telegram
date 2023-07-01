import TelegramBot from 'node-telegram-bot-api';
import { setupJobs } from "../jobs/index.js";
import { TelegramToken } from '../config/env.js';

export const telegramBot = new TelegramBot(TelegramToken, { polling: true });

export async function setupTelegram() {
    console.log(`Telegram bot has been started!`);

    setupJobs();
}

export async function sendProposalToTelegram(proposal, chain) {
    const cliMessage = `\`\`\`${chain.binaryName} tx gov vote ${proposal.id} [yes/no/no_with_veto/abstain] --chain-id ${chain.chainId} --from [your_key_name]\`\`\``;

    let fields = '';
    // Check if proposal has a 'type' property
    if (proposal.type) {
        fields += `Type: ${proposal.type}\n`;

        if (proposal.type.includes('SoftwareUpgradeProposal')) {
            fields += `Version: ${proposal.plan?.name}\nTarget Height: ${proposal.plan?.height}\n`;

            if (proposal.plan?.info) {
                const infoJson = JSON.parse(proposal.plan?.info);
                if (infoJson?.binaries) {
                    let text = '';
                    for (const key of Object.keys(infoJson.binaries)) {
                        text += `${key}: ${infoJson.binaries[key]}\n`;
                    }
                    fields += `Binaries: ${text}\n`;
                }
            }
        }
    }

    const url = chain.proposalUrl?.replace('{id}', proposal.id);

    let description = proposal.description?.replace(/`/g, '\\`') ?? "";
    if (description.length > 200) {
        description = description.substring(0, 200) + '...';
    }

    description += '\n\n' + url;

    const message = `
                <b>New Proposal 📝</b>
                ID: ${proposal.id.toString()}
                Title: ${proposal.title}
                Description: ${description}
    
                <b>🗓️ Key Dates</b>
                Submission: ${proposal.submitTime.toUTCString()}
                Voting: ${proposal.votingStartTime.toUTCString()} to ${proposal.votingEndTime.toUTCString()}
                
                <b>Proposal Details</b>
                ${fields}

                <b>🙋‍♂️ How to Participate</b>
                Follow the instructions below to vote via CLI:
                ${cliMessage}`;

    await telegramBot.sendMessage(chain.telegramChatId, message, { parse_mode: 'HTML' });
}


setupTelegram();
