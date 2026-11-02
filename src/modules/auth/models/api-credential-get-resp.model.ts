import { BaseApiResponseModel } from '@common/models/base-api-response.model';
import { ApiCredential } from '@modules/auth/models/api-credential.model';

export interface ApiCredentialGetRespModel extends BaseApiResponseModel {
  result: ApiCredential;
}
