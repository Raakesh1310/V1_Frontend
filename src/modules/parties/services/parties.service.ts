import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';

@Injectable()
export class PartiesService {
  constructor(private httpClient: HttpClient) {}

  createParty(inputs: any) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient.post<any>(
      `${environment.apiPrefix}/super-admin/parties`,
      JSON.stringify(inputs),
      { headers: httpHeaders }
    );
  }

  updateParty(partyId: string, inputs: any) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient.patch<any>(
      `${environment.apiPrefix}/super-admin/parties/${partyId}`,
      JSON.stringify(inputs),
      { headers: httpHeaders }
    );
  }

  getParties(
    isAdmin: boolean,
    merchantId: string,
    page: number = 1,
    searchTerm: string = ''
  ) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    let params: any = { merchantId, page };

    if (searchTerm) {
      params.s = searchTerm;
    }

    let url = environment.apiPrefix + `/merchant/${merchantId}/partiess`;
    if (isAdmin) {
      url = environment.apiPrefix + `/super-admin/merchant/${merchantId}/parties`;
    }

    return this.httpClient.get<any>(
      url,
      { headers: httpHeaders, params }
    );
  }

  getParty(merchantId: string, partyId: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient.get<any>(
      `${environment.apiPrefix}/super-admin/merchant/${merchantId}/party/${partyId}`,
      { headers: httpHeaders }
    );
  }
}
