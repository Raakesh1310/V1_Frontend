import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { ToastMessageData, ToastMessageOptions } from '@common/models';
import { ToastService } from '@common/services';
import { AuthService } from '@modules/auth/services';
import { uploadPayeeApiData } from '@modules/payee/models';
import { PayeeValidationInterface } from '@modules/payee/models/payee-validation.model';
import { PayeeService } from '@modules/payee/services';
import { PayeeValidationService } from '@modules/payee/services/payee-validation.service';
import {
  NgbCalendar,
  NgbDate,
  NgbDateStruct,
  NgbModalRef
} from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'environments/environment';
import _ from 'lodash';
import { NgxSpinnerService } from 'ngx-spinner';
import { BehaviorSubject, Observable } from 'rxjs';
import * as XLSX from 'xlsx';
import { MultiPayeeStatus } from '../multiple-payees/multiple-payees.component';

@Component({
  selector: 'sbpro-payee-validation-component',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payee-validation.component.pug',
  styleUrls: ['payee-validation.component.scss']
})
export class PayeeValidationComponent implements OnInit {
  @ViewChild('inputFile') inputFile!: ElementRef;
  @Input() modal!: NgbModalRef;
  @Input() merchantId: string = '';
  @Input() pageSize = 10;
  private _loadingList$ = new BehaviorSubject(false);
  public payeeStatus: MultiPayeeStatus = MultiPayeeStatus.upload;

  model!: NgbDateStruct;
  payeesValidations$!: Observable<PayeeValidationInterface[]>;
  // computedPayeeValidations!: {
  //   [batchId: string]: PayeeCalculatedValues;
  // };
  total$!: Observable<number>;
  sortedColumn!: string;
  sortedDirection!: string;
  virtualIdList!: Observable<string[]>;
  filtersVisible = true;
  errors: Array<string> = [];
  dataToSendOnApi: Array<uploadPayeeApiData> = [];
  uploadedFileName = '';
  isAdmin: Boolean = false;
  states = MultiPayeeStatus;
  excelHeaders = [
    [
      'Account Holder Name - Minimum 3 char & Max 100 char. Name should not end with space (Mandatory)',
      'Mobile number - Numeric Value and 10 digits (Mandatory)',
      'E-Mail id of Contact  (Mandatory)',
      'Beneficiary account number  (Mandatory)',
      'IFSC code  (Mandatory)',
      'Bank name  (Mandatory)',
      'Branch Name  (Mandatory)'
    ]
  ];
  sampleFileUrl = '../../../../assets/sample-files/Bulk_Payee_Sample.xlsx';
  checkForValidHeaders: boolean = false;
  hardEscrowAccountNumber!: string | undefined;

  constructor(
    private cdr: ChangeDetectorRef,
    private httpClient: HttpClient,
    public payeeService: PayeeService,
    private authService: AuthService,
    private spinner: NgxSpinnerService,
    private calendar: NgbCalendar,
    private toastService: ToastService,
    private payeeValidationService: PayeeValidationService,
    private router: Router
  ) {
    this.isAdmin = this.authService.isSuperAdmin();
    const merchantProfile = this.authService.getMerchantProfile();
    // if (merchantProfile) {
    this.hardEscrowAccountNumber = _.get(
      merchantProfile,
      'idfcBanks[0].accountNo'
    );
    console.log(this.hardEscrowAccountNumber);
    // }
  }

  /**
   * Getter function for loading list variable
   */
  get loadingList$(): Observable<boolean> {
    return this._loadingList$.asObservable();
  }

  toggleFilters() {
    this.filtersVisible = !this.filtersVisible;
  }

  ngOnInit() {
    this.payeeValidationService.pageSize = this.pageSize;
    this.payeesValidations$ = this.payeeValidationService.payeeValidations$;
    // this.payeeValidationService.computedPayeeValidations$.subscribe((val) => {
    //   this.computedPayeeValidations = val;
    //   this.cdr.detectChanges();
    // });
    this.total$ = this.payeeValidationService.total$;

    this.payeeValidationService.payeeValidations$.subscribe(() => {
      this._loadingList$.next(false);
    });

    this.loadData();
  }

  openDetails(merchantId: string) {
    this.router.navigate([
      environment.urlAdminPrefix + '/merchant/' + merchantId
    ]);
  }

  totalFailedValidations(failed: number, processingErrors: number): number {
    return failed + (processingErrors ?? 0);
  }
  /**
   * This function will refresh the list data
   */
  refreshData() {
    this._loadingList$.next(true);
    console.log('Loading data');
    this.payeeValidationService.performRefresh();
  }

  /**
   * This function will load the data for the list.
   */
  loadData() {
    this._loadingList$.next(true);
    console.log('Loading data');
    this.payeeValidationService.performSearch();
  }

  /**
   * This function will open the data for uploaded data. For validations.
   */
  openUpload() {
    if (
      this.payeeStatus === MultiPayeeStatus.upload ||
      this.payeeStatus === MultiPayeeStatus.error
    ) {
      this.inputFile.nativeElement.click();
    }
  }

  /**
   * This function will clear the Form.
   */
  clearForm() {
    const dNow = new Date();

    // tslint:disable-next-line:no-any
    (this.payeeValidationService.dateFrom = this.calendar.getNext(
      new NgbDate(0, 0, 0),
      'd',
      0
    )),
      // tslint:disable-next-line:no-any
      (this.payeeValidationService.dateTo = this.calendar.getNext(
        new NgbDate(0, 0, 0),
        'd',
        0
      )),
      (this.payeeValidationService.pageSize = 10);

    this.payeeValidationService.dateFromMax = this.calendar.getNext(
      new NgbDate(dNow.getFullYear(), dNow.getMonth() + 1, dNow.getDate()),
      'd',
      0
    );
    this.payeeValidationService.dateToMax = this.calendar.getNext(
      new NgbDate(dNow.getFullYear(), dNow.getMonth() + 1, dNow.getDate()),
      'd',
      0
    );
    this.payeeValidationService.searchTerm = '';
    // this.router.navigate([environment.urlAdminPrefix + '/transaction']);
    this.loadData();

    this.cdr.detectChanges();
  }

