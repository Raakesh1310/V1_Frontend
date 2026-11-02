import { BaseApiResponseModel } from '@common/models/base-api-response.model';


export interface ChallanGenerateLinkModel extends BaseApiResponseModel {
  result: {fileName : string};
}
