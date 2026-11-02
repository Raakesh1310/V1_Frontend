import { HttpClient } from '@angular/common/http';
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
import { OtpModalComponent } from '@common/components';
import { ToastMessageData, ToastMessageOptions } from '@common/models';
import { ToastService, UtilityService } from '@common/services';
import accountsStatus from '@modules/accounts/constants/accountsStatus';
import banksTypes from '@modules/accounts/constants/banksTypes';
import { Account } from '@modules/accounts/models';
import {
  AccountPayeeService,
  AccountsService
} from '@modules/accounts/services';
import { Merchant } from '@modules/auth/models/merchant.model';
import { MerchantProfile } from '@modules/auth/models/merchantProfile.model';
import { AuthService } from '@modules/auth/services';
import { HDFCBankMerchantProfile } from '@modules/profile/models/hdfcAccounts';
import { IBLBankMerchantProfile } from '@modules/profile/models/iblAccounts';
import { ProfileResponseModel } from '@modules/profile/models/profile-response.model';
import { YesBankMerchantProfile } from '@modules/profile/models/yesAccount';
import { ProfileService } from '@modules/profile/services';
import ApiTransferTypes from '@modules/transfers/constants/ApiTransferTypes';
import InputTransferTypes from '@modules/transfers/constants/InputTransferTypes';
import banksAllowedUPI from '@modules/transfers/constants/banksAllowedUPI';
import {
  AuthModel,
  AuthTransferStruct,
  TransferDocumentDetail
} from '@modules/transfers/models';
import {
  ExcelAccountFormat,
  ExcelApiAccountFormat
} from '@modules/transfers/models/create-transfer-response.model';
import { BulkTransferService } from '@modules/transfers/services/bulk-transfers.service';
import { TransferDocumentService } from '@modules/transfers/services/transfer-document.service';
import { S3FolderName } from '@modules/vpa/constants/s3FolderNameConstants';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import _ from 'lodash';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import * as XLSX from 'xlsx';
import smsMsg91TemplateId from '../../../../config/smsMsg91TemplateId';
import banksAllowedIMPS from '@modules/transfers/constants/banksAllowedIMPS';
import { environment } from '../../../../environments/environment';
import { IDFCBankMerchantProfile } from '@modules/profile/models/idfcAccount';
import { BankAccount } from '@modules/bank-account/models';
import { TransfersService } from '@modules/transfers/services';

enum BulkTransferStatus {
  upload,
  submit,
  moveToTransferList,
  error
}

enum tableStatus {
  all,
  success,
  failed
}

