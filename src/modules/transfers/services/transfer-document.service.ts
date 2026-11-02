import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '@modules/auth/services';
import { TransferDocumentInterface } from '@modules/passbook/models/document.model';
import { environment } from 'environments/environment';
import { BehaviorSubject, Subject } from 'rxjs';
import { TransferDocumentDetail } from '../models';

@Injectable()
export class TransferDocumentService {
  private _loading$ = new BehaviorSubject<boolean>(true);
  ch$ = new Subject<void>();

  private _docs$ = new BehaviorSubject<TransferDocumentDetail[]>([]);
  public isAdmin = false;

  constructor(
    private httpClient: HttpClient,
    private authService: AuthService
  ) {
    this.isAdmin = this.authService.isSuperAdmin();
  }

  /**
   * ##########################################################################
   *          GET FUNCTIONS
   * ##########################################################################
   */

  performReset() {
    this._docs$.next([]);
    // this._total$.next(0);
  }

  get docs$() {
    return this._docs$.asObservable();
  }

  get loading$() {
    return this._loading$.asObservable();
  }

  uploadDocument(formData: FormData, isBulkTransfer: boolean = false) {
    console.log('adding document to the account');
    // Hit the call on server
    return this.httpClient.post<TransferDocumentDetail>(
      `${environment.apiPrefix}/transfer/document/${
        isBulkTransfer === true ? 'true' : 'false'
      }`,
      formData
    );
  }

  /**
   * Find a document by id.
   * @param transferId
   * @returns
   */
  find(transferId: string) {
    return this.httpClient.get<TransferDocumentInterface>(
      `${environment.apiPrefix}/transfer/${transferId}/document`
    );
  }

  /**
   *
   * @param docId Delete a document by id.
   * @returns
   */
  deleteDocument(docId: string) {
    console.log('deleting document from the account');
    // Hit the call on server
    return this.httpClient.delete(
      `${environment.apiPrefix}/transfer/document/${docId}`
    );
  }
}
