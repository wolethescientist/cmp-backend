import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

/**
 * Run an array of validation chains and return 400 if any fail.
 */
export function validate(validations: ValidationChain[]) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        await Promise.all(validations.map((v) => v.run(req)));

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                error: 'Validation failed',
                data: errors.array().map((e) => ({
                    field: 'path' in e ? e.path : 'unknown',
                    message: e.msg,
                })),
            });
            return;
        }

        next();
    };
}
