import { RolesGuard } from './roles.guard';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '../../user/models/user-role.enum';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
    let rolesGuard: RolesGuard;
    let reflector: Reflector;

    beforeEach(() => {
        reflector = new Reflector();
        rolesGuard = new RolesGuard(reflector);
    });

    it('should allow access if no roles are defined', () => {
        const context = {
            switchToHttp: () => ({
                getRequest: () => ({ user: {} }),
            }),
            getHandler: () => {},
        } as unknown  as ExecutionContext;

        reflector.get = jest.fn().mockReturnValue([]);

        expect(rolesGuard.canActivate(context)).toBe(true);
    });

    it('should deny access if user role does not match', () => {
        const context = {
            switchToHttp: () => ({
                getRequest: () => ({ user: { role: UserRole.User } }), // Mock user with User role 
            }),
            getHandler: () => {
                return () => [{ [ROLES_KEY]: [UserRole.Admin] }];
            },
        } as unknown as ExecutionContext;

        reflector.get = jest.fn().mockReturnValue(['Admin']);

        expect(() => rolesGuard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should allow access if user role matches', () => {
        const context = {
            switchToHttp: () => ({
                getRequest: () => ({ user: { role: UserRole.Admin } }), // Mock user with Admin role 
            }),
            getHandler: () => {
                return () => [{ [ROLES_KEY]: [UserRole.Admin] }];
            },
        } as unknown as ExecutionContext;

        reflector.get = jest.fn().mockReturnValue(['Admin']);

        expect(rolesGuard.canActivate(context)).toBe(true);
    });
});