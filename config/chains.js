import fs from 'fs/promises';

const ChainFileName = './chains.json';

async function initChains() {
    return JSON.parse(await fs.readFile(ChainFileName, 'utf8'));
}

export const Chains = await initChains();