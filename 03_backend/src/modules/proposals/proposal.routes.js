const express = require('express');
const router = express.Router();
const proposalController = require('./proposal.controller');
const { validateCreateProposal, validateUpdateProposalStatus } = require('./proposal.validator');
const { verifyToken, requireRoles } = require('../../middleware/auth.middleware');

// POST /api/proposals & /api/v1/proposals (Sinh viên nộp đề xuất cho job Freelance)
router.post('/', verifyToken, requireRoles('STUDENT'), validateCreateProposal, (req, res, next) => proposalController.create(req, res, next));

// GET /api/proposals/my-proposals & /api/v1/proposals/my-proposals (Sinh viên xem danh sách đề xuất của mình)
router.get('/my-proposals', verifyToken, requireRoles('STUDENT'), (req, res, next) => proposalController.getMyProposals(req, res, next));

// GET /api/proposals/employer-proposals & /api/v1/proposals/employer-proposals (Nhà tuyển dụng xem danh sách đề xuất nhận được)
router.get('/employer-proposals', verifyToken, requireRoles('EMPLOYER'), (req, res, next) => proposalController.getEmployerProposals(req, res, next));

// GET /api/proposals/job/:jobId & /api/v1/proposals/job/:jobId (Nhà tuyển dụng xem danh sách đề xuất của tin)
router.get('/job/:jobId', verifyToken, requireRoles('EMPLOYER'), (req, res, next) => proposalController.getJobProposals(req, res, next));

// GET /api/proposals/:id & /api/v1/proposals/:id (Xem chi tiết một proposal)
router.get('/:id', verifyToken, (req, res, next) => proposalController.getById(req, res, next));

// PATCH /api/proposals/:id/status & /api/v1/proposals/:id/status (A3 RULE: Employer duyệt REVIEWING/REJECTED, chặn ACCEPTED)
router.patch('/:id/status', verifyToken, requireRoles('EMPLOYER'), validateUpdateProposalStatus, (req, res, next) => proposalController.updateStatus(req, res, next));

module.exports = router;
