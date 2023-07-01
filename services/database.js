import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export default {
    async getExistsProposal(proposalId, chain) {
        return await prisma.proposal.findFirst({
            where: {
                chain,
                proposalId
            }
        });
    },
    async createProposal(proposalId, chain) {
        await prisma.proposal.create({
            data: {
                proposalId,
                chain
            }
        });
    },
}