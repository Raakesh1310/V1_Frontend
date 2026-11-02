import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';

@Injectable()
export class FeeService {
  httpHeaders = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  constructor(private httpClient: HttpClient) {}

  public fetchFees = (merchantId: string, page: number = 1) => {
    return this.httpClient.get(
      environment.apiPrefix + `/fees/${merchantId}/${page}`,
      {
        headers: this.httpHeaders
      }
    );
  };

  public addFee = (merchantId: string, feeData: any) => {
    return this.httpClient.put(
      environment.apiPrefix + `/fees/${merchantId}/create`,
      JSON.stringify(feeData),
      {
        headers: this.httpHeaders
      }
    );
  };

  public deleteFee = (merchantId: string, feeData: any) => {
    return this.httpClient.patch(
      environment.apiPrefix + `/fees/${merchantId}`,
      JSON.stringify(feeData),
      {
        headers: this.httpHeaders
      }
    );
  };
}
