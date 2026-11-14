const express = require('express');
const router = express.Router();
const assignmentController = require('./assignment.controller');
const { validateUpdateAssignmentStatus } = require('./assignment.validator');
const { verifyToken, requireRoles } = require('../../middleware/auth.middleware');

// GET /api/v1/assignments/my-assignments (Student)
router.get('/my-assignments', verifyToken, requireRoles('STUDENT'), (req, res, next) => assignmentController.getMyAssignments(req, res, next));

// GET /api/v1/assignments/employer-assignments (Employer)
router.get('/employer-assignments', verifyToken, requireRoles('EMPLOYER'), (req, res, next) => assignmentController.getEmployerAssignments(req, res, next));

// GET /api/v1/assignments/:id (Student owner, Employer owner, Admin)
router.get('/:id', verifyToken, (req, res, next) => assignmentController.getById(req, res, next));

// Tiến độ & sản phẩm bàn giao (sinh viên / nhà tuyển dụng của hợp đồng)
const wrap = (fn, status = 200) => async (req, res, next) => {
    try { res.status(status).json({ success: true, data: await fn(req) }); } catch (err) { next(err); }
};
const assignmentService = require('./assignment.service');
router.get('/:id/progress', verifyToken, wrap(req => assignmentService.listProgress(req.params.id, req.user)));
router.post('/:id/progress', verifyToken, wrap(req => assignmentService.addProgress(req.params.id, req.user, req.body), 201));
router.get('/:id/deliverables', verifyToken, wrap(req => assignmentService.listDeliverables(req.params.id, req.user)));
router.post('/:id/deliverables', verifyToken, requireRoles('STUDENT'), wrap(req => assignmentService.addDeliverable(req.params.id, req.user, req.body), 201));
router.post('/:id/deliverables/:deliverableId/review', verifyToken, requireRoles('EMPLOYER'),
    wrap(req => assignmentService.reviewDeliverable(req.params.id, req.params.deliverableId, req.user, req.body)));

// PATCH /api/v1/assignments/:id/status (Employer)
router.patch('/:id/status', verifyToken, requireRoles('EMPLOYER'), validateUpdateAssignmentStatus, (req, res, next) => assignmentController.updateStatus(req, res, next));

module.exports = router;
