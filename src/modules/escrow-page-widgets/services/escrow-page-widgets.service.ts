import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable, of } from 'rxjs';

@Injectable()
export class EscrowPageWidgetsService {
  constructor(private httpClient: HttpClient) {}

  getEscrowPageWidgets$(): Observable<{}> {
    return of({});
  }

  verifyPAN(pan: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log('updating data: ', pan);
    return this.httpClient.get(
      `${environment.apiPrefix}/merchant/profile/verify/pan/${pan}`
    );
  }

  verifyAADHAAR(aadhaar: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log('updating data: ', aadhaar);
    return this.httpClient.get(
      `${environment.apiPrefix}/merchant/profile/verify/aadhaar/${aadhaar}`
    );
  }

  verifyBANK(bankAcc: string, ifsc: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log('updating data: ', bankAcc, ifsc);
    return this.httpClient.post(
      `${environment.apiPrefix}/merchant/profile/verify/bank`,
      { ifsc, bankAccountNumber: bankAcc }
    );
  }
}