@Component({
  selector: 'sbpro-bulk-transfer',
  templateUrl: './bulk-transfer.component.pug',
  styleUrls: ['./bulk-transfer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BulkTransferComponent implements OnInit {
  @Input() parentSubject!: Subject<Number>;
  @ViewChild('inputFile') inputFile!: ElementRef;
  @ViewChild('uploadButton') uploadButton!: ElementRef;
  @ViewChild('AllCard') allCard!: ElementRef;
  @ViewChild('successCard') successCard!: ElementRef;
  @ViewChild('failedCard') failedCard!: ElementRef;
  states = BulkTransferStatus;
  bulkTransferStatus: BulkTransferStatus = BulkTransferStatus.upload;
  uploadedFileName = '';
  tableStatuses: tableStatus = tableStatus.all;
  tables = tableStatus;
  errors: string[] = [];
  data: Array<ExcelAccountFormat> = [];
  errorData: Array<ExcelAccountFormat> = [];
  successData: Array<ExcelAccountFormat> = [];
  allData: Array<ExcelAccountFormat> = [];
  dataToSendOnApi: Array<ExcelApiAccountFormat> = [];
  accounts!: Account[];
  selectedAccount: any = null;
  submitted = false;
  totalEntries = 0;
  successEntries = 0;
  falseEntries = 0;
  totalApiAmount = 0;
  totalEntriesAmount: number = 0;
  successEntriesAmount: number = 0;
  falseEntriesAmount: number = 0;
  totalEntriesAmt: string = '';
  successEntriesAmt: string = '';
  falseEntriesAmt: string = '';
  batchName: string = '';
  validIfsc = /^[A-Za-z]{4}0[\dA-Za-z]{6}$/;
  specialCharacterCheckForAccNo = /^[A-Za-z0-9]*$/;
  specialCharacterCheck = /^[A-Za-z0-9 ]*$/;
  upiFormatRegex = /^[a-zA-Z0-9.\\-_]{2,256}@[a-zA-Z]{2,64}$/;
  charactersCheck = /^[A-Za-z ]*$/;
  numbersCheck = /^[0-9]*$/;
  twoDecimalCheck = /^\d*\.?\d{0,2}$/;
  payeesOfSelectedAccount: string[] = [];
  downloadFileUrl = '';
  sampleFileUrl = '../../../../assets/sample-files/Bulk_Transfer_Sample.xlsx';
  sampleFileUrlICICI =
    '../../../../assets/sample-files/Bulk_Transfer_Sample_ICICI.xlsx';
  sampleFileUrlTransferType =
    '../../../../assets/sample-files/Bulk_Transfer_Sample_Transfer_Type.xlsx';
  sampleUPIFileUrl = '../../../../assets/sample-files/UPI_Bulk_File.xlsx';

  isYesBank = false;
  isHdfcBank = false;
  isIblBank = false;
  isRblBank = false;
  isDBSBank = false;
  isIDFCBank = false;
  upiPayoutEnabled = false;
  shouldAllowBulkUpiFile = false;
  isUPIBulkTransfer = false;
  excelHeaders: Array<Array<String | Number>> = [
    [
      'Beneficiary Name (Mandatory)',
      'Beneficiary Account number (Mandatory)',
      'IFSC code (Mandatory)',
      'Bank Name',
      'Amount (Mandatory)',
      'Description / Purpose (Optional)',
      'Email ID (notification will be sent) - (Optional)'
    ]
  ];
  upiExcelHeaders: Array<string> = [
    'Beneficiary Name (Mandatory)',
    'Beneficiary UPI ID (Mandatory)',
    'Amount (Mandatory)',
    'Purpose',
    'Email ID'
  ];
  id: number = 1;
  total$!: number;
  email_regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  page = 1;
  pageSize = 10;
  hideAllFailed = false;
  public isAdmin = false;

  uploading = false;

  formatsAllowed = '.png,.jpg,.pdf,.xlsx,.xls,.csv,.doc,.docx';

  fileExtentionRegex = new RegExp(
    `^.*(${this.formatsAllowed.split(',').join('|')})$`
  );
  uploadedDocuments: TransferDocumentDetail[] = [];
  @ViewChild('myInput')
  myInputVariable: ElementRef | null = null;
  modalRef: NgbModalRef | undefined;

  dropdownListMerchantAuthorizers: AuthModel[] = [];
  selectedMerchantAuthorizers: AuthModel[] = [];

  dropdownListAccountAuthorizers: AuthModel[] = [];
  selectedAccountAuthorizers: AuthModel[] = [];

  showMerchantAuthorizer = false;
  showAccountAuthorizer = false;
  isIMPS = false;
  uploadInProgress = false;

  dropdownSettings = {};

  merchants: Merchant[] = [];
  selectedMerchant: Merchant | undefined;
  merchantProfile: MerchantProfile | undefined;
  isBulkPayeeEnabled: boolean | undefined = false;

  icici = false;
  rbl = false;
  yes_bank = false;
  idfc = false;
  hdfc = false;
  ibl = false;
  dbs = false;
  axis = false;

  bankCount = 0;
  bank = '';
  templateError: boolean = false;
  downloadFolderName = S3FolderName.BULK_TRANSFERS;
  bankAccounts: any;
  selectedBankAccount: any = null;
  @Input() connectedBanking!: boolean;
  activeBalance!: number;
  constructor(
    private spinner: NgxSpinnerService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private accountService: AccountsService,
    private utilService: UtilityService,
    private accountPayeeService: AccountPayeeService,
    private modalService: NgbModal,
    private httpClient: HttpClient,
    private router: Router,
    private authService: AuthService,
    private profileService: ProfileService,
    private transferDocumentService: TransferDocumentService,
    private bulkTransferService: BulkTransferService,
    private utilityService: UtilityService,
    private transferService: TransfersService,
  ) {
    localStorage.removeItem('transfer_bool');
    this.isAdmin = this.authService.isSuperAdmin();
  }

  ngOnInit(): void {
    this.dropdownListMerchantAuthorizers = [];
    this.dropdownListAccountAuthorizers = [];
    this.selectedMerchantAuthorizers = [];
    this.selectedAccountAuthorizers = [];

    this.dropdownSettings = {
      singleSelection: false,
      text: 'Authorizer(s)',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: 'myclass custom-class'
    };

    this.parentSubject.subscribe(val => {
      // console.log('CHANGES bar chart', val);
      if (val === 1) {
        console.log(val);
        this.bulkTransferStatus = BulkTransferStatus.upload;
        this.errors = [];
        this.selectedAccount = null;
        this.submitted = false; // to enable select account...
        this.data = [];
        this.errorData = [];
        this.successData = [];
        this.allData = [];
        this.dataToSendOnApi = [];
        this.cdr.detectChanges();
        //this.ngOnInit();
      }
    });
    if (!this.isAdmin && !this.connectedBanking) {
      // get accounts
      this.accountService.isAuto = false;
      this.accountService.performSearch(accountsStatus.ACTIVE);
      this.accountService.account$.subscribe(resp => {
        console.log('ALL ACCOUNTS ', resp);
        if (resp) {
          this.accounts = resp;

          this.accounts.forEach((account: Account) => {
            if (account.bank === banksTypes.ICICI) {
              this.icici = true;
              this.bankCount += 1;
            } else if (account.bank === banksTypes.RBL) {
              this.rbl = true;
              this.bankCount += 1;
            } else if (account.bank === banksTypes.YES_BANK) {
              this.yes_bank = true;
              this.bankCount += 1;
            } else if (account.bank === banksTypes.IDFC) {
              this.idfc = true;
              this.bankCount += 1;
            } else if (account.bank === banksTypes.HDFC) {
              this.hdfc = true;
              this.bankCount += 1;
            } else if (account.bank === banksTypes.IBL) {
              this.ibl = true;
              this.bankCount += 1;
            } else if (account.bank === banksTypes.DBS) {
              this.dbs = true;
              this.bankCount += 1;
            } else if (account.bank === banksTypes.AXIS) {
              this.axis = true;
              this.bankCount += 1;
            }
          });

          this.cdr.detectChanges();
        }
      });
    } else if (this.isAdmin) {
      this.getMerchants('');
    }

    // Update Merchant Profile and Bank Accounts
    this.getMerchantProfile();
    if (this.connectedBanking) {
      this.getBankAccounts();
    }
  }

  /**
   * Get Merchant
   * Profile
   */
  getMerchantProfile() {
    // Check Merchant Profile
    this.profileService
      .getProfile(
        this.isAdmin ? this.selectedMerchant!.merchantId : null,
        false
      )
      .subscribe((resp: ProfileResponseModel) => {
        this.merchantProfile = resp.result;
        this.isBulkPayeeEnabled = resp.result.isBulkPayeeEnabled;
        this.sampleFileUrl = this.isBulkPayeeEnabled
          ? '../../../../assets/sample-files/Bulk_Transfer_Sample_Payee.xlsx'
          : this.sampleFileUrl;
        this.sampleFileUrlTransferType = this.isBulkPayeeEnabled
          ? '../../../../assets/sample-files/Bulk_Transfer_Sample_Transfer_Type_Payee.xlsx'
          : this.sampleFileUrlTransferType;

        const bankAllowsUPI = !!_.filter(resp.result.banks, bank =>
          banksAllowedUPI.includes(bank.bankName)
        ).length;
        this.shouldAllowBulkUpiFile =
          bankAllowsUPI && resp.result.upiPayoutEnabled;
        this.cdr.detectChanges();
      });
  }

  getMerchants(term: string) {
    this.accountService.getMerchants(term);

    this.accountService.merchant$.subscribe(resp => {
      this.merchants = resp;
      this.cdr.detectChanges();
    });
  }

  /**
   * Get List of
   * Escrow Accounts
   */
  getAccounts() {
    this.accountService.isAuto = false;
    if (this.isAdmin)
      this.accountService.merchantId = this.selectedMerchant?.merchantId || '';
    this.accountService.performSearch(accountsStatus.ACTIVE);
    this.accountService.account$.subscribe(resp => {
      console.log('ALL ACCOUNTS ', resp);
      if (resp) {
        this.accounts = resp;
        this.accounts.forEach((account: Account) => {
          if (account.bank === banksTypes.ICICI) {
            this.icici = true;
            this.bankCount += 1;
          } else if (account.bank === banksTypes.RBL) {
            this.rbl = true;
            this.bankCount += 1;
          } else if (account.bank === banksTypes.YES_BANK) {
            this.yes_bank = true;
            this.bankCount += 1;
          } else if (account.bank === banksTypes.IDFC) {
            this.idfc = true;
            this.bankCount += 1;
          } else if (account.bank === banksTypes.HDFC) {
            this.hdfc = true;
            this.bankCount += 1;
          } else if (account.bank === banksTypes.IBL) {
            this.ibl = true;
            this.bankCount += 1;
          } else if (account.bank === banksTypes.DBS) {
            this.dbs = true;
            this.bankCount += 1;
          } else if (account.bank === banksTypes.AXIS) {
            this.axis = true;
            this.bankCount += 1;
          }
        });
        this.cdr.detectChanges();
      }
    });
  }

  downloadFile($event: Event, docHash: string, docName?: string) {
    this.utilityService.downloadFile(
      $event,
      docHash,
      this.downloadFolderName,
      docName
    );
  }
  /**
   * A function to upload the given file.
   * It will save the documents id in local storage.
   * @param $event
   */
  onfileChange($event: any) {
    $event.preventDefault();
    this.uploading = true;
    for (let file of $event.target.files) {
      this.uploading = true;
      if (!this.fileExtentionRegex.test(file.name)) {
        this.showToast('Error', `File format not allowed.`, {
          headerClasses: 'bg-danger text-white'
        });
        this.uploading = false;
        continue;
      }
      const formdata = new FormData();
      formdata.append('file', file);
      this.transferDocumentService.uploadDocument(formdata, true).subscribe(
        (resp: any) => {
          const result = resp.result as TransferDocumentDetail;

          localStorage.setItem('account_bool', 'false');
          console.log('ACCOUNT BOOL SET TO TRUE');
          this.uploading = false;
          if (resp.success) {
            this.uploadedDocuments.push({
              ...result
            });
            console.log(resp);
          } else {
            console.log(resp);
          }
          this.cdr.detectChanges();
        },
        err => {
          this.uploading = false;
          console.log(err.error.errors);
          this.errors = err.error.errors;
          this.cdr.detectChanges();
        }
      );
      this.cdr.detectChanges();
    }
    if (this.myInputVariable) {
      this.myInputVariable.nativeElement.value = null;
    }
  }

  docUp() {
    const element: HTMLElement = document.getElementById(
      'uploadDocs'
    ) as HTMLElement;
    element.click();
  }

  /**
   * A function to remove the given document.
   * @param docId string
   */
  deleteDoc(docId: string) {
    let docIndex = this.uploadedDocuments.findIndex(
      (doc: TransferDocumentDetail) => doc.documentId === docId
    );
    this.uploadedDocuments[docIndex].deleting = true;
    this.transferDocumentService.deleteDocument(docId).subscribe(
      (resp: any) => {
        console.log(resp);
        // localStorage.setItem('account_bool', 'true');
        // console.log('ACCOUNT BOOL SET TO FALSE');
        if (resp.success) {
          this.uploadedDocuments = this.uploadedDocuments.filter(
            doc => doc.documentId !== docId
          );
          this.cdr.detectChanges();
        } else {
          /**
           * show toast here
           */
          this.showToast('Error', `Document could not be deleted.`, {
            headerClasses: 'bg-danger text-white'
          });
        }
        this.uploadedDocuments[docIndex].deleting = false;
        this.cdr.detectChanges();
      },
      err => {
        console.log(err.error.errors);
        this.errors = err.error.errors;
        this.showToast(
          'Error',
          `Document could not be deleted. ${err.error?.errors[0]?.message}`,
          {
            headerClasses: 'bg-danger text-white'
          }
        );
        this.uploadedDocuments = this.uploadedDocuments.filter(
          doc => doc.documentId !== docId
        );
        this.cdr.detectChanges();
      }
    );
    this.cdr.detectChanges();
  }

  getBankAccounts() {
    this.bulkTransferService.getBankAccounts().subscribe((resp: any) => {
      this.bankAccounts = resp.result;
      this.bankAccounts.forEach((bankAccount: BankAccount) => {
        switch (bankAccount.bankName) {
          case banksTypes.ICICI:
            this.icici = true;
            this.bankCount += 1;
            break;
          case banksTypes.RBL:
            this.rbl = true;
            this.bankCount += 1;
            break;
          case banksTypes.YES_BANK:
            this.yes_bank = true;
            this.bankCount += 1;
            break;
          case banksTypes.IDFC:
            this.idfc = true;
            this.bankCount += 1;
            break;
          case banksTypes.HDFC:
            this.hdfc = true;
            this.bankCount += 1;
            break;
          case banksTypes.IBL:
            this.ibl = true;
            this.bankCount += 1;
            break;
          case banksTypes.DBS:
            this.dbs = true;
            this.bankCount += 1;
            break;
          case banksTypes.AXIS:
            this.axis = true;
            this.bankCount += 1;
            break;
          default:
          //defaut case
        }
      });
      this.cdr.detectChanges();
    });
  }

  // modal functions
  //tslint:disable-next-line:no-any
  openModal(modal: any) {
    // this.uploadedDocuments = [];
    this.modalRef = this.modalService.open(modal);
  }

  closeModal() {
    this.modalRef?.close();
  }

  /**
   * Gets Accounts
   * for selected
   * Merchant
   * @param event
   */
  updateMerchant(event: any) {
    this.getMerchantProfile();
    this.getAccounts();
    // Commenting out this implementation, above functions should handle
    // this.accountService.merchantId = this.selectedMerchant?.merchantId || '';
    // this.accountService.performSearch(accountsStatus.ACTIVE);
    // this.accountService.account$.subscribe(e => {
    //   this.accounts = e;
    //   this.cdr.detectChanges();
    // });
  }

  openUpload() {
    if (!this.connectedBanking && this.selectedAccount === null) {
      let toastHead = 'File Upload Error';
      let toastBody = 'Select An Digital Escrow First';

      this.showToast(toastHead, toastBody, {
        headerClasses: 'bg-danger text-white'
      });
    } else if (this.connectedBanking && !this.selectedBankAccount) {
      let toastHead = 'File Upload Error';
      let toastBody = 'Select An Bank Account First';

      this.showToast(toastHead, toastBody, {
        headerClasses: 'bg-danger text-white'
      });
    } else {
      if (this.bulkTransferStatus !== BulkTransferStatus.moveToTransferList) {
        console.log('OPENING EXCEL SELECTOR');
        this.inputFile.nativeElement.click(); // will trigger uploadExcel Function...
        this.submitted = true; // to disable select account...
        if (!this.connectedBanking) {
          this.accountPayeeService.getLinkedPayee(
            this.selectedAccount.accountId
          );
          this.payeesOfSelectedAccount = [];
          this.accountPayeeService.payees$.subscribe(res => {
            res.forEach(it => {
              this.payeesOfSelectedAccount.push(it.accountNumber);
            });
          });
          console.log('LINKED PAYEES ', this.payeesOfSelectedAccount);
        }
      }
    }
  }

  uploadExcel(event: any) {
    this.data = [];
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
      this.data = this.mapExcelHeaderToPayeeInterface(data);
      if (this.data.length === 0) {
        this.bulkTransferStatus = BulkTransferStatus.error;
        this.cdr.detectChanges();
        return;
      }

      //Validate Payees in case of Bulk Transfer to Payees
      if (this.isBulkPayeeEnabled) {
        // tslint:disable-next-line:no-any
        const body: any = {};
        body.transferList = this.dataToSendOnApi;
        this.uploadInProgress = true;
        this.spinner.show();
        this.bulkTransferService
          .validatePayees(
            body,
            this.isAdmin,
            this.selectedMerchant?.merchantId || ''
          )
          .subscribe(
            (resp: any) => {
              if (resp.result.invalidTransfers.length > 0) {
                this.errorData = [
                  ...this.errorData,
                  ...resp.result.invalidTransfers
                ];
                this.spinner.hide();
                this.uploadInProgress = false;
                this.successEntries = this.successData.length;
                // @ts-ignore
                this.totalEntriesAmt = this.convertToIndianCurrency(
                  this.totalEntriesAmount as number
                );
                this.totalApiAmount = this.successEntriesAmount as number;
                // @ts-ignore
                this.successEntriesAmt = this.convertToIndianCurrency(
                  this.successEntriesAmount as number
                );
                // @ts-ignore
                this.falseEntriesAmt = this.convertToIndianCurrency(
                  this.falseEntriesAmount as number
                );
                this.mapPayeeFailures();
                this.cdr.detectChanges();
              } else {
                this.spinner.hide();
                this.postUploadDisplay();
              }
            },
            err => {
              if (err.status === 0) {
                this.errors = ['Connection Error'];
              } else {
                this.errors = err.error.errors;
              }
              this.cdr.detectChanges();
              this.spinner.hide();
              this.postUploadDisplay();
            }
          );
      } else {
        this.postUploadDisplay();
      }
    };
    reader.readAsBinaryString(target.files[0]);
  }

  //Display result after upload
  postUploadDisplay() {
    this.falseEntries = this.errorData.length;
    this.successEntries = this.successData.length;
    // @ts-ignore
    this.totalEntriesAmt = this.convertToIndianCurrency(
      this.totalEntriesAmount as number
    );
    this.totalApiAmount = this.successEntriesAmount as number;
    // @ts-ignore
    this.successEntriesAmt = this.convertToIndianCurrency(
      this.successEntriesAmount as number
    );
    // @ts-ignore
    this.falseEntriesAmt = this.convertToIndianCurrency(
      this.falseEntriesAmount as number
    );

    if (
      !this.connectedBanking &&
      Math.round(this.totalApiAmount * 100) / 100 >
      Math.round(this.selectedAccount.balance * 100) / 100
    ) {
      this.errors.push('Escrow balance is less than total transfer amount');
    }

    this.bulkTransferStatus = BulkTransferStatus.submit; // to show table
    if (this.falseEntries > 0) {
      this.errors.push(
        'Invalid Entries found, Please re-Upload the file with valid Entries.'
      );
      this.hideAllFailed = false;
    } else {
      this.hideAllFailed = true;
      localStorage.setItem('transfer_bool', 'false');
      this.total$ = this.data.length;
    }
    this.cdr.detectChanges();
    if (this.falseEntries > 0) {
      this.changeTableStatusAndData(tableStatus.failed);
    } else {
      this.changeTableStatusAndData(tableStatus.success);
    }
    console.log('DATA ', this.data);
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

  mapExcelHeaderToPayeeInterface(data: Array<any>): Array<ExcelAccountFormat> {
    this.dataToSendOnApi = [];
    this.errorData = [];
    this.successData = [];
    this.allData = [];
    this.falseEntriesAmount = 0;
    this.successEntriesAmount = 0;
    this.totalEntriesAmount = 0;

    //Check if data there and iterate
    if (data.length > 0 && this.checkObjectKeys(data[0])) {
      this.totalEntries = data.length;
      data.forEach((it: object, index: number) => {
        let dataForApi: ExcelApiAccountFormat = this.isBulkPayeeEnabled
          ? {
            // @ts-ignore
            amount: it['Amount (Mandatory)'],
            // @ts-ignore
            payeeId: it['PayeeId (Mandatory)'].toString().trim(),
            // @ts-ignore
            beneficiaryName: String(it['Beneficiary Name (Mandatory)'] || ''),
            // @ts-ignore
            purpose: it['Description / Purpose (Optional)']
          }
          : {
            // @ts-ignore
            amount: it['Amount (Mandatory)'],
            // @ts-ignore
            beneficiaryAccNumber: it[
              'Beneficiary Account number (Mandatory)'
            ].toString(),
            // @ts-ignore
            beneficiaryIFSC: it['IFSC code (Mandatory)'],
            // @ts-ignore
            beneficiaryName: String(it['Beneficiary Name (Mandatory)'] || ''),
            // @ts-ignore
            purpose: it['Description / Purpose (Optional)'],
            // @ts-ignore
            beneficiaryBankName: it['Bank Name'],
            // @ts-ignore
            payeeEmailId: (it as any)[
              'Email ID (notification will be sent) – (Optional)'
            ]
          };

        // @ts-ignore
        let transfer: ExcelAccountFormat = this.isBulkPayeeEnabled
          ? {
            // @ts-ignore
            amount: it['Amount (Mandatory)'],
            // @ts-ignore
            payeeId: it['PayeeId (Mandatory)'].toString().trim(),
            // @ts-ignore
            beneficiaryName: String(it['Beneficiary Name (Optional)'] || ''),
            // @ts-ignore
            purpose: it['Description / Purpose (Optional)'],
            // @ts-ignore
            rejectionReason: '',
            // @ts-ignore
            status: ''
          }
          : {
            // @ts-ignore
            amount: it['Amount (Mandatory)'],
            // @ts-ignore
            beneficiaryAccNumber: it[
              'Beneficiary Account number (Mandatory)'
            ].toString(),
            // @ts-ignore
            beneficiaryIFSC: it['IFSC code (Mandatory)'],
            // @ts-ignore
            beneficiaryName: String(it['Beneficiary Name (Mandatory)'] || ''),
            // @ts-ignore
            purpose: it['Description / Purpose (Optional)'],
            // @ts-ignore
            rejectionReason: '',
            // @ts-ignore
            status: '',
            // @ts-ignore
            beneficiaryBankName: it['Bank Name'],
            // @ts-ignore
            payeeEmailId: (it as any)[
              'Email ID (notification will be sent) – (Optional)'
            ]
          };

        if (this.connectedBanking) {
          transfer['bankAccount'] = this.selectedBankAccount.bankAccountNumber;
        } else {
          transfer['virtualAccount'] = this.selectedAccount.accountId;
        }
        // Add Yes Bank Entry in both objects;
        // if (this.isYesBank || this.isHdfcBank || this.isIblBank) {
        // @ts-ignore
        dataForApi.transferType = ApiTransferTypes[it['Transfer Type']];
        // @ts-ignore
        transfer.transferType = it['Transfer Type'];
        // }

        if (!dataForApi.transferType) {
          dataForApi.transferType = ApiTransferTypes.N;
        }

        let isInvalid = false;
        transfer.rejectionReason = [];
        transfer.rowNumber = index + 1;

        //Check Payee Id field for Bulk Payee Enabled
        if (
          !this.connectedBanking &&
          this.isBulkPayeeEnabled &&
          !transfer.payeeId
        ) {
          transfer.rejectionReason.push('Payee Id Not Provided');
          isInvalid = true;
        } else {
          if (
            transfer.payeeId &&
            (this.checkEmptyValueInCells(transfer.payeeId.toString()) ||
              !transfer.payeeId.toString().match(this.specialCharacterCheck))
          ) {
            transfer.rejectionReason.push('Error in PayeeId Value');
            isInvalid = true;
          }
        }

        if (!(/^[a-zA-Z0-9 ]*$/).test(transfer.purpose)) {
          transfer.rejectionReason.push('Special Characters in Purpose');
          isInvalid = true;
        }

        //Check Beneficiary IFSC
        if (!this.isBulkPayeeEnabled && !transfer.beneficiaryIFSC) {
          transfer.rejectionReason.push('Beneficiary IFSC Not Provided');
          isInvalid = true;
        } else {
          if (
            transfer.beneficiaryIFSC &&
            (this.checkEmptyValueInCells(transfer.beneficiaryIFSC) ||
              !transfer.beneficiaryIFSC.toString().match(this.validIfsc))
          ) {
            //dummy.rejectionReason = 'Error in IFSC';
            transfer.rejectionReason.push('Error in IFSC Value');
            isInvalid = true;
          }
        }

        //Check Beneficiary Account Number
        if (!this.isBulkPayeeEnabled && !transfer.beneficiaryAccNumber) {
          transfer.rejectionReason.push('Beneficiary Acc Number Not Provided');
          isInvalid = true;
        } else {
          if (
            transfer.beneficiaryAccNumber &&
            (this.checkEmptyValueInCells(
              transfer.beneficiaryAccNumber.toString()
            ) ||
              !transfer.beneficiaryAccNumber
                .toString()
                .match(this.specialCharacterCheckForAccNo) ||
              transfer.beneficiaryAccNumber.length < 9)
          ) {
            //dummy.rejectionReason = 'Error in Beneficiary Account Number';
            transfer.rejectionReason.push(
              'Error in Beneficiary Account Number'
            );
            isInvalid = true;
          }
        }

        //Check Beneficiary Name
        if (!this.isBulkPayeeEnabled && !transfer.beneficiaryName) {
          transfer.rejectionReason.push('Beneficiary Name Not Provided');
          isInvalid = true;
      } else {
          if (
              transfer.beneficiaryName &&
              (this.checkEmptyValueInCells(transfer.beneficiaryName) ||
              //  (!isNaN(Number(transfer.beneficiaryName)) && typeof transfer.beneficiaryName !== 'string') || 
               !transfer.beneficiaryName.toString().match(this.specialCharacterCheck))
          ) {
              transfer.rejectionReason.push(
                  'Special Characters not Allowed in Beneficiary Name'
              );
              isInvalid = true;
          }
      }
      

        if (
          (!this.isBulkPayeeEnabled &&
            transfer.beneficiaryBankName === undefined) ||
          transfer.beneficiaryBankName === null
        ) {
          //dummy.rejectionReason = 'Error in Bank Name';
          transfer.rejectionReason.push('Error in File Headers');
          isInvalid = true;
        } else if (
          !this.isBulkPayeeEnabled &&
          transfer.beneficiaryBankName &&
          (!transfer.beneficiaryBankName
            .toString()
            .match(this.charactersCheck) ||
            !transfer.beneficiaryBankName
              .toString()
              .match(this.specialCharacterCheck))
        ) {
          //dummy.rejectionReason = 'Error in Bank Name';
          transfer.rejectionReason.push('Error in Bank Name');
          isInvalid = true;
        }

        // Check for Yes Bank Transfer Types;
        if (
          // (this.isYesBank || this.isHdfcBank || this.isIblBank) &&
          transfer.transferType != undefined &&
          transfer.transferType != ''
        ) {
          if (
            !this.isIMPS &&
            transfer.transferType === InputTransferTypes.IMPS
          ) {
            transfer.rejectionReason.push('IMPS transfer is not allowed');
            isInvalid = true;
          } else if (
            !Object.values(InputTransferTypes).includes(
              transfer.transferType as string
            )
          ) {
            transfer.rejectionReason.push(
              'Transfer Type should be a value in "I", "N", "R", "FT".'
            );
            isInvalid = true;
          } else if (
            transfer?.amount! < 200000 &&
            transfer.transferType === InputTransferTypes.RTGS
          ) {
            transfer.rejectionReason.push(
              'Amount for RTGS transfers should be greater than or equal to 200000'
            );
            isInvalid = true;
          } else if (
            transfer?.amount! > 500000 &&
            transfer.transferType === InputTransferTypes.IMPS
          ) {
            transfer.rejectionReason.push(
              'Amount for IMPS transfers should be lesser than or equal to 500000'
            );
            isInvalid = true;
          } else if (
            !this.isBulkPayeeEnabled &&
            transfer.beneficiaryIFSC &&
            !transfer.beneficiaryIFSC.startsWith('YESB') &&
            transfer.transferType === InputTransferTypes.FT
          ) {
            transfer.rejectionReason.push(
              '"FT" transfers are only allowed in Yes bank beneficiary.'
            );
            isInvalid = true;
          } else if (
            !this.isBulkPayeeEnabled &&
            transfer.beneficiaryIFSC &&
            !transfer.beneficiaryIFSC.startsWith('HDFC') &&
            transfer.transferType === InputTransferTypes.A2A
          ) {
            transfer.rejectionReason.push(
              '"A2A" transfers are only allowed in HDFC bank beneficiary.'
            );
            isInvalid = true;
          }
        } else {
          if (
            this.isYesBank ||
            this.isHdfcBank ||
            this.isIblBank ||
            this.isIDFCBank
          ) {
            transfer.rejectionReason.push('Empty Transfer Type not allowed.');
            isInvalid = true;
          }

          transfer.transferType = 'N';

          if (
            !this.connectedBanking &&
            this.selectedAccount.bank === banksTypes.ICICI
          ) {
            if (transfer.amount >= 200000) {
              transfer.transferType = 'R';
            } else {
              transfer.transferType = 'N';
            }
          }
        }
        // regex to check if emailId is valid email.
        if (
          transfer.payeeEmailId &&
          !this.email_regex.test(transfer.payeeEmailId)
        ) {
          transfer.rejectionReason.push('Error in Optional Email Id Provided.');
          isInvalid = true;
        }

        if (
          this.checkEmptyValueInCells(transfer.amount.toString()) ||
          !transfer.amount.toString().match(this.twoDecimalCheck)
        ) {
          //dummy.rejectionReason = 'Error in Amount';
          transfer.rejectionReason.push('Error in Amount');
          isInvalid = true;
        }

        if (transfer.amount < 1) {
          transfer.rejectionReason.push('Transfer Amount must greater than 1');
          isInvalid = true;
        }
        
        if (isInvalid) {
          transfer.status = 'Failed';
          if (transfer.amount!.toString().match(this.twoDecimalCheck)) {
            // @ts-ignore
            this.falseEntriesAmount += Number(transfer.amount);
          }
          this.errorData.push(transfer as ExcelAccountFormat);
        } else {
          transfer.status = 'Success';
          if (transfer.amount!.toString().match(this.twoDecimalCheck)) {
            // @ts-ignore
            this.successEntriesAmount += Number(transfer.amount);
          }
          this.successData.push(transfer as ExcelAccountFormat);
          this.dataToSendOnApi.push(dataForApi as ExcelApiAccountFormat);
        }
        this.allData.push(transfer as ExcelAccountFormat);
        if (transfer.amount!.toString().match(this.twoDecimalCheck)) {
          // @ts-ignore
          this.totalEntriesAmount += Number(transfer.amount);
        }
      });
      return this.allData;
    } else {
      return this.allData;
    }
  }

  mapExcelUPIHeaderToPayeeInterface(
    data: Array<any>
  ): Array<ExcelAccountFormat> {
    this.dataToSendOnApi = [];
    this.errorData = [];
    this.successData = [];
    this.allData = [];
    this.falseEntriesAmount = 0;
    this.successEntriesAmount = 0;
    this.totalEntriesAmount = 0;

    if (data.length === 0) return [];

    for (let property of this.upiExcelHeaders) {
      if (!(property in data[0])) return [];
    }

    data.forEach((it: any, index: number) => {
      let transfer: Partial<ExcelAccountFormat> = {
        rowNumber: index + 1,
        beneficiaryName: it[this.upiExcelHeaders[0]],
        beneficiaryVPA: it[this.upiExcelHeaders[1]],
        amount: it[this.upiExcelHeaders[2]],
        purpose: it[this.upiExcelHeaders[3]],
        payeeEmailId: it[this.upiExcelHeaders[4]],
        status: '',
        rejectionReason: []
      };

      if (this.connectedBanking) {
        transfer['bankAccount'] = this.selectedBankAccount.bankAccountNumber;
      } else {
        transfer['virtualAccount'] = this.selectedAccount.accountId;
      }

      let isInvalid = false;

      if (
        transfer.payeeEmailId &&
        !this.email_regex.test(transfer.payeeEmailId)
      ) {
        transfer.rejectionReason!.push('Error in Optional Email Id Provided.');
        isInvalid = true;
      }

      // validation for beneficiary name, vpa and amount values
      if (
        this.checkEmptyValueInCells(transfer.beneficiaryName!) ||
        transfer.beneficiaryName!.toString().match(this.numbersCheck) ||
        !transfer.beneficiaryName!.toString().match(this.specialCharacterCheck)
      ) {
        //dummy.rejectionReason = 'Error in Payee Name';
        transfer.rejectionReason!.push('Error in Payee Name');
        isInvalid = true;
      }

      // TODO : add vpa verification using api once RBL bank service is done
      if (this.checkEmptyValueInCells(transfer.beneficiaryVPA!)) {
        transfer.rejectionReason!.push('Error in Beneficiary UPI ID');
        isInvalid = true;
      }

      if (!this.upiFormatRegex.test(transfer.beneficiaryVPA!)) {
        transfer.rejectionReason!.push('UPI ID format is incorrect');
        isInvalid = true;
      }

      if (
        this.checkEmptyValueInCells(transfer.amount!.toString()) ||
        !transfer.amount!.toString().match(this.twoDecimalCheck)
      ) {
        //dummy.rejectionReason = 'Error in Amount';
        transfer.rejectionReason!.push('Error in Amount');
        isInvalid = true;
      }

      // amount for UPI cannot be more than 1 lac
      if (transfer.amount! > 100000) {
        transfer.rejectionReason!.push(
          'For UPI, transfer amount cannot be more than 1 Lac'
        );
        isInvalid = true;
      }

      if (isInvalid) {
        transfer.status = 'Failed';
        if (transfer.amount!.toString().match(this.twoDecimalCheck))
          this.falseEntriesAmount += transfer.amount as number;
        this.errorData.push(transfer as ExcelAccountFormat);
      } else {
        transfer.status = 'Success';
        if (transfer.amount!.toString().match(this.twoDecimalCheck))
          this.successEntriesAmount += transfer.amount as number;
        this.successData.push(transfer as ExcelAccountFormat);
      }

      this.allData.push(transfer as ExcelAccountFormat);
      const transferDataForAPI = { ...transfer };
      delete transferDataForAPI['rowNumber'];
      delete transferDataForAPI['rejectionReason'];
      delete transferDataForAPI['status'];
      delete transferDataForAPI['virtualAccount'];
      this.dataToSendOnApi.push(transferDataForAPI as ExcelAccountFormat);
    });

    this.falseEntries = this.errorData.length;
    this.successEntries = this.successData.length;
    // @ts-ignore
    this.totalEntriesAmount = this.convertToIndianCurrency(
      this.totalEntriesAmount
    );
    this.totalApiAmount = this.successEntriesAmount;
    // @ts-ignore
    this.successEntriesAmount = this.convertToIndianCurrency(
      this.successEntriesAmount
    );
    // @ts-ignore
    this.falseEntriesAmount = this.convertToIndianCurrency(
      this.falseEntriesAmount
    );
    if (this.totalApiAmount > this.selectedAccount.balance) {
      this.errors.push('Escrow balance is less than total transfer amount');
    }

    return this.allData;
  }

  checkEmptyValueInCells(val: string): boolean {
    return val === '';
  }

  changeTableStatusAndData(val: tableStatus) {
    console.log('changeTableStatusAndData called ', val);
    switch (val) {
      case tableStatus.all: {
        this.allCard.nativeElement.style.border = 'medium solid #EEA10C';
        this.failedCard.nativeElement.style.border = '';
        this.successCard.nativeElement.style.border = '';
        this.addClass(1); // to add statusBorderClass to element on click
        this.page = 1; // assigning page number on card click
        this.tableStatuses = val;
        this.totalEntries = this.allData.length;
        this.total$ = this.allData.length;
        this.data = this.allData;
        this.cdr.detectChanges();
        break;
      }
      case tableStatus.failed: {
        this.failedCard.nativeElement.style.border = 'medium solid #cc1d28';
        this.allCard.nativeElement.style.border = '';
        this.successCard.nativeElement.style.border = '';
        this.addClass(3); // to add statusBorderClass to element on click
        this.page = 1; // assigning page number on card click
        this.tableStatuses = val;
        this.falseEntries = this.errorData.length;
        this.total$ = this.errorData.length;
        this.data = this.errorData;
        this.cdr.detectChanges();
        break;
      }
      case tableStatus.success: {
        this.successCard.nativeElement.style.border = 'medium solid #389126';
        this.allCard.nativeElement.style.border = '';
        this.failedCard.nativeElement.style.border = '';
        this.addClass(2); // to add statusBorderClass to element on click
        this.page = 1; // assigning page number on card click
        this.tableStatuses = val;
        this.successEntries = this.successData.length;
        this.total$ = this.successData.length;
        this.data = this.successData;
        this.cdr.detectChanges();
        break;
      }
    }
  }

  addClass(id: number) {
    this.id = id;
  }

  hideAllAndFailed() {
    this.hideAllFailed = true;
    this.changeTableStatusAndData(tableStatus.success);
  }

  // fetch account on each key hit
  fetchAccount($event: any) {
    this.accountService.searchTerm = $event.term;
    this.accountService.performSearch(accountsStatus.ACTIVE);
    this.accountService.account$.subscribe(resp => {
      this.accounts = resp;
      this.cdr.detectChanges();
    });
  }

  updateBankAccount(event: any) {
    this.selectedBankAccount = event;
    this.getActiveBalance(
      this.selectedBankAccount.merchantId,
      this.selectedBankAccount.bankAccountNo,
      this.selectedBankAccount.bankName
    );
    let banks: any;
    if (banksAllowedIMPS[this.selectedBankAccount.bankName]) {
      switch (this.selectedBankAccount.bankName) {
        case banksTypes.IDFC: {
          this.isIDFCBank = true;
          banks = this.merchantProfile?.idfcBanks;
          break;
        }

        case banksTypes.RBL: {
          this.isRblBank = true;
          banks = this.merchantProfile?.rblBanks!;
          break;
        }

        case banksTypes.YES_BANK: {
          this.isYesBank = true;
          banks = this.merchantProfile?.yesBanks!;
          break;
        }

        case banksTypes.DBS: {
          this.isDBSBank = true;
          banks = this.merchantProfile?.dbsBanks!;
          break;
        }

        case banksTypes.HDFC: {
          this.isHdfcBank = true;
          banks = this.merchantProfile?.hdfcBanks!;
          break;
        }
      }

      banks!.forEach(
        (
          element:
            | YesBankMerchantProfile
            | HDFCBankMerchantProfile
            | IDFCBankMerchantProfile
        ) => {
          if (
            element.accountNo == this.selectedBankAccount.bankAccountNo
          ) {
            this.isIMPS = element.isIMPS ? element.isIMPS : false;
          }
        }
      );

      this.cdr.detectChanges();
    }

  }

  updateAccount(event: any) {
    this.selectedAccount.balance = +this.selectedAccount.balance;

    // TODO: Use 1 base bank model
    let property,
      banks:
        | HDFCBankMerchantProfile[]
        | YesBankMerchantProfile[]
        | IBLBankMerchantProfile[]
        | IDFCBankMerchantProfile[];

    if (banksAllowedIMPS[this.selectedAccount.bank]) {
      switch (this.selectedAccount.bank) {
        case banksTypes.HDFC: {
          this.isHdfcBank = true;
          property = 'hdfcBanks';
          banks = this.merchantProfile?.hdfcBanks!;
          break;
        }

        case banksTypes.YES_BANK: {
          this.isYesBank = true;
          property = 'yesBanks';
          banks = this.merchantProfile?.yesBanks!;
          break;
        }

        case banksTypes.IBL: {
          this.isIblBank = true;
          property = 'iblBanks';
          banks = this.merchantProfile?.iblBanks!;
          break;
        }

        case banksTypes.IDFC: {
          this.isIDFCBank = true;
          property = 'idfcBanks';
          banks = this.merchantProfile?.idfcBanks!;
          break;
        }

        case banksTypes.RBL: {
          this.isRblBank = true;
          property = 'rblBanks';
          banks = this.merchantProfile?.rblBanks!;
          break;
        }

        case banksTypes.DBS: {
          this.isDBSBank = true;
          property = 'dbsBanks';
          banks = this.merchantProfile?.dbsBanks!;
          break;
        }
      }

      if (!this.excelHeaders[0].includes('Transfer Type')) {
        this.excelHeaders[0].push('Transfer Type');
      }

      banks!.forEach(
        (
          element:
            | YesBankMerchantProfile
            | HDFCBankMerchantProfile
            | IDFCBankMerchantProfile
        ) => {
          if (
            element.accountNo == this.selectedAccount.hardEscrowAccountNumber
          ) {
            this.isIMPS = element.isIMPS ? element.isIMPS : false;
          }
        }
      );
      this.cdr.detectChanges();
    }
  }

  makeTransfer() {
    this.errors = [];
    console.log('MAKE TRANSFER CLICKED');
    if (
      (this.selectedMerchantAuthorizers.length === 0 &&
        this.showMerchantAuthorizer) ||
      (this.selectedAccountAuthorizers.length === 0 &&
        this.showAccountAuthorizer)
    ) {
      this.errors = [];
      this.errors.push('Please select at least 1 Authorizers');
      return;
    }

    if (this.batchName === '') {
      this.errors.push('Enter Batch Name');
      return;
    }

    if (
      !this.connectedBanking &&
      Math.round(this.totalApiAmount * 100) / 100 >
      Math.round(this.selectedAccount.balance * 100) / 100
    ) {
      this.errors.push('Escrow balance is less than total transfer amount');
      return;
    }

    // open OTP verification modal
    const modalRef: NgbModalRef & {
      componentInstance: OtpModalComponent;
    } = this.modalService.open(OtpModalComponent, {
      backdrop: 'static',
      size: 'md'
    });
    modalRef.componentInstance.doClose = modalRef;
    modalRef.componentInstance.templateId = smsMsg91TemplateId.transferOtp;
    modalRef.componentInstance.passOtp.subscribe(
      (otp: number) => {
        if (otp) {
          this.makeTransferRequest(otp.toString());
        } else {
          console.log('something went with modal');
        }
      },
      // tslint:disable-next-line:no-any
      (err: any) => {
        if (err.status === 0) {
          this.errors = ['Connection Error'];
        }
        this.cdr.detectChanges();
      }
    );
  }

  checkObjectKeys(obj: any) {
    let isInvalid = true;
    if (!this.isBulkPayeeEnabled) {
      if (!('Beneficiary Name (Mandatory)' in obj)) {
        isInvalid = false;
      }
      if (!('Beneficiary Account number (Mandatory)' in obj)) {
        isInvalid = false;
      }
      if (!('IFSC code (Mandatory)' in obj)) {
        isInvalid = false;
      }
    } else {
      if (!('PayeeId (Mandatory)' in obj)) {
        isInvalid = false;
      }
      if (!('Beneficiary Name (Optional)' in obj)) {
        isInvalid = false;
      }
    }

    if (!('Amount (Mandatory)' in obj)) {
      isInvalid = false;
    }
    if (!('Description / Purpose (Optional)' in obj)) {
      isInvalid = false;
    }
    return isInvalid;
  }

  loadPage(event: any) {
    console.log('PAGE ', this.page);
  }

  convertToIndianCurrency(num: number) {
    return num
      ? num.toLocaleString('en-IN', {
        maximumFractionDigits: 2,
        style: 'currency',
        currency: 'INR'
      })
      : ' Rs. 0/-';
  }

  navigateToTransferList() {
    localStorage.setItem('Index', '1');
    if (!this.connectedBanking) {
      this.router.navigate([
        this.isAdmin
          ? environment.urlAdminPrefix + '/transfer'
          : environment.urlPortalPrefix + '/passbook'
      ]);
    } else {
      this.router.navigate([
        this.isAdmin
          ? environment.urlAdminPrefix + '/transfer'
          : environment.urlPortalPrefix + '/passbook/bank-accounts'
      ]);
    }
  }

  makeTransferRequest(otp?: string) {
    let merchantAuthorizers: AuthTransferStruct[] = [];
    let accountAuthorizers: AuthTransferStruct[] = [];
    if (this.selectedMerchantAuthorizers.length > 0) {
      this.selectedMerchantAuthorizers.forEach(it => {
        merchantAuthorizers.push({ name: it.data.name, email: it.data.email });
      });
    }
    if (this.selectedAccountAuthorizers.length > 0) {
      this.selectedAccountAuthorizers.forEach(it => {
        accountAuthorizers.push({ name: it.data.name, email: it.data.email });
      });
    }
    this.spinner.show().then(res => {
      console.log('SHOW SPINNER');
    });

    // tslint:disable-next-line:no-any
    const body: any = {};
    localStorage.setItem('transfer_bool', 'true');

    body.batchName = this.batchName;
    body.accountId = this.selectedAccount?.accountId;
    body.bankAccountNumber = this.selectedBankAccount?.bankAccountNo.toString();
    body.totalAmount = +this.totalApiAmount;

    console.log('NUMBER 1 ', this.totalApiAmount);
    body.transferList = this.dataToSendOnApi;
    body.merchantAuthorizers = merchantAuthorizers;
    body.accountAuthorizers = accountAuthorizers;

    body.documentIds = [];
    this.uploadedDocuments.forEach(it => {
      body.documentIds?.push(it.documentId);
    });

    if (this.isAdmin && this.selectedMerchant?.merchantId) {
      body.merchantId = this.selectedMerchant?.merchantId;
    } else {
      body.otp = otp;
    }
    this.uploadInProgress = false;

    this.bulkTransferService.create(body, this.isAdmin).subscribe(
      (resp: any) => {
        if (resp.success) {
          console.log('SUCCESS ', resp);
          this.navigateToTransferList();
          this.cdr.detectChanges();
          //}
          this.spinner.hide();
        } else {
          if (resp.result.invalidTransfers.length > 0) {
            this.errorData = resp.result.invalidTransfers;
            if (this.isBulkPayeeEnabled) {
              this.mapPayeeFailures();
              this.total$ = resp.result.invalidTransfers.length;
            }
            this.cdr.detectChanges();
          }
          console.log('ERROR ', resp.errors);
          this.errors = resp.errors;
          this.cdr.detectChanges();
          localStorage.setItem('transfer_bool', 'false');
          this.spinner.hide();
        }
      },
      err => {
        console.log('ERROR FROM API SIDE ', err);
        if (err.status === 0) {
          this.errors = ['Connection Error'];
        } else {
          this.errors = err.error.errors;
          this.errorData = err.error.result?.invalidTransfers;
          if (this.isBulkPayeeEnabled) {
            this.mapPayeeFailures();
            this.total$ = err.error.result.invalidTransfers.length;
          }
        }
        localStorage.setItem('transfer_bool', 'false');
        this.cdr.detectChanges();
        this.spinner.hide();
      }
    );
  }

  //Map Errors returned from Server side during Bulk Transfer with Payees
  mapPayeeFailures() {
    //Remove the failures from Success & Map Remarks to Rejection Reason
    for (let d in this.errorData) {
      let successIndex = this.successData.findIndex(
        successElem =>
          successElem.payeeId === this.errorData[d].payeeId &&
          successElem.amount === this.errorData[d].amount
      );
      if (successIndex < 0) {
        continue;
      }
      let errorIndex = this.allData.findIndex(
        errorElem =>
          errorElem.payeeId === this.errorData[d].payeeId &&
          errorElem.amount === this.errorData[d].amount
      );
      this.errorData[d].rowNumber = errorIndex + 2;
      this.successEntries -= 1;
      //@ts-ignore
      let successEntriesAmountC = parseFloat(
        (this.successEntriesAmt as string).replace(/[\u{0080}-\u{FFFF},]/gu, '')
      );
      console.log(successEntriesAmountC);
      successEntriesAmountC -= this.successData[successIndex].amount;
      // @ts-ignore
      this.successEntriesAmt = this.convertToIndianCurrency(
        successEntriesAmountC
      );
      this.successData.splice(successIndex, 1);
      this.falseEntries += 1;
      // @ts-ignore
      let falseEntriesAmountC = parseFloat(
        (this.falseEntriesAmt as string).replace(/[\u{0080}-\u{FFFF},]/gu, '')
      );
      falseEntriesAmountC += this.errorData[d].amount;
      // @ts-ignore
      this.falseEntriesAmt = this.convertToIndianCurrency(falseEntriesAmountC);
      this.errorData[d].rejectionReason = [];
      this.errorData[d].rejectionReason.push(
        this.errorData[d].remarks as string
      );
    }
    this.bulkTransferStatus = BulkTransferStatus.submit; // to show table
    this.hideAllFailed = false;
    this.changeTableStatusAndData(tableStatus.failed);
  }

  hasMultipleBanks() {
    return this.bankCount > 1;
  }

  downloadTemplate($event: any) {
    this.templateError = false;
    let bankType = $event.target.value;
    if (
      bankType === banksTypes.YES_BANK ||
      bankType === banksTypes.IBL ||
      bankType === banksTypes.HDFC ||
      bankType === banksTypes.RBL ||
      bankType === banksTypes.DBS ||
      bankType === banksTypes.IDFC ||
      bankType === banksTypes.AXIS
    ) {
      this.downloadFileUrl = this.sampleFileUrlTransferType;
    } else if (bankType === banksTypes.ICICI) {
      this.downloadFileUrl = this.sampleFileUrlICICI;
    } else if (bankType === 'upi') {
      this.downloadFileUrl = this.sampleUPIFileUrl;
    } else {
      this.downloadFileUrl = this.sampleFileUrl;
    }
    this.cdr.detectChanges();
  }

  onEmptyTemplate() {
    this.templateError = true;
    this.cdr.detectChanges();
    return;
  }

  getActiveBalance(
    merchantId: string,
    bankAccountId: number,
    bankName: string
  ) {
    this.transferService
      .getActiveBalance(merchantId, bankAccountId, bankName)
      .subscribe(resp => {
        if (resp) {
          this.activeBalance = resp.result.effectiveBalance;
          this.cdr.detectChanges();
          console.log(this.activeBalance);
        }
      });
  }
}
