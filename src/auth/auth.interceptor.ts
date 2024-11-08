import { Injectable, NestInterceptor, ExecutionContext, CallHandler, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { UserTable } from '../user/user.model';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<UserTable> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            throw new UnauthorizedException('No token provided');
        }

        // Ensure JWT_SECRET is not undefined
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }

        try {
            const payload = jwt.verify(token, jwtSecret);
            request['user'] = payload;
        } catch (error) {
            throw new UnauthorizedException(`Invalid token: ${error}`);
        }

        return next.handle();
    }
}