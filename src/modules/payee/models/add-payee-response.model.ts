import { BaseApiResponseModel } from '@common/models/base-api-response.model';
import { Payee } from '@modules/payee/models/payee.model';

export interface AddPayeeResponseModel extends BaseApiResponseModel {
  result: Payee;
}