  /**
   *
   * @param event Event of uploaded file.
   * This function will upload the given excel and validate it.
   */
  uploadExcel(event: any) {
    this.dataToSendOnApi = [];
    this.errors = [];
    /* wire up file reader */
    console.log(this.inputFile.nativeElement.files.item(0).name);
    this.uploadedFileName = this.inputFile.nativeElement.files.item(0).name; // setting file name
    const target: DataTransfer = <DataTransfer>event.target;
    try {
      if (target.files.length !== 1) {
        let toastHead = 'File Upload Error';
        let toastBody = 'Cannot use multiple files';

        this.showToast(toastHead, toastBody, {
          headerClasses: 'bg-danger text-white'
        });
      }
    } catch (err) {
      let toastHead = 'File Upload Error';
      let toastBody = (err as any).message;

      this.showToast(toastHead, toastBody, {
        headerClasses: 'bg-danger text-white'
      });
    }

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      /* read workbook */
      //console.log(e.target);
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

      /* grab first sheet */
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      //console.log("TARGET ",ws);
      // {header: "A",} will give headers, defval: "" will input default value for empty cells
      /* save data */
      // this.data = XLSX.utils.sheet_to_json(ws, { defval: '' });
      let data = XLSX.utils.sheet_to_json(ws, { defval: '' });
      this.mapExcelHeaderToPayeeInterface(data);
      if (this.dataToSendOnApi.length === 0) {
        this.payeeStatus = MultiPayeeStatus.error;
      } else {
        this.payeeStatus = MultiPayeeStatus.submit;
        localStorage.setItem('payee_bool', 'false');
      }
      this.cdr.detectChanges();
      console.log('DATA ', this.dataToSendOnApi);
    };
    reader.readAsBinaryString(target.files[0]);
  }

  /**
   *
   * @param data Array of uploaded excel data.
   * This function will help to map the data from excel to our interface form.
   */
  mapExcelHeaderToPayeeInterface(data: Array<any>) {
    this.errors = [];
    this.checkForValidHeaders = false;
    if (data.length > 0 && this.checkObjectKeys(data[0])) {
      data.forEach((it: object, index: number) => {
        let dataForApi: uploadPayeeApiData = {
          // @ts-ignore
          accountHolder: it[this.excelHeaders[0][0]],
          // @ts-ignore
          mobile: it[this.excelHeaders[0][1]],
          // @ts-ignore
          email: it[this.excelHeaders[0][2]],
          // @ts-ignore
          accountNumber: it[this.excelHeaders[0][3]].toString(),
          // @ts-ignore
          ifsc: it[this.excelHeaders[0][4]],
          // @ts-ignore
          bankName: it[this.excelHeaders[0][5]],
          // @ts-ignore
          bankAddress: it[this.excelHeaders[0][6]]
        };
        this.dataToSendOnApi.push(dataForApi);
      });
    } else {
      this.checkForValidHeaders = true;
    }
  }

  // getComputedValue(
  //   batchId: string,
  //   key: keyof PayeeCalculatedValues
  // ): number | string {
  //   try {
  //     return _.get(_.get(this.computedPayeeValidations, batchId), key);
  //   } catch (error) {
  //     console.log(error);
  //     return '--';
  //   }
  // }

  /**
   *
   * @param obj Individual headers of excel
   * @returns boolean: true | false
   * This function will check if the headers are valid or not
   */
  checkObjectKeys(obj: any) {
    let flag = true;

    // Changin this if else statement for a loop. Because this is not a good practice.
    this.excelHeaders[0].forEach(exH => {
      if (!obj.hasOwnProperty(exH)) {
        flag = false;
      }
    });
    return flag;
  }
  /**
   *
   * @param header Title of toast
   * @param body Body of a toast
   * @param options extra options of a toast.
   * This function will show toast with the given information.
   */
  showToast(
    header: ToastMessageData,
    body: ToastMessageData,
    options: ToastMessageOptions = {}
  ) {
    const defaultOptions = {
      autohide: true,
      delay: 5000
    };
    this.toastService.show(header, body, { ...defaultOptions, ...options });
  }

  /**
   * This function will send the uploaded data to the api.
   */
  sendDataToApi() {
    this.spinner.show();
    console.log('SEND DATA TO API CALLED');
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'multipart/form-data'
    });
    const body: any = {};

    const params: any = {};
    let url = environment.apiPrefix + '/payees-validation';
    // if (this.isAdmin) {
    //   url = environment.apiPrefix + `/super-admin/payees-validation`;
    //   params.merchantId = this.merchantId;
    //   body.payeeList = this.dataToSendOnApi;
    // } else {
    body.payeeList = this.dataToSendOnApi;
    // }

    if (this.hardEscrowAccountNumber) {
      body.hardEscrowAccountNumber = this.hardEscrowAccountNumber;
    }

    console.log('BODY ', body);
    this.httpClient
      .post(url, body, {
        params
      })
      .subscribe(
        (resp: any) => {
          if (resp.success) {
            console.log('SUCCESS ', resp);
            if (
              resp.result &&
              resp?.result?.success === true
              // resp.result.invalidPayees &&
              // resp.result.invalidPayees.length > 0
            ) {
              this.payeeStatus = MultiPayeeStatus.submit;
              let toastHead = 'Payee Uploaded Successfully';
              let toastBody = `${this.dataToSendOnApi.length} Payees Uploaded Successfully For Verifications.`;

              this.showToast(toastHead, toastBody, {
                headerClasses: 'bg-success text-white'
              });
              // this.payeeStatus = MultiPayeeStatus.upload;
            } else {
              // TODO: show toast here
              // this.payeeStatus = MultiPayeeStatus.moveToPayeeList;
              this.errors = resp?.result?.errors;
            }
            this.payeeStatus = MultiPayeeStatus.upload;
            this.loadData();
            this.spinner.hide();
            this.cdr.detectChanges();
          } else {
            console.log('ERROR ', resp.errors);
            this.payeeStatus = MultiPayeeStatus.upload;
            this.errors = resp.errors;
            this.loadData();
            this.spinner.hide();
            this.cdr.detectChanges();
          }
        },
        err => {
          this.payeeStatus = MultiPayeeStatus.upload;
          console.log('ERROR FROM API SIDE ', err);
          if (err.status === 0) {
            this.errors = ['Connection Error'];
          } else {
            this.errors = err.error.errors;
          }
          this.loadData();
          this.spinner.hide();
          this.cdr.detectChanges();
        }
      );
  }
}
