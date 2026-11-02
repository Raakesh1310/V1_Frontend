import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '@modules/auth/services';
import { TransferBulkResponseModel } from '@modules/passbook/models/transfer-response.model';
import { environment } from '../../../environments/environment';
import { BulkTransferCreateResponseModel } from '../models/bulk-transfer-response.model';

/**
 * Bulk Transfer
 * Service
 */
@Injectable()
export class BulkTransferService {
  constructor(
    private httpClient: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Find Bulk Transfer
   * @param params
   * @returns
   */
  // tslint:disable-next-line:no-any
  findOne = (params: any) => {
    if (!params || !params.transferId) {
      return null;
    }
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const bulkTransferId = params.bulkTransferId;

    return this.httpClient.get<TransferBulkResponseModel>(
      environment.apiPrefix + '/multi-transfer/' + bulkTransferId,
      {
        headers,
        params
      }
    );
  };

  /**
   * Create Bulk
   * Transfer
   * @param body
   * @param isAdmin
   * @returns
   */
  // tslint:disable-next-line:no-any
  create(body: any, isAdmin?: boolean) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient.post<BulkTransferCreateResponseModel>(
      environment.apiPrefix +
        (isAdmin ? '/' + environment.urlAdminPrefix : '') +
        '/multi-transfer',
      body,
      { headers: httpHeaders }
    );
  }

  /**
   * Validate Payees of
   * Bulk Transfer
   * @param body
   * @param isAdmin
   * @returns
   */
  // tslint:disable-next-line:no-any
  validatePayees(body: any, isAdmin?: boolean, merchantId?: string | null) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    // tslint:disable-next-line:no-any
    let url = '',
      params: any = {};
    if (isAdmin) {
      url =
        environment.apiPrefix +
        '/' +
        environment.urlAdminPrefix +
        `/multi-transfer/payee-validation`;
      params = { merchantId: merchantId };
    } else {
      url = environment.apiPrefix + `/multi-transfer/payee-validation`;
    }

    return this.httpClient.post<BulkTransferCreateResponseModel>(url, body, {
      headers: httpHeaders,
      params
    });
  }

  getBankAccounts(merchantId: string = '', isAdmin: string = '') {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let url = isAdmin
      ? environment.apiPrefix +
        '/' +
        environment.urlAdminPrefix +
        `/bank-account/${merchantId}`
      : environment.apiPrefix + '/bank-account';

    return this.httpClient.get(url, { headers: httpHeaders });
  }
}
