const proposalService = require('./proposal.service');

class ProposalController {
    async create(req, res, next) {
        try {
            const proposal = await proposalService.createProposal(req.user.id, req.body);
            res.status(201).json({
                success: true,
                message: 'Nộp đề xuất công việc Freelance thành công',
                data: proposal,
            });
        } catch (err) {
            next(err);
        }
    }

    async getMyProposals(req, res, next) {
        try {
            const proposals = await proposalService.getStudentProposals(req.user.id);
            res.status(200).json({
                success: true,
                total: proposals.length,
                data: proposals,
            });
        } catch (err) {
            next(err);
        }
    }

    async getJobProposals(req, res, next) {
        try {
            const jobId = parseInt(req.params.jobId, 10);
            const proposals = await proposalService.getJobProposals(jobId, req.user.id);
            res.status(200).json({
                success: true,
                total: proposals.length,
                data: proposals,
            });
        } catch (err) {
            next(err);
        }
    }

    async getEmployerProposals(req, res, next) {
        try {
            const proposals = await proposalService.getEmployerProposals(req.user.id);
            res.status(200).json({
                success: true,
                total: proposals.length,
                data: proposals,
            });
        } catch (err) {
            next(err);
        }
    }

    async getById(req, res, next) {
        try {
            const proposal = await proposalService.getProposalById(req.params.id, req.user.id, req.user.role);
            res.status(200).json({
                success: true,
                data: proposal,
            });
        } catch (err) {
            next(err);
        }
    }

    async updateStatus(req, res, next) {
        try {
            const updated = await proposalService.updateStatus(req.params.id, req.user.id, req.body.status);
            res.status(200).json({
                success: true,
                message: `Trạng thái đề xuất đã chuyển sang: "${req.body.status}"`,
                data: updated,
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new ProposalController();
