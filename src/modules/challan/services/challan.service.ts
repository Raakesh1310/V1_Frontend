import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BooleanResponseModel } from '@common/models/boolean-response.model';
import { ChallanModel } from '@modules/challan/models';
import { ChallanCreateResponseModel } from '@modules/challan/models/challan-create-response.model';
import { ChallanFindOneResponseModel } from '@modules/challan/models/challan-find-one-response.model';
import { ChallanListResponseModel } from '@modules/challan/models/challan-list-response.model';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, of, Subject, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { ChallanGenerateLinkModel } from '@modules/challan/models/challan-generate-link.model';
import { AuthService } from '@modules/auth/services/auth.service';

interface State {
  page: number;
  pageSize: number;
  searchTerm: string;
}

@Injectable()
export class ChallanService {
  private isSuperAdmin = false;
  private _loading$ = new BehaviorSubject<boolean>(false);
  private _search$ = new Subject();
  private _challans$ = new BehaviorSubject<ChallanModel[]>([]);

  private _state: State = { page: 1, pageSize: 10, searchTerm: '' };

  private _total$ = new BehaviorSubject<number>(0);

  constructor(
    private httpClient: HttpClient,
    private authService: AuthService
  ) {
    this.isSuperAdmin = this.authService.isSuperAdmin();
    console.log(this.isSuperAdmin);
    this._search$
      .pipe(
        tap(() => this._loading$.next(true)),
        switchMap(() => this._search()),
        tap(() => this._loading$.next(false))
      )
      .subscribe((result: ChallanListResponseModel) => {
        console.log(result.result);
        try {
          this._challans$.next(result.result);
          this._total$.next(result.allItemsCount);
        } catch (e) {
          this._challans$.next([]);
        }
      });
  }

  public fetchData = () => {
    this._search$.next();
  };

  get loading$(): Observable<boolean> {
    return this._loading$.asObservable();
  }

  get challans$(): Observable<ChallanModel[]> {
    return this._challans$.asObservable();
  }

  get total$() {
    return this._total$.asObservable();
  }

  get page(): number {
    return this._state.page;
  }

  set page(value: number) {
    console.log('setting page');
    this._state.page = value;
    this._search$.next();
  }

  get searchTerm(): string {
    return this._state.searchTerm;
  }

  set searchTerm(value: string) {
    this._state.searchTerm = value;
  }

  public activate(merchantId: string) {
    console.log('Activating Merchant');
    return this._performAction(merchantId, 'activate');
  }

  public deactivate(merchantId: string) {
    console.log('Deactivating merchant');
    return this._performAction(merchantId, 'deactivate');
  }

  private _performAction(merchantId: string, action: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient.post<BooleanResponseModel>(
      environment.apiPrefix +
        '/super-admin/merchant/' +
        merchantId +
        '/' +
        action,
      { headers: httpHeaders }
    );
  }

  findOne(challanId: string) {
    let url = `${environment.apiPrefix}/challan/${challanId}`;
    if (this.authService.isSuperAdmin()) {
      url = `${environment.apiPrefix}/${environment.urlAdminPrefix}/challan/${challanId}`;
    }
    return this.httpClient.get<ChallanFindOneResponseModel>(url);
  }

  generatePdfLink(formData: object) {
    return this.httpClient.post<ChallanGenerateLinkModel>(
      environment.apiPrefix + '/challan/download',
      formData
    );
  }

  getAllAccounts(url : string,params : any) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.httpClient.get(url, { headers: httpHeaders, params });
  }


  create(formData: FormData, isAdmin: boolean, merchantId: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let params: any = {};
    if (merchantId) {
      params.merchantId = merchantId;
    }
    let url = environment.apiPrefix + '/challan';
    if (isAdmin) {
      url = environment.apiPrefix + '/super-admin/challan';
    }
    return this.httpClient.post<ChallanCreateResponseModel>(url, formData, {
      params
    });
  }

  private _search = (): Observable<ChallanListResponseModel> => {
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    // Prepare Params list
    // tslint:disable-next-line:no-any
    const params: any = { page: this.page };

    if (this.searchTerm.length > 0) {
      params.s = this.searchTerm;
    }
    if (this.isSuperAdmin) {
      console.log('superAdmin=', this.isSuperAdmin);
      return this.httpClient.get<ChallanListResponseModel>(
        environment.apiPrefix + '/' + environment.urlAdminPrefix + '/challan',
        {
          headers: httpHeaders,
          params
        }
      );
    } else {
      return this.httpClient.get<ChallanListResponseModel>(
        environment.apiPrefix + '/challan',
        {
          headers: httpHeaders,
          params
        }
      );
    }
  };
}
