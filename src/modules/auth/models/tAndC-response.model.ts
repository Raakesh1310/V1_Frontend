import { BaseApiResponseModel } from "@common/models/base-api-response.model";
import { TAndCModel } from "./tAndC.model";

export interface TAndCResponseModel extends BaseApiResponseModel {
    result : TAndCModel
}