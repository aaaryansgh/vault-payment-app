export class AppError extends Error{
    public statusCode:number;
    public isOperational:boolean;
    constructor(message:string,statusCode:number=500){
        super(message);
        this.statusCode=statusCode;
        this.isOperational=true;
        Error.captureStackTrace(this,this.constructor);
    }
}
export const BadRequestError=(message:string)=>new AppError(message,400);
export const UnauthorizedError=(message:string='Unauthorized')=>new AppError(message,401);
export const ForbiddenError=(message:string='Forbidden')=>new AppError(message,403);
export const NotFoundError=(message:string='Not Found')=>new AppError(message,404);
export const ConflictError=(message:string='Conflict')=>new AppError(message,409);
export const ValidationError=(message:string)=>new AppError(message,422);

export default AppError;