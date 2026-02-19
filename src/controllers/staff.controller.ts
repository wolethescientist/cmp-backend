import { Request, Response, NextFunction } from 'express';
import { StaffService } from '../services/staff.service';

export class StaffController {
    /**
     * POST /api/staff — Create a new staff member.
     */
    static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const staff = await StaffService.createStaff(req.body);
            res.status(201).json({ success: true, data: staff, message: 'Staff member created.' });
        } catch (err) {
            next(err);
        }
    }

    /**
     * GET /api/staff — List all staff.
     */
    static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const staff = await StaffService.getAllStaff();
            res.status(200).json({ success: true, data: staff });
        } catch (err) {
            next(err);
        }
    }

    /**
     * GET /api/staff/:id — Get a single staff member.
     */
    static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const staff = await StaffService.getStaffById(req.params.id as string);
            res.status(200).json({ success: true, data: staff });
        } catch (err) {
            next(err);
        }
    }

    /**
     * DELETE /api/staff/:id — Delete a staff member.
     */
    static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await StaffService.deleteStaff(req.params.id as string);
            res.status(200).json({ success: true, message: 'Staff member deleted.' });
        } catch (err) {
            next(err);
        }
    }

    /**
     * GET /api/staff/:id/activity — Get staff activity report.
     */
    static async getActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const activity = await StaffService.getStaffActivity(req.params.id as string);
            res.status(200).json({ success: true, data: activity });
        } catch (err) {
            next(err);
        }
    }
}
