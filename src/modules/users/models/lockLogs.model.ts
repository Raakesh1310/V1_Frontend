import { BaseApiResponseModel } from '@common/models/base-api-response.model';
import { LoginLockTypes } from '../constants/loginLocksType.enum';
import { IUserDetail } from './user-details.model';

export interface LoginLockLogsInterface {
  reason: string;
  lockType: LoginLockTypes;
  totalLoginAttempt?: number;
  lockedAt: Date;
  lockedBy: IUserDetail;
  removedAt: Date;
  removedBy: IUserDetail;
  userLocked: IUserDetail;
}

export interface LoginLockLogsResponseModel extends BaseApiResponseModel {
  result: LoginLockLogsInterface[];
}
