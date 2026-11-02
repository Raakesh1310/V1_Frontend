import { BaseApiResponseModel } from '@common/models/base-api-response.model';
import { User } from '@modules/auth/models';

export interface Mail extends MailInput {
  mailId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface MailInput {
  recipients: Recipient[];
  body: string;
  subject: string;
}

export interface Recipient {
  email: string;
}

export interface MailResponse extends BaseApiResponseModel {
  result: Mail[];
}
