import { AuthGuard } from './auth.guard';
import { TAndCGuardGuard } from './tand-cguard.guard';

export const guards = [AuthGuard, TAndCGuardGuard];

export * from './auth.guard';
