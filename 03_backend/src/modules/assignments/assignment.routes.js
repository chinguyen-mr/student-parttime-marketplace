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

// PATCH /api/v1/assignments/:id/status (Employer)
router.patch('/:id/status', verifyToken, requireRoles('EMPLOYER'), validateUpdateAssignmentStatus, (req, res, next) => assignmentController.updateStatus(req, res, next));

module.exports = router;
