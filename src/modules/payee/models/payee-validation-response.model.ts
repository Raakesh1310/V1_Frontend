import { BaseApiResponseModel } from '@common/models/base-api-response.model';
import { PayeeValidationInterface } from './payee-validation.model';

export interface PayeeValidationsResponseModel extends BaseApiResponseModel {
    result: PayeeValidationInterface[];
}

export interface PayeeValidationResponseModel extends BaseApiResponseModel {
    result: PayeeValidationInterface;
}