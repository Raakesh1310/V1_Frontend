import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import * as XLSX from 'xlsx';
import {
  Payee,
  uploadPayeeApiData,
  uploadPayeeData
} from '@modules/payee/models';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { OtpModalComponent } from '@common/components';
import smsMsg91TemplateId from '../../../../config/smsMsg91TemplateId';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PayeeService } from '@modules/payee/services';
import { AuthService } from '@modules/auth/services';
import { NgxSpinnerService } from 'ngx-spinner';
import { MerchantDetailAdminContainerComponent } from '@modules/merchant/containers';
import { ToastService } from '@common/services';
import { ToastMessageData, ToastMessageOptions } from '@common/models';
import { ProfileService } from '@modules/profile/services';

export enum MultiPayeeStatus {
  upload,
  submit,
  moveToPayeeList,
  error
}

@Component({
  selector: 'sbpro-multiple-payees',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './multiple-payees.component.pug',
  styleUrls: ['./multiple-payees.component.scss']
})
export class MultiplePayeesComponent implements OnInit {
  @ViewChild('inputFile') inputFile!: ElementRef;
  @ViewChild('uploadButton') uploadButton!: ElementRef;
  @Input() modal!: NgbModalRef;
  @Input() merchantId: string = '';
  @ViewChild(MerchantDetailAdminContainerComponent)
  child?: MerchantDetailAdminContainerComponent;
  data: Array<uploadPayeeData> = [];
  errorData: Array<uploadPayeeData> = [];
  dataToSendOnApi: Array<uploadPayeeApiData> = [];
  uploadedFileName = '';
  public states = MultiPayeeStatus;

  public payeeStatus: MultiPayeeStatus = MultiPayeeStatus.upload;
  validEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  validIfsc = /[A-Z|a-z]{4}[0][a-zA-Z0-9]{6}$/;
  validAccountHolder = /^[\d A-Za-z]+$/;
  specialCharacterCheck = /^[A-Za-z0-9- ]*$/;
  charactersCheck = /^[A-Za-z0-9- ]*$/;
  numbersCheck = /^[0-9]*$/;
  upiFormatRegex = /^[a-zA-Z0-9.\\-_]{2,256}@[a-zA-Z]{2,64}$/;
  payees$!: Observable<Payee[]>;
  linkedPayee: string[] = [];
  errors: string[] = [];
  isAdmin = false;
  upiPayoutEnabled: boolean = false;
  checkForValidHeaders = false;
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
  total$!: number;
  page = 1;
  pageSize = 10;
  sampleFileUrl = '../../../../assets/sample-files/Bulk_Payee_Sample.xlsx';

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private modalService: NgbModal,
    private httpClient: HttpClient,
    public payeeService: PayeeService,
    private authService: AuthService,
    private spinner: NgxSpinnerService,
    private toastService: ToastService,
    private profileService: ProfileService,
    private activateRoute: ActivatedRoute
  ) {
    localStorage.removeItem('payee_bool');
    this.isAdmin = this.authService.isSuperAdmin();

    this.activateRoute.paramMap.subscribe(data => {
      const merchantId = data.get('merchantId');
      // this.profileService.getProfile(merchantId).subscribe(data => {
      //   this.upiPayoutEnabled = !!data.result.upiPayoutEnabled;
      //   if (data.result.upiPayoutEnabled) {
      //     this.sampleFileUrl =
      //       '../../../../assets/sample-files/Bulk_Payee_Sample_With_UPI.xlsx';
      //     this.excelHeaders = [
      //       [
      //         'Account Holder Name - Minimum 3 char & Max 100 char., Name should not end with space (Mandatory)',
      //         'Mobile number - Numeric Value and 10 digits (Mandatory)',
      //         'E-Mail id of Contact  (Mandatory)',
      //         'Beneficiary account number',
      //         'IFSC code',
      //         'Bank name',
      //         'Branch Name',
      //         'UPI ID'
      //       ]
      //     ];
      //   }
      //   this.cdr.detectChanges();
      // });
    });
  }

  ngOnInit(): void {
    // this.authService.getUserMerchants().subscribe(resp => {
    //   console.log('RES', resp.result);
    //   this.merchantId = resp.result[0].merchant.merchantId;
    // });
    this.payeeService.pageSize = -1;
    this.loadData();
    this.payees$ = this.payeeService.payees$;
    this.payees$.subscribe((val: Payee[]) => {
      this.linkedPayee = [];
      val.forEach(it => {
        // let obj : uploadPayeeData = {
        //   bankAddress : it.bankAddress,
        //   bankName : it.bankName,
        //   ifsc : it.ifsc,
        //   accountNumber : it.accountNumber.toString(),
        //   email : it.email,
        //   mobile : it.mobile,
        //   accountHolder : it.accountHolder,
        //   remarks : '',
        //   rowNumber : 0
        // }
        this.linkedPayee.push(it.accountNumber.toString());
      });
    });
  }

  // ngAfterViewInit(): void { this.spinner.show(); }

  openUpload() {
    if (
      this.payeeStatus === MultiPayeeStatus.upload ||
      this.payeeStatus === MultiPayeeStatus.error
    ) {
      this.inputFile.nativeElement.click();
    }
  }

  uploadAgainAfterSubmit() {
    this.inputFile.nativeElement.click();
  }

  uploadExcel(event: any) {
    this.data = [];
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
      let data = XLSX.utils.sheet_to_json(ws, { defval: '' });
      // @TODO: create a new function to mapExcelHeaderToUPIEnabledPayeeInterface
      this.data = this.upiPayoutEnabled
        ? this.mapExcelHeaderToUPIEnabledPayeeInterface(data)
        : this.mapExcelHeaderToPayeeInterface(data);
      if (this.data.length === 0) {
        this.payeeStatus = MultiPayeeStatus.error;
      } else {
        this.payeeStatus = MultiPayeeStatus.submit;
        localStorage.setItem('payee_bool', 'false');
      }
      this.cdr.detectChanges();
      console.log('DATA ', this.data);
    };
    reader.readAsBinaryString(target.files[0]);
  }

  checkNumberLength(field: string): boolean {
    //console.log(val);
    if (!RegExp('^[0-9]*$').test(field)) {
      return false;
    } else if (field.length !== 10) {
      return false;
    } else {
      return true;
    }
  }

  checkEmptyValueInCells(val: string): boolean {
    return val === '';
  }

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

  navigateToPayeeList() {
    if (this.isAdmin) {
      console.log(environment.urlAdminPrefix + '/merchant/' + this.merchantId);
      this.modal.close();
      console.log('refreshing in parent');
      this.ngOnInit(); // to refresh particular component...
      //this.child?.refreshData();
      // this.router.navigate([environment.urlAdminPrefix + '/merchant/' + this.merchantId], {
      //   queryParams: { merchantId: this.merchantId }
      // });
    } else {
      this.router.navigate([environment.urlPortalPrefix + '/payee']);
    }
  }

  downloadExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(this.excelHeaders);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payee Format');

    /* save to file */
    XLSX.writeFile(wb, 'Payee_Format.xlsx', {
      bookType: 'xlsx',
      type: 'array'
    });
  }

  openModal() {
    // this.spinner.show().then(res => {
    //   console.log(res);
    // });
    if (this.isAdmin) {
      this.sendDataToApi('');
    } else {
      const modalRef: NgbModalRef & {
        componentInstance: OtpModalComponent;
      } = this.modalService.open(OtpModalComponent, {
        backdrop: 'static',
        size: 'md'
      });
      modalRef.componentInstance.doClose = modalRef;
      modalRef.componentInstance.templateId = smsMsg91TemplateId.payeeOtp;
      modalRef.componentInstance.passOtp.subscribe((otp: number) => {
        if (otp) {
          // this.payeeForm.patchValue({
          //   otp: otp.toString()
          // });
          // console.log(this.payeeForm.value);
          this.sendDataToApi(otp.toString());
        } else {
          console.log('something went with modal');
        }
      });
    }
  }

  sendDataToApi(otp: string) {
    this.spinner.show();
    console.log('SEND DATA TO API CALLED');
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'multipart/form-data'
    });
    const body: any = {};

    const params: any = {};
    let url = environment.apiPrefix + '/payees';
    if (this.isAdmin) {
      url = environment.apiPrefix + `/super-admin/payees`;
      params.merchantId = this.merchantId;
      body.payeeList = this.dataToSendOnApi;
    } else {
      body.payeeList = this.dataToSendOnApi;
      body.otp = otp;
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
              resp.result.invalidPayees &&
              resp.result.invalidPayees.length > 0
            ) {
              this.page = 1;
              this.errorData = resp.result.invalidPayees;
              this.total$ = this.errorData.length;
              this.payeeStatus = MultiPayeeStatus.submit;
              let toastHead = 'Payee Uploaded Successfully';
              let toastBody = `${this.data.length -
                this.errorData.length} Payees Uploaded Successfully`;

              this.showToast(toastHead, toastBody, {
                headerClasses: 'bg-success text-white'
              });
              this.cdr.detectChanges();
            } else {
              this.payeeStatus = MultiPayeeStatus.moveToPayeeList;
              this.cdr.detectChanges();
            }
            this.spinner.hide();
          } else {
            console.log('ERROR ', resp.errors);
            this.errors = resp.errors;
            this.cdr.detectChanges();
            this.spinner.hide();
            // this.alertPayeeCreated(false);
          }
        },
        err => {
          // this._loading$.next(false);
          // this.submitted = false;
          console.log('ERROR FROM API SIDE ', err);
          if (err.status === 0) {
            this.errors = ['Connection Error'];
          } else {
            this.errors = err.error.errors;
          }
          this.cdr.detectChanges();
          this.spinner.hide();
        }
      );
  }

  mapExcelHeaderToPayeeInterface(data: Array<any>): Array<uploadPayeeData> {
    this.errorData = [];
    this.checkForValidHeaders = false;
    let payeeData: Array<uploadPayeeData> = [];
    // console.log("DATA LENGTH ",data);
    // console.log("DATA LENGTH 1 ",this.checkObjectKeys(data[0]));
    if (data.length > 0 && this.checkObjectKeys(data[0])) {
      console.log('DATA ', data);
      data.forEach((it: object, index: number) => {
        // @ts-ignore
        let payee: uploadPayeeData = {
          // @ts-ignore
          accountHolder: it[this.excelHeaders[0][0]].toString(),
          // @ts-ignore
          mobile: it[this.excelHeaders[0][1]].toString(),
          // @ts-ignore
          email: it[this.excelHeaders[0][2]].toString(),
          // @ts-ignore
          accountNumber: it[this.excelHeaders[0][3]].toString(),
          // @ts-ignore
          ifsc: it[this.excelHeaders[0][4]].toString(),
          // @ts-ignore
          bankName: it[this.excelHeaders[0][5]].toString(),
          // @ts-ignore
          bankAddress: it[this.excelHeaders[0][6]].toString()
        };

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

        let flag = false;
        payee.rowNumber = index + 1;
        payee.remarks = [];

        if (this.checkExistingPayees(payee)) {
          //dummy.remarks = 'Payee already added';
          payee.remarks.push('Payee already added');
          flag = true;
        }

        if (
          !payee.email.match(this.validEmail) ||
          this.checkEmptyValueInCells(payee.email)
        ) {
          //dummy.remarks = 'Invalid email format';
          payee.remarks.push('Invalid email format');
          flag = true;
        }

        if (
          !this.checkNumberLength(payee.mobile.toString()) ||
          this.checkEmptyValueInCells(payee.mobile.toString())
        ) {
          //dummy.remarks = 'Invalid mobile format';
          payee.remarks.push('Invalid mobile format');
          flag = true;
        }

        if (
          !payee.ifsc.toString().match(this.validIfsc) ||
          this.checkEmptyValueInCells(payee.ifsc)
        ) {
          //dummy.remarks = 'Invalid IFSC format';
          payee.remarks.push('Invalid IFSC format');
          flag = true;
        }

        if (
          this.checkEmptyValueInCells(payee.accountNumber.toString()) ||
          !payee.accountNumber.toString().match(this.specialCharacterCheck)
        ) {
          //dummy.remarks = 'Error in Account Number';
          payee.remarks.push('Error in Account Number');
          flag = true;
        }

        if (
          this.checkEmptyValueInCells(payee.bankName.trim()) ||
          !payee.bankName.toString().match(this.charactersCheck) ||
          !payee.bankName.toString().match(this.specialCharacterCheck)
        ) {
          //dummy.remarks = 'Error in bank Name';
          payee.remarks.push('Error in bank Name');
          flag = true;
        }

        if (this.checkEmptyValueInCells(payee.bankAddress)) {
          //dummy.remarks = 'Branch Name is Empty';
          payee.remarks.push('Branch Name is Empty');
          flag = true;
        }

        if (this.checkEmptyValueInCells(payee.accountHolder)) {
          //dummy.remarks = 'Error in Payee Name';
          payee.remarks.push('Error in Payee Name');
          flag = true;
        }

        if (!payee.accountHolder.match(this.validAccountHolder)) {
          //dummy.remarks = 'Error in Payee Name';
          payee.remarks.push(
            'Special characters are not allowed in Payee Name'
          );
          flag = true;
        }

        // Check if file have duplicate entry of the same payee.
        payeeData.forEach(element => {
          if (element.accountNumber === payee.accountNumber) {
            payee.remarks.push('Error Duplicate Account Number');
            flag = true;
          }
        });
        if (flag) {
          this.errorData.push(payee);
        } else {
          payeeData.push(payee);
          // delete payee.remarks;
          // delete payee.rowNumber;
          this.dataToSendOnApi.push(dataForApi);
        }
      });
      this.total$ = this.errorData.length;
      //console.log('DATA !', luci);
      return payeeData;
    } else {
      this.checkForValidHeaders = true;
      return payeeData;
    }
  }

  mapExcelHeaderToUPIEnabledPayeeInterface(
    data: any[]
  ): Array<uploadPayeeData> {
    this.errorData = [];
    this.checkForValidHeaders = false;
    let payeeData: Array<uploadPayeeData> = [];

    if (data.length === 0) return payeeData;

    data.forEach((entry: any, index: number) => {
      let payee: Partial<uploadPayeeData> = {
        accountHolder: entry[this.excelHeaders[0][0]].toString(),
        mobile: entry[this.excelHeaders[0][1]].toString(),
        email: entry[this.excelHeaders[0][2]].toString(),
        accountNumber: entry[this.excelHeaders[0][3]].toString(),
        ifsc: entry[this.excelHeaders[0][4]].toString(),
        bankName: entry[this.excelHeaders[0][5]].toString(),
        bankAddress: entry[this.excelHeaders[0][6]].toString(),
        vpa: entry[this.excelHeaders[0][7]].toString()
      };

      let flag = false;
      payee.rowNumber = index + 1;
      payee.remarks = [];

      const noBankAccount =
        this.checkEmptyValueInCells(payee.accountNumber || '') ||
        this.checkEmptyValueInCells(payee.ifsc || '') ||
        this.checkEmptyValueInCells(payee.bankName || '') ||
        this.checkEmptyValueInCells(payee.bankAddress || '');

      if (this.checkEmptyValueInCells(payee.accountHolder || '')) {
        //dummy.remarks = 'Error in Payee Name';
        payee.remarks.push('Error in Payee Name');
        flag = true;
      }

      if (!(payee.accountHolder as string).match(this.validAccountHolder)) {
        //dummy.remarks = 'Error in Payee Name';
        payee.remarks.push('Special characters are not allowed in Payee Name');
        flag = true;
      }

      if (
        !payee?.email?.match(this.validEmail) ||
        this.checkEmptyValueInCells(payee?.email)
      ) {
        //dummy.remarks = 'Invalid email format';
        payee.remarks.push('Invalid email format');
        flag = true;
      }

      if (
        !this.checkNumberLength((payee?.mobile as string).toString()) ||
        this.checkEmptyValueInCells((payee?.mobile as string).toString())
      ) {
        //dummy.remarks = 'Invalid mobile format';
        payee.remarks.push('Invalid mobile format');
        flag = true;
      }

      if (noBankAccount && this.checkEmptyValueInCells(payee.vpa || '')) {
        payee.remarks.push('No bank account or VPA data found');
        flag = true;
      }

      if (!noBankAccount) {
        if (!(payee.ifsc as string).toString().match(this.validIfsc)) {
          //dummy.remarks = 'Invalid IFSC format';
          payee.remarks.push('Invalid IFSC format');
          flag = true;
        }

        if (
          !(payee.accountNumber as string)
            .toString()
            .match(this.specialCharacterCheck)
        ) {
          //dummy.remarks = 'Error in Account Number';
          payee.remarks.push('Error in Account Number');
          flag = true;
        }

        if (
          !(payee.bankName as string).toString().match(this.charactersCheck) ||
          !(payee.bankName as string)
            .toString()
            .match(this.specialCharacterCheck)
        ) {
          //dummy.remarks = 'Error in bank Name';
          payee.remarks.push('Error in bank Name');
          flag = true;
        }
      }

      if (
        !this.checkEmptyValueInCells(payee.vpa || '') &&
        !this.upiFormatRegex.test(payee.vpa as string)
      ) {
        payee.remarks.push('Invald UPI ID format');
        flag = true;
      }

      // @TODO: change checkExistingPayees function to check for UPI ID as well
      if (this.checkExistingPayees(payee as uploadPayeeData)) {
        //dummy.remarks = 'Payee already added';
        payee.remarks.push('Payee already added');
        flag = true;
      }

      // TODO: check for dubplicate entries of same payee

      if (flag) {
        this.errorData.push(payee as uploadPayeeData);
      } else {
        payeeData.push(payee as uploadPayeeData);
        delete payee['remarks'];
        this.dataToSendOnApi.push(payee as uploadPayeeApiData);
      }

      this.total$ = this.errorData.length;
      //console.log('DATA !', luci);
    });
    return payeeData;
  }

  checkExistingPayees(val: uploadPayeeData) {
    return this.linkedPayee.includes(val.accountNumber.toString());
  }

  loadData() {
    this.payeeService.performSearch(-1);
  }

  loadPage(event: any) {
    console.log('PAGE ', this.page);
  }

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
}
