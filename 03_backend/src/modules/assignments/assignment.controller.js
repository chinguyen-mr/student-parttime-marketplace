const assignmentService = require('./assignment.service');

class AssignmentController {
    async getMyAssignments(req, res, next) {
        try {
            const list = await assignmentService.getMyAssignments(req.user.id);
            res.status(200).json({
                success: true,
                total: list.length,
                data: list,
            });
        } catch (err) {
            next(err);
        }
    }

    async getEmployerAssignments(req, res, next) {
        try {
            const list = await assignmentService.getEmployerAssignments(req.user.id);
            res.status(200).json({
                success: true,
                total: list.length,
                data: list,
            });
        } catch (err) {
            next(err);
        }
    }

    async getById(req, res, next) {
        try {
            const item = await assignmentService.getAssignmentById(req.params.id, req.user.id, req.user.role);
            res.status(200).json({
                success: true,
                data: item,
            });
        } catch (err) {
            next(err);
        }
    }

    async updateStatus(req, res, next) {
        try {
            const updated = await assignmentService.updateStatus(req.params.id, req.user.id, req.body.status);
            res.status(200).json({
                success: true,
                message: `Cập nhật trạng thái công việc thành "${req.body.status}"`,
                data: updated,
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new AssignmentController();
