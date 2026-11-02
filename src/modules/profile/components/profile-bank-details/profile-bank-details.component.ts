import { Location } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { UtilityService } from '@common/services';
import bankTypes from '@modules/accounts/constants/banksTypes';
import { MerchantService } from '@modules/merchant/services';
import { ProfileResponseModel } from '@modules/profile/models';
import {
  HDFCAccount,
  HDFCAccountsList,
  HDFCBankFormElement,
  HDFCBankMerchantProfile
} from '@modules/profile/models/hdfcAccounts';
import {
  AxisAccount,
  AxisAccountsList,
  AxisBankFormElement,
  AxisBankMerchantProfile
} from '@modules/profile/models/axisAccounts';
import {
  IBLAccountList,
  IBLAccountResult,
  IBLBankMerchantProfile
} from '@modules/profile/models/iblAccounts';
import {
  IDFCAccountList,
  IDFCAccountResult,
  IDFCBankFormElement,
  IDFCBankMerchantProfile
} from '@modules/profile/models/idfcAccount';
import {
  RBLAccountList,
  RBLAccountResult,
  RBLBankFormElement,
  RBLBankMerchantProfile
} from '@modules/profile/models/rblAccount';
import {
  RblBank,
  YesAccountList,
  YesAccountResult,
  YesBankFormElement,
  YesBankMerchantProfile
} from '@modules/profile/models/yesAccount';
import { ProfileService } from '@modules/profile/services';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import _ from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';
import { IdfcHardEscrowComponent } from '../idfc-hard-escrow/idfc-hard-escrow.component';
import { RblHardEscrowComponent } from '../rbl-hard-escrow/rbl-hard-escrow.component';
import { YesHardEscrowComponent } from '../yes-hard-escrow/yes-hard-escrow.component';
import {
  ICICIAccountList,
  ICICIAccountResult,
  ICICIBankFormElement,
  ICICIBankMerchantProfile
} from '@modules/profile/models/iciciAccount';
import { IciciHardEscrowComponent } from '../icici-hard-escrow/icici-hard-escrow.component';
import {
  DBSAccountList,
  DBSAccountResult,
  DBSBankFormElement,
  DBSBankMerchantProfile
} from '@modules/profile/models/dbsAccounts';
import { DbsHardEscrowComponent } from '../dbs-hard-escrow/dbs-hard-escrow.component';
import { AxisHardEscrowComponent } from '../axis-hard-escrow/axis-hard-escrow.component';

@Component({
  selector: 'sbpro-profile-bank-details',
  templateUrl: './profile-bank-details.component.pug',
  styleUrls: ['./profile-bank-details.component.scss']
})
export class ProfileBankDetailsComponent implements OnInit {
  @Input() private profileVerified = false;
  @Input() private merchantId = '';
  @Input() merchantEmail = '';
  @Input() accountId = '';
  @Input() readOnly = false;
  @Output() private setBankAccountVerified: EventEmitter<
    boolean
  > = new EventEmitter();
  errors: Array<string> = [];

  iciciBanks: ICICIAccountResult[] = [];
  rblBanks: RBLAccountResult[] = [];
  yesBanks: YesAccountResult[] = [];
  idfcBanks: IDFCAccountResult[] = [];
  hdfcBanks: HDFCAccount[] = [];
  axisBanks: AxisAccount[] = [];
  iblBanks: IBLAccountResult[] = [];
  iciciSelectedAccounts: ICICIBankMerchantProfile[] = [];
  dbsBanks: DBSAccountResult[] = [];
  rblSelectedAccounts: RBLBankMerchantProfile[] = [];
  yesSelectedAccounts: YesBankMerchantProfile[] = [];
  idfcSelectedAccounts: IDFCBankMerchantProfile[] = [];
  hdfcSelectedAccounts: HDFCBankMerchantProfile[] = [];
  axisSelectedAccounts: AxisBankMerchantProfile[] = [];
  iblSelectedAccounts: IBLBankMerchantProfile[] = [];
  iciciAccountType = 'global';
  dbsSelectedAccounts: DBSBankMerchantProfile[] = [];
  rblAccountType = 'global';
  yesAccountType = 'global';
  idfcAccountType = 'global';
  hdfcAccountType = 'global';
  iblAccountType = 'global';
  dbsAccountType = 'global';
  axisAccountType = 'global';
  success: Array<string> = [];
  bankForm!: FormGroup;
  toastHead = '';
  toastBody = '';
  banks = [{}];
  isReadonly = false;
  activated = true;
  @Input() editMode = true;

  dataLoaded = false;
  bankAccountVerified = false;
  private _loadingData$ = new BehaviorSubject(false);

  constructor(
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private profileService: ProfileService,
    private utilityService: UtilityService,
    private merchantService: MerchantService,
    private modalService: NgbModal,
    private _location: Location
  ) {
    // this.isReadonly = this.authService.isMerchantVerified();
    this.bankForm = this.formBuilder.group({
      rblCheckbox: false,
      iciciCheckbox: false,
      iciciBanksFA: new FormArray([]),
      iciciAccountTypeSelect: 1,
      yesBankCheckbox: false,
      rblBanksFA: new FormArray([]),
      rblAccountTypeSelect: 1,
      yesBanksFA: new FormArray([]),
      yesAccountTypeSelect: 1,
      idfcBankCheckbox: false,
      idfcBanksFA: new FormArray([]),
      idfcAccountTypeSelect: 1,
      hdfcBankCheckbox: false,
      hdfcAccountTypeSelect: 1,
      hdfcBanksFA: new FormArray([]),
      iblCheckbox: false,
      iblBanksFA: new FormArray([]),
      iblAccountTypeSelect: 1,
      dbsCheckbox: false,
      dbsBanksFA: new FormArray([]),
      dbsAccountTypeSelect: 1,
      axisCheckbox: false,
      axisBanksFA: new FormArray([]),
      axisAccountTypeSelect: 1
    });
  }

  /**
   * On Init
   */
  ngOnInit() {
    this._loadingData$.next(true);
    this.profileService
      .getProfile(this.merchantId, false)
      .subscribe((resp: ProfileResponseModel) => {
        this._loadingData$.next(false);
        this.dataLoaded = true;
        console.log(resp);
        if (resp.result) {
          this.activated = resp.result.verified;

          if (resp.result.banks) {
            for (let bank of resp.result.banks) {
              if (bank.bankName === bankTypes.ICICI) {
                this.iciciSelectedAccounts.pop();
                this.bankForm.controls.iciciCheckbox.setValue(true);
                //Update RBL Bank Hard Escrow list
                resp.result.iciciBanks.forEach(
                  (element: ICICIBankMerchantProfile) => {
                    this.iciciSelectedAccounts.push(
                      element as ICICIBankMerchantProfile
                    );
                  }
                );
                //Get RBL Banks List
                this.getICICIBankList();
              } else if (bank.bankName === bankTypes.RBL) {
                this.rblSelectedAccounts.pop();
                this.bankForm.controls.rblCheckbox.setValue(true);
                //Update RBL Bank Hard Escrow list
                resp.result.rblBanks.forEach(
                  (element: RBLBankMerchantProfile) => {
                    this.rblSelectedAccounts.push(
                      element as RBLBankMerchantProfile
                    );
                  }
                );
                //Get RBL Banks List
                this.getRBLBankList();
              } else if (bank.bankName === bankTypes.YES_BANK) {
                this.bankForm.controls.yesBankCheckbox.setValue(true);
                //Update YES Bank Hard Escrow list
                this.yesSelectedAccounts.pop();
                resp.result.yesBanks.forEach(
                  (element: YesBankMerchantProfile) => {
                    this.yesSelectedAccounts.push(
                      element as YesBankMerchantProfile
                    );
                  }
                );
                this.getYesBankList();
              } else if (bank.bankName === bankTypes.IDFC) {
                this.bankForm.controls.idfcBankCheckbox.setValue(true);
                //Update IDFC Bank Hard Escrow list
                this.idfcSelectedAccounts.pop();
                resp.result.idfcBanks.forEach(
                  (element: IDFCBankMerchantProfile) => {
                    this.idfcSelectedAccounts.push(
                      element as IDFCBankMerchantProfile
                    );
                  }
                );
                this.getIDFCBankList();
              } else if (bank.bankName === bankTypes.HDFC) {
                this.bankForm.controls.hdfcBankCheckbox.setValue(true);
                while (this.hdfcSelectedAccounts.length)
                  this.hdfcSelectedAccounts.pop();

                resp.result.hdfcBanks.forEach(
                  (element: HDFCBankMerchantProfile) => {
                    this.idfcSelectedAccounts.push(
                      element as HDFCBankMerchantProfile
                    );
                  }
                );
                this.getHdfcBankList();
              } else if (bank.bankName === bankTypes.DBS) {
                this.bankForm.controls.dbsCheckbox.setValue(true);
                while (this.dbsSelectedAccounts.length)
                  this.dbsSelectedAccounts.pop();

                resp.result.dbsBanks.forEach(
                  (element: DBSBankMerchantProfile) => {
                    this.dbsSelectedAccounts.push(
                      element as DBSBankMerchantProfile
                    );
                  }
                );
                this.getDBSBankList();
              } else if (bank.bankName === bankTypes.AXIS) {
                this.bankForm.controls.axisCheckbox.setValue(true);
                while (this.axisSelectedAccounts.length)
                  this.axisSelectedAccounts.pop();

                resp.result.axisBanks.forEach(
                  (element: AxisBankMerchantProfile) => {
                    this.axisSelectedAccounts.push(element);
                  }
                );
                this.getAxisBankList();
              } else if (_.isEqual(bank.bankName, bankTypes.IBL)) {
                this.bankForm.controls.iblCheckbox.setValue(true);
                while (this.iblSelectedAccounts.length) {
                  this.iblSelectedAccounts.pop();
                }
                resp.result.iblBanks.forEach(
                  (element: IBLBankMerchantProfile) => {
                    this.iblSelectedAccounts.push(element);
                  }
                );
                this.getIBLBankList();
              }
            }
          }
          this.cdr.detectChanges();
        }
      });
  }

  //Get ICICI Banks Form Array
  get iciciBanksFormArray() {
    return this.bankForm.controls.iciciBanksFA as FormArray;
  }

  //Get RBL Banks Form Array
  get rblBanksFormArray() {
    return this.bankForm.controls.rblBanksFA as FormArray;
  }

  //Get YES Banks Form Array
  get yesBanksFormArray() {
    return this.bankForm.controls.yesBanksFA as FormArray;
  }

  //Get YES Banks Form Array
  get idfcBanksFormArray() {
    return this.bankForm.controls.idfcBanksFA as FormArray;
  }

  get hdfcBanksFormArray() {
    return this.bankForm.controls.hdfcBanksFA as FormArray;
  }

  //Get IBL Banks Form Array
  get iblBankFormArray() {
    return this.bankForm.controls.iblBanksFA as FormArray;
  }

  //Get IBL Banks Form Array
  get dbsBankFormArray() {
    return this.bankForm.controls.dbsBanksFA as FormArray;
  }

  //Get IBL Banks Form Array
  get axisBankFormArray() {
    return this.bankForm.controls.axisBanksFA as FormArray;
  }

  get loadingData$(): Observable<boolean> {
    return this._loadingData$.asObservable();
  }

  //Add Check Boxes for RBL
  private addICICICheckboxes() {
    //Clear Form Array
    this.bankForm.controls.iciciBanksFA = new FormArray([]);
    //RBL Banks for each
    this.iciciBanks.forEach(async (val: ICICIAccountResult) => {
      let iciciSelectedAccount = this.iciciSelectedAccounts.filter(
        iciciAccount => iciciAccount.accountNo == val.accountNo
      );
      await this.addBankCheckBoxDetails(
        iciciSelectedAccount,
        this.iciciBanksFormArray
      );
    });
    console.log(this.iciciBanksFormArray.controls);
    this.cdr.detectChanges();
  }

  //Add Check Boxes for RBL
  private addRBLCheckboxes() {
    //Clear Form Array
    this.bankForm.controls.rblBanksFA = new FormArray([]);
    //RBL Banks for each
    this.rblBanks.forEach(async (val: RBLAccountResult) => {
      let rblSelectedAccount = this.rblSelectedAccounts.filter(
        rblAccount => rblAccount.accountNo == val.rblAccountNo
      );
      await this.addBankCheckBoxDetails(
        rblSelectedAccount,
        this.rblBanksFormArray
      );
    });
    console.log(this.yesBanksFormArray.controls);
    this.cdr.detectChanges();
  }

  //Add Check Boxes for YES
  private async addYesCheckboxes() {
    //Clear Form Array
    this.bankForm.controls.yesBanksFA = new FormArray([]);
    //Yes Banks for each
    this.yesBanks.forEach(async (val: YesAccountResult) => {
      let yesSelectedAccount = this.yesSelectedAccounts.filter(
        yesAccount => yesAccount.accountNo == val.yesAccountNo
      );
      await this.addBankCheckBoxDetails(
        yesSelectedAccount,
        this.yesBanksFormArray
      );
    });
    console.log(this.yesBanksFormArray.controls);
    this.cdr.detectChanges();
  }

  //Add Check Boxes for YES
  private async addidfcBankCheckboxes() {
    //Clear Form Array
    this.bankForm.controls.idfcBanksFA = new FormArray([]);

    this.idfcBanks.forEach(async (val: IDFCAccountResult) => {
      let idfcSelectedAccount = this.idfcSelectedAccounts.filter(
        idfcAccount => idfcAccount.accountNo == val.idfcAccountNo
      );
      await this.addBankCheckBoxDetails(
        idfcSelectedAccount,
        this.idfcBanksFormArray
      );
    });
    console.log(this.idfcBanksFormArray.controls);
    this.cdr.detectChanges();
  }

  private async addHdfcBankCheckboxes() {
    this.bankForm.controls.hdfcBanksFA = new FormArray([]);

    //Yes Banks for each
    this.hdfcBanks.forEach(async (val: HDFCAccount) => {
      let hdfcSelectedAccount = this.idfcSelectedAccounts.filter(
        idfcAccount => idfcAccount.accountNo == val.hdfcAccountNo
      );
      await this.addBankCheckBoxDetails(
        hdfcSelectedAccount,
        this.hdfcBanksFormArray
      );
    });
    console.log(this.hdfcBanksFormArray.controls);
    this.cdr.detectChanges();
  }

  private async addIBLBankCheckboxes() {
    this.bankForm.controls.iblBanksFA = new FormArray([]);

    this.iblBanks.forEach(async (val: IBLAccountResult) => {
      let iblSelectedAccount = this.iblSelectedAccounts.filter(
        iblAccount => iblAccount.accountNo === val.iblAccountNo
      );

      await this.addBankCheckBoxDetails(
        iblSelectedAccount,
        this.iblBankFormArray
      );
    });

    this.cdr.detectChanges();
  }

  private async addDBSBankCheckboxes() {
    this.bankForm.controls.dbsBanksFA = new FormArray([]);

    this.dbsBanks.forEach(async (val: DBSAccountResult) => {
      let dbsSelectedAccount = this.dbsSelectedAccounts.filter(
        dbsAccount => dbsAccount.accountNo === val.dbsAccountNo
      );

      await this.addBankCheckBoxDetails(
        dbsSelectedAccount,
        this.dbsBankFormArray
      );
    });

    this.cdr.detectChanges();
  }

  private async addAxisBankCheckboxes() {
    this.bankForm.controls.axisBanksFA = new FormArray([]);

    this.axisBanks.forEach(async (val: AxisAccount) => {
      let axisSelectedAccount = this.axisSelectedAccounts.filter(
        axisAccount => axisAccount.accountNo === val.id
        // axisAccount => axisAccount.accountNo === val.escrowNumber
      );

      await this.addBankCheckBoxDetails(
        axisSelectedAccount,
        this.axisBankFormArray
      );
      this.cdr.detectChanges();
    });

    this.cdr.detectChanges();
  }

  //Common function for API based banks to add check box details
  private async addBankCheckBoxDetails(
    selectedAccount:
      | YesBankMerchantProfile[]
      | RBLBankMerchantProfile[]
      | AxisBankMerchantProfile[]
      | ICICIBankMerchantProfile[],
    banksFormArray: FormArray
  ) {
    let trusteeAccess = 'approve',
      disableAdmin = false,
      trusteeThresholdAmt = 0,
      trusteeThresholdFreq = 'no-limit',
      isIMPS = false,
      payoutMode = 'h2h';

    if (selectedAccount.length > 0) {
      selectedAccount[0].escrowNumber = selectedAccount[0].accountNo;
      if (!selectedAccount[0].trusteeApprove) {
        trusteeAccess = 'none';
      }
      if (selectedAccount[0].trusteeApprove) {
        trusteeAccess = 'approve';
      } else if (selectedAccount[0].trusteeView) {
        trusteeAccess = 'view';
      }
      if (selectedAccount[0].disableAdmin) {
        disableAdmin = true;
      }
      if (selectedAccount[0].isIMPS) {
        isIMPS = true;
      }
      if (selectedAccount[0].trusteeThresholdAmt) {
        trusteeThresholdAmt = selectedAccount[0].trusteeThresholdAmt;
      }
      if (selectedAccount[0].trusteeThresholdFreq) {
        trusteeThresholdFreq = selectedAccount[0].trusteeThresholdFreq;
      }
      if (selectedAccount[0].paymentMode) {
        payoutMode = selectedAccount[0].paymentMode;
      }
    }

    let data: any = {
      accountChecked: selectedAccount.length > 0 ? true : false,
      trusteeAccess: trusteeAccess,
      disableAdmin: disableAdmin,
      isIMPS: isIMPS,
      trusteeThresholdAmt: trusteeThresholdAmt,
      trusteeThresholdFreq: trusteeThresholdFreq
    };

    if (payoutMode) {
      data['payoutMode'] = payoutMode;
    }

    banksFormArray.push(new FormControl(data));
  }

  //RBL Account Type Selection
  changeICICIAccountType(accountType: string) {
    this.iciciAccountType = accountType;
    this.getICICIBankList();
    this.cdr.detectChanges();
  }

  //RBL Account Type Selection
  changeRBLAccountType(accountType: string) {
    this.rblAccountType = accountType;
    this.getRBLBankList();
    this.cdr.detectChanges();
  }

  //YES Account type selection
  changeYesAccountType(accountType: string) {
    this.yesAccountType = accountType;
    this.getYesBankList();
    this.cdr.detectChanges();
  }

  changeHdfcAccountType(accountType: string) {
    this.yesAccountType = accountType;
    this.getHdfcBankList();
    this.cdr.detectChanges();
  }

  //IDFC Account type selection
  changeIDFCAccountType(accountType: string) {
    this.idfcAccountType = accountType;
    this.getIDFCBankList();
    this.cdr.detectChanges();
  }

  changeIBLAccountType(accountType: string) {
    this.iblAccountType = accountType;
    this.getIBLBankList();
    this.cdr.detectChanges();
  }

  changeDBSAccountType(accountType: string) {
    this.dbsAccountType = accountType;
    this.getDBSBankList();
    this.cdr.detectChanges();
  }

  changeAxisAccountType(accountType: string) {
    this.axisAccountType = accountType;
    this.getAxisBankList();
    this.cdr.detectChanges();
  }

  //Get Respective Bank Component
  getBankComponent(bank: string) {
    switch (bank) {
      case bankTypes.ICICI: {
        return IciciHardEscrowComponent;
      }
      case bankTypes.RBL: {
        return RblHardEscrowComponent;
      }
      case bankTypes.YES_BANK: {
        return YesHardEscrowComponent;
      }
      case bankTypes.IDFC: {
        return IdfcHardEscrowComponent;
      }
      case bankTypes.DBS: {
        return DbsHardEscrowComponent;
      }
      case bankTypes.AXIS: {
        return AxisHardEscrowComponent;
      }
      default: {
        break;
      }
    }
  }

  //Update Bank Component
  updateBankComponent(bank: string, result: any) {
    switch (bank) {
      case bankTypes.ICICI: {
        this.getICICIBankList();
        break;
      }
      case bankTypes.RBL: {
        this.getRBLBankList();
        break;
      }
      case bankTypes.YES_BANK: {
        this.getYesBankList();
        break;
      }
      case bankTypes.IDFC: {
        this.getIDFCBankList();
        break;
      }
      case bankTypes.IBL: {
        this.getIBLBankList();
        break;
      }
      case bankTypes.DBS: {
        this.getDBSBankList();
        break;
      }
      case bankTypes.AXIS: {
        this.getAxisBankList();
        break;
      }
    }
  }

  // Open Modal for creating bank
  createAccount(bank: string) {
    const modalRef = this.modalService.open(this.getBankComponent(bank), {
      size: 'lg'
    });
    modalRef.componentInstance.merchantId = this.merchantId;
    modalRef.componentInstance.doClose = modalRef;
    modalRef.result.then(result => {
      if (result.success) {
        this.updateBankComponent(bank, result);
        this.cdr.detectChanges();
      }
    });
  }

  getTrusteeThresholdAmt(
    trusteeThresholdFreq: string,
    trusteeThresholdAmt: number
  ) {
    return trusteeThresholdFreq === 'no-limit' ? 0 : trusteeThresholdAmt;
  }

  //Open Modal for editing Bank
  editAccount(
    account:
      | ICICIAccountResult
      | RBLAccountResult
      | YesAccountResult
      | IDFCAccountResult,
    bank: string
  ) {
    const modalRef = this.modalService.open(this.getBankComponent(bank), {
      size: 'lg'
    });
    modalRef.componentInstance.merchantId = this.merchantId;
    modalRef.componentInstance.accountData = account;
    modalRef.componentInstance.doClose = modalRef;
    modalRef.result.then(result => {
      if (result.success) {
        this.updateBankComponent(bank, result);
        this.cdr.detectChanges();
      }
    });
  }

  //Get RBL Banks List
  getICICIBankList(merchantId: string = '') {
    //Check type of Account requested
    let isGlobal = false;
    if (this.iciciAccountType === 'custom') {
      merchantId = this.merchantId;
      isGlobal = false;
    } else {
      isGlobal = true;
    }
    //Send request
    this.profileService.getICICIBanksList(merchantId, isGlobal).subscribe(
      (resp: ICICIAccountList) => {
        this._loadingData$.next(false);
        this.dataLoaded = true;

        if (resp.result) {
          //Empty RBL Banks Array
          while (this.iciciBanks.length > 0) {
            this.iciciBanks.pop();
          }
          //Populate with new list
          for (let iciciBankAcc of resp.result) {
            this.iciciBanks.push(iciciBankAcc);
          }
          this.addICICICheckboxes();
        }
        this.cdr.detectChanges();
      },
      (err: any) => {
        console.log(err);
      }
    );
  }

  //Get RBL Banks List
  getRBLBankList(merchantId: string = '') {
    //Check type of Account requested
    let isGlobal = false;
    if (this.rblAccountType === 'custom') {
      merchantId = this.merchantId;
      isGlobal = false;
    } else {
      isGlobal = true;
    }
    //Send request
    this.profileService.getRBLBanksList(merchantId, isGlobal).subscribe(
      (resp: RBLAccountList) => {
        this._loadingData$.next(false);
        this.dataLoaded = true;

        if (resp.result) {
          //Empty RBL Banks Array
          while (this.rblBanks.length > 0) {
            this.rblBanks.pop();
          }
          //Populate with new list
          for (let rblBankAcc of resp.result) {
            this.rblBanks.push(rblBankAcc);
          }
          this.addRBLCheckboxes();
        }
        this.cdr.detectChanges();
      },
      (err: any) => {
        console.log(err);
      }
    );
  }

  //Get YES Banks list
  getYesBankList(merchantId: string = '') {
    //Check type of Account requested
    let isGlobal = false;
    if (this.yesAccountType === 'custom') {
      merchantId = this.merchantId;
      isGlobal = false;
    } else {
      isGlobal = true;
    }
    //Send request
    this.profileService.getYesBanksList(merchantId, isGlobal).subscribe(
      (resp: YesAccountList) => {
        this._loadingData$.next(false);
        this.dataLoaded = true;

        console.log(resp);
        if (resp.result) {
          //Empty YES Banks Array
          while (this.yesBanks.length > 0) {
            this.yesBanks.pop();
          }
          //Populate with new list
          for (let yesBankAcc of resp.result) {
            this.yesBanks.push(yesBankAcc);
          }
          this.addYesCheckboxes();
        }
        this.cdr.detectChanges();
      },
      (err: any) => {
        console.log(err);
      }
    );
  }

  //Get IDFC Banks list
  getIDFCBankList(merchantId: string = '') {
    //Check type of Account requested
    let isGlobal = false;
    if (this.idfcAccountType === 'custom') {
      merchantId = this.merchantId;
      isGlobal = false;
    } else {
      isGlobal = true;
    }
    //Send request
    this.profileService.getIDFCBanksList(merchantId, isGlobal).subscribe(
      (resp: IDFCAccountList) => {
        this._loadingData$.next(false);
        this.dataLoaded = true;

        console.log(resp);
        if (resp.result) {
          //Empty YES Banks Array
          while (this.idfcBanks.length > 0) {
            this.idfcBanks.pop();
          }
          //Populate with new list
          for (let idfcBankAcc of resp.result) {
            this.idfcBanks.push(idfcBankAcc);
          }
          this.addidfcBankCheckboxes();
        }
        this.cdr.detectChanges();
      },
      (err: any) => {
        console.log(err);
      }
    );
  }

  getHdfcBankList(merchantId: string = '') {
    //Check type of Account requested
    let isGlobal = false;
    if (this.idfcAccountType === 'custom') {
      merchantId = this.merchantId;
      isGlobal = false;
    } else {
      isGlobal = true;
    }
    //Send request
    this.profileService.getHDFCBanksList(merchantId, isGlobal).subscribe(
      (resp: HDFCAccountsList) => {
        this._loadingData$.next(false);
        this.dataLoaded = true;

        console.log(resp);
        if (resp.result) {
          //Empty YES Banks Array
          while (this.hdfcBanks.length > 0) {
            this.hdfcBanks.pop();
          }
          //Populate with new list
          for (let hdfcBankAcc of resp.result) {
            this.hdfcBanks.push(hdfcBankAcc);
          }

          // TODO: change this to get addhdfcBankCheckboxes
          this.addHdfcBankCheckboxes();
        }
        this.cdr.detectChanges();
      },
      (err: any) => {
        console.log(err);
      }
    );
  }

  getIBLBankList() {
    let isGlobal = false;
    let merchantId;

    if (this.idfcAccountType === 'custom') {
      merchantId = this.merchantId;
      isGlobal = false;
    } else {
      isGlobal = true;
    }

    this.profileService.getIBLBanksList(merchantId, isGlobal).subscribe(
      (resp: IBLAccountList) => {
        this._loadingData$.next(false);
        this.dataLoaded = true;

        if (resp.result) {
          this.iblBanks = [];
          //Populate with new list
          for (let iblBankAcc of resp.result) {
            this.iblBanks.push(iblBankAcc);
          }
          this.addIBLBankCheckboxes();
        }
        this.cdr.detectChanges();
      },
      (err: any) => {
        console.log(err);
      }
    );
  }

  getAxisBankList() {
    let isGlobal = false;
    let owner = 'ncome';
    let merchantId;

    if (this.axisAccountType === 'custom') {
      merchantId = this.merchantId;
      isGlobal = false;
      owner = 'merchant';
    } else {
      isGlobal = true;
      owner = 'ncome';
    }

    this.profileService.getAxisBanksList(merchantId, owner).subscribe(
      (resp: AxisAccountsList) => {
        this._loadingData$.next(false);
        this.dataLoaded = true;

        if (resp.result) {
          this.axisBanks = [];
          //Populate with new list
          for (let axisBankAcc of resp.result) {
            this.axisBanks.push({
              ...axisBankAcc,
              accountNo: axisBankAcc.id
            });
          }
          this.addAxisBankCheckboxes();
        }
        this.cdr.detectChanges();
      },
      (err: any) => {
        console.log(err);
      }
    );
  }

  getDBSBankList() {
    let isGlobal = false;
    let owner = 'ncome';
    let merchantId;

    if (this.dbsAccountType === 'custom') {
      merchantId = this.merchantId;
      isGlobal = false;
      owner = 'merchant';
    } else {
      isGlobal = true;
      owner = 'ncome';
    }

    this.profileService.getDBSBanksList(merchantId, owner).subscribe(
      (resp: DBSAccountList) => {
        this._loadingData$.next(false);
        this.dataLoaded = true;

        if (resp.result) {
          this.dbsBanks = [];
          //Populate with new list
          for (let dbsBankAcc of resp.result) {
            this.dbsBanks.push({
              ...dbsBankAcc,
              accountNo: dbsBankAcc.dbsAccountNo
            });
          }
          this.addDBSBankCheckboxes();
        }
        this.cdr.detectChanges();
      },
      (err: any) => {
        console.log(err);
      }
    );
  }

  /**
   * Validate form
   * fields
   * @param formGroup
   */
  validateAllFormFields(formGroup: FormGroup) {
    // {1}
    Object.keys(this.bankForm.controls).forEach(field => {
      // {2}
      const control = this.bankForm.get(field); // {3}
      if (control instanceof FormControl) {
        // {4}
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        // {5}
        this.validateAllFormFields(control); // {6}
      }
    });
  }

  /**
   * Update Checkbox
   * @param formControlName
   * @param event
   */
  updateCheckBoxVal(formControlName: string, event: Event) {
    this.bankForm.controls[formControlName].patchValue(
      (event.target as HTMLInputElement).checked
    );

    switch (formControlName) {
      case 'yesBankCheckbox':
        this.getYesBankList();
        break;
      case 'rblCheckbox':
        console.log('Getting list of RBL checkboxes');
        this.getRBLBankList();
        break;
      case 'iciciCheckbox':
        console.log('Getting list of ICICI checkboxes');
        this.getICICIBankList();
        break;
      case 'idfcBankCheckbox':
        this.getIDFCBankList();
        break;
      case 'hdfcBankCheckbox':
        this.getHdfcBankList();
        break;
      case 'iblCheckbox':
        this.getIBLBankList();
        break;
      case 'dbsCheckbox':
        this.getDBSBankList();
        break;
      case 'axisCheckbox':
        this.getAxisBankList();
        break;
    }
  }

  //Update RBL Check Box to select Escrow Accounts
  updateCheckBoxICICIBanks(index: number, event: Event) {
    (this.bankForm.controls.iciciBanksFA as FormArray)
      .at(index)
      .patchValue(
        Object.assign(
          (this.bankForm.controls.iciciBanksFA as FormArray).at(index).value,
          (event.target as HTMLInputElement).checked
            ? { accountChecked: true }
            : { accountChecked: false }
        )
      );
  }

  //Update RBL Check Box to select Escrow Accounts
  updateCheckBoxRBlBanks(index: number, event: Event) {
    (this.bankForm.controls.rblBanksFA as FormArray)
      .at(index)
      .patchValue(
        Object.assign(
          (this.bankForm.controls.rblBanksFA as FormArray).at(index).value,
          (event.target as HTMLInputElement).checked
            ? { accountChecked: true }
            : { accountChecked: false }
        )
      );
  }

  //Update YES Check Box to select Escrow Accounts
  updateCheckBoxYesBanks(index: number, event: Event) {
    (this.bankForm.controls.yesBanksFA as FormArray)
      .at(index)
      .patchValue(
        Object.assign(
          (this.bankForm.controls.yesBanksFA as FormArray).at(index).value,
          (event.target as HTMLInputElement).checked
            ? { accountChecked: true }
            : { accountChecked: false }
        )
      );
  }

  updateCheckBoxHDFCBanks(index: number, event: Event) {
    (this.bankForm.controls.hdfcBanksFA as FormArray)
      .at(index)
      .patchValue(
        Object.assign(
          (this.bankForm.controls.hdfcBanksFA as FormArray).at(index).value,
          (event.target as HTMLInputElement).checked
            ? { accountChecked: true }
            : { accountChecked: false }
        )
      );

    this.cdr.detectChanges();
  }

  //Update IDFC Check Box to select Escrow Accounts
  updateCheckBoxIDFCBanks(index: number, event: Event) {
    (this.bankForm.controls.idfcBanksFA as FormArray)
      .at(index)
      .patchValue(
        Object.assign(
          (this.bankForm.controls.idfcBanksFA as FormArray).at(index).value,
          (event.target as HTMLInputElement).checked
            ? { accountChecked: true }
            : { accountChecked: false }
        )
      );
  }

  //Update IBL Check Box to select Escrow Accounts
  updateCheckBoxIBLBanks(index: number, event: Event) {
    (this.bankForm.controls.iblBanksFA as FormArray)
      .at(index)
      .patchValue(
        Object.assign(
          (this.bankForm.controls.iblBanksFA as FormArray).at(index).value,
          (event.target as HTMLInputElement).checked
            ? { accountChecked: true }
            : { accountChecked: false }
        )
      );
  }

  //Update IBL Check Box to select Escrow Accounts
  updateCheckBoxDBSBanks(index: number, event: Event) {
    (this.bankForm.controls.dbsBanksFA as FormArray)
      .at(index)
      .patchValue(
        Object.assign(
          (this.bankForm.controls.dbsBanksFA as FormArray).at(index).value,
          (event.target as HTMLInputElement).checked
            ? { accountChecked: true }
            : { accountChecked: false }
        )
      );
  }

  //Update Axis Check Box to select Escrow Accounts
  updateCheckBoxAxisBanks(index: number, event: Event) {
    (this.bankForm.controls.axisBanksFA as FormArray)
      .at(index)
      .patchValue(
        Object.assign(
          (this.bankForm.controls.axisBanksFA as FormArray).at(index).value,
          (event.target as HTMLInputElement).checked
            ? { accountChecked: true }
            : { accountChecked: false }
        )
      );
  }

  //Update Trustee Access
  updateTrusteeAccess(index: number, value: string, bank: string) {
    switch (bank) {
      case bankTypes.ICICI:
        (this.bankForm.controls.iciciBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.iciciBanksFA as FormArray).at(index)
                .value,
              { trusteeAccess: value }
            )
          );
        break;
      case bankTypes.RBL:
        (this.bankForm.controls.rblBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.rblBanksFA as FormArray).at(index).value,
              { trusteeAccess: value }
            )
          );
        break;
      case bankTypes.YES_BANK:
        (this.bankForm.controls.yesBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.yesBanksFA as FormArray).at(index).value,
              { trusteeAccess: value }
            )
          );
        break;
      case bankTypes.IDFC:
        (this.bankForm.controls.idfcBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.idfcBanksFA as FormArray).at(index).value,
              { trusteeAccess: value }
            )
          );
        break;
      case bankTypes.HDFC:
        (this.bankForm.controls.hdfcBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.hdfcBanksFA as FormArray).at(index).value,
              { trusteeAccess: value }
            )
          );
        break;
      case bankTypes.IBL:
        (this.bankForm.controls.iblBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.iblBanksFA as FormArray).at(index).value,
              { trusteeAccess: value }
            )
          );
        break;
      case bankTypes.DBS:
        (this.bankForm.controls.dbsBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.dbsBanksFA as FormArray).at(index).value,
              { trusteeAccess: value }
            )
          );
        break;
      case bankTypes.AXIS:
        (this.bankForm.controls.axisBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.axisBanksFA as FormArray).at(index).value,
              { trusteeAccess: value }
            )
          );
        break;
    }
  }

  //Admin Disable
  adminDisable(index: number, event: Event, bank: String) {
    switch (bank) {
      case bankTypes.ICICI:
        (this.bankForm.controls.iciciBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.iciciBanksFA as FormArray).at(index)
                .value,
              { disableAdmin: (event.target as HTMLInputElement).checked }
            )
          );
        break;
      case bankTypes.RBL:
        (this.bankForm.controls.rblBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.rblBanksFA as FormArray).at(index).value,
              { disableAdmin: (event.target as HTMLInputElement).checked }
            )
          );
        break;
      case bankTypes.YES_BANK:
        (this.bankForm.controls.yesBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.yesBanksFA as FormArray).at(index).value,
              { disableAdmin: (event.target as HTMLInputElement).checked }
            )
          );
        break;
      case bankTypes.IDFC:
        (this.bankForm.controls.idfcBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.idfcBanksFA as FormArray).at(index).value,
              { disableAdmin: (event.target as HTMLInputElement).checked }
            )
          );
        break;

      case bankTypes.HDFC:
        (this.bankForm.controls.hdfcBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.hdfcBanksFA as FormArray).at(index).value,
              { disableAdmin: (event.target as HTMLInputElement).checked }
            )
          );
        break;

      case bankTypes.IBL:
        (this.bankForm.controls.iblBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.iblBanksFA as FormArray).at(index).value,
              { disableAdmin: (event.target as HTMLInputElement).checked }
            )
          );
        break;
      case bankTypes.DBS:
        (this.bankForm.controls.dbsBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.dbsBanksFA as FormArray).at(index).value,
              { disableAdmin: (event.target as HTMLInputElement).checked }
            )
          );
        break;
      case bankTypes.AXIS:
        (this.bankForm.controls.axisBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.axisBanksFA as FormArray).at(index).value,
              { disableAdmin: (event.target as HTMLInputElement).checked }
            )
          );
        break;
    }
  }

  //Enable IMPS
  enableIMPS(index: number, event: Event, bank: String) {
    switch (bank) {
      case bankTypes.ICICI:
        (this.bankForm.controls.iciciBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.iciciBanksFA as FormArray).at(index)
                .value,
              { isIMPS: (event.target as HTMLInputElement).checked }
            )
          );
        break;
      case bankTypes.RBL:
        (this.bankForm.controls.rblBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.rblBanksFA as FormArray).at(index).value,
              { isIMPS: (event.target as HTMLInputElement).checked }
            )
          );
        break;
      case bankTypes.YES_BANK:
        (this.bankForm.controls.yesBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.yesBanksFA as FormArray).at(index).value,
              { isIMPS: (event.target as HTMLInputElement).checked }
            )
          );
        break;
      case bankTypes.IDFC:
        (this.bankForm.controls.idfcBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.idfcBanksFA as FormArray).at(index).value,
              { isIMPS: (event.target as HTMLInputElement).checked }
            )
          );
        break;
      case bankTypes.IBL:
        (this.bankForm.controls.iblBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.iblBanksFA as FormArray).at(index).value,
              { isIMPS: (event.target as HTMLInputElement).checked }
            )
          );
        break;
      case bankTypes.HDFC:
        (this.bankForm.controls.hdfcBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.hdfcBanksFA as FormArray).at(index).value,
              { isIMPS: (event.target as HTMLInputElement).checked }
            )
          );
        break;
      case bankTypes.DBS:
        (this.bankForm.controls.dbsBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.dbsBanksFA as FormArray).at(index).value,
              { isIMPS: (event.target as HTMLInputElement).checked }
            )
          );
        break;
      case bankTypes.AXIS:
        (this.bankForm.controls.axisBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.axisBanksFA as FormArray).at(index).value,
              { isIMPS: (event.target as HTMLInputElement).checked }
            )
          );
        break;
    }
  }

  //Trustee Threshold Amount
  trusteeThresholdAmt(index: number, event: Event, bank: string) {
    switch (bank) {
      case bankTypes.ICICI:
        (this.bankForm.controls.iciciBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.iciciBanksFA as FormArray).at(index)
                .value,
              { trusteeThresholdAmt: (event.target as HTMLInputElement).value }
            )
          );
        break;
      case bankTypes.RBL:
        (this.bankForm.controls.rblBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.rblBanksFA as FormArray).at(index).value,
              { trusteeThresholdAmt: (event.target as HTMLInputElement).value }
            )
          );
        break;
      case bankTypes.YES_BANK:
        (this.bankForm.controls.yesBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.yesBanksFA as FormArray).at(index).value,
              { trusteeThresholdAmt: (event.target as HTMLInputElement).value }
            )
          );
        break;
      case bankTypes.IDFC:
        (this.bankForm.controls.idfcBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.idfcBanksFA as FormArray).at(index).value,
              { trusteeThresholdAmt: (event.target as HTMLInputElement).value }
            )
          );
        break;

      case bankTypes.HDFC:
        (this.bankForm.controls.hdfcBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.hdfcBanksFA as FormArray).at(index).value,
              { trusteeThresholdAmt: (event.target as HTMLInputElement).value }
            )
          );
        break;

      case bankTypes.IBL:
        (this.bankForm.controls.iblBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.iblBanksFA as FormArray).at(index).value,
              { trusteeThresholdAmt: (event.target as HTMLInputElement).value }
            )
          );
        break;
      case bankTypes.DBS:
        (this.bankForm.controls.dbsBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.dbsBanksFA as FormArray).at(index).value,
              { trusteeThresholdAmt: (event.target as HTMLInputElement).value }
            )
          );
        break;
      case bankTypes.AXIS:
        (this.bankForm.controls.axisBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.axisBanksFA as FormArray).at(index).value,
              { trusteeThresholdAmt: (event.target as HTMLInputElement).value }
            )
          );
        break;
    }
  }

  //Trustee Threshold Frequency
  trusteeThresholdFreq(index: number, event: Event, bank: string) {
    switch (bank) {
      case bankTypes.ICICI:
        (this.bankForm.controls.iciciBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.iciciBanksFA as FormArray).at(index)
                .value,
              { trusteeThresholdFreq: (event.target as HTMLInputElement).value }
            )
          );
        break;
      case bankTypes.RBL:
        (this.bankForm.controls.rblBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.rblBanksFA as FormArray).at(index).value,
              { trusteeThresholdFreq: (event.target as HTMLInputElement).value }
            )
          );
        break;
      case bankTypes.YES_BANK:
        (this.bankForm.controls.yesBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.yesBanksFA as FormArray).at(index).value,
              { trusteeThresholdFreq: (event.target as HTMLInputElement).value }
            )
          );
        break;
      case bankTypes.IDFC:
        (this.bankForm.controls.idfcBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.idfcBanksFA as FormArray).at(index).value,
              { trusteeThresholdFreq: (event.target as HTMLInputElement).value }
            )
          );
        break;
      case bankTypes.HDFC:
        (this.bankForm.controls.hdfcBanksFA as FormArray).at(index).patchValue(
          Object.assign(
            (this.bankForm.controls.hdfcBanksFA as FormArray).at(index).value,
            {
              trusteeThresholdFreq: (event.target as HTMLInputElement).value
            }
          )
        );
        break;

      case bankTypes.IBL:
        (this.bankForm.controls.iblBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.iblBanksFA as FormArray).at(index).value,
              { trusteeThresholdFreq: (event.target as HTMLInputElement).value }
            )
          );
        break;
      case bankTypes.DBS:
        (this.bankForm.controls.dbsBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.dbsBanksFA as FormArray).at(index).value,
              { trusteeThresholdFreq: (event.target as HTMLInputElement).value }
            )
          );
        break;
      case bankTypes.AXIS:
        (this.bankForm.controls.axisBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.axisBanksFA as FormArray).at(index).value,
              { trusteeThresholdFreq: (event.target as HTMLInputElement).value }
            )
          );
        break;
    }
    this.cdr.detectChanges();
  }

  //Trustee Threshold Frequency
  updatePayoutMode(index: number, payoutMode: string, bank: string) {
    switch (bank) {
      case bankTypes.ICICI:
        (this.bankForm.controls.iciciBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.iciciBanksFA as FormArray).at(index)
                .value,
              { payoutMode: payoutMode }
            )
          );
        break;
      case bankTypes.RBL:
        (this.bankForm.controls.rblBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.rblBanksFA as FormArray).at(index).value,
              { payoutMode: payoutMode }
            )
          );
        break;
      // case bankTypes.YES_BANK:
      //   (this.bankForm.controls.yesBanksFA as FormArray)
      //     .at(index)
      //     .patchValue(
      //       Object.assign(
      //         (this.bankForm.controls.yesBanksFA as FormArray).at(index).value,
      //         { payoutMode: (event.target as HTMLInputElement).value }
      //       )
      //     );
      //   break;
      case bankTypes.IDFC:
        (this.bankForm.controls.idfcBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.idfcBanksFA as FormArray).at(index).value,
              { payoutMode: payoutMode }
            )
          );
        break;
      // case bankTypes.IBL:
      //   (this.bankForm.controls.iblBanksFA as FormArray)
      //     .at(index)
      //     .patchValue(
      //       Object.assign(
      //         (this.bankForm.controls.iblBanksFA as FormArray).at(index).value,
      //         { payoutMode: (event.target as HTMLInputElement).value }
      //       )
      //     );
      //   break;
      case bankTypes.DBS:
        (this.bankForm.controls.dbsBanksFA as FormArray)
          .at(index)
          .patchValue(
            Object.assign(
              (this.bankForm.controls.dbsBanksFA as FormArray).at(index).value,
              { payoutMode: payoutMode }
            )
          );
        break;
    }
    this.cdr.detectChanges();
  }

  //Check Bank Selection details
  private checkBankControls(
    bank:
      | RBLBankFormElement
      | YesBankFormElement
      | IDFCBankFormElement
      | ICICIBankFormElement
      | AxisBankFormElement,
    bankName: string
  ):
    | RBLBankMerchantProfile
    | YesBankMerchantProfile
    | IDFCBankMerchantProfile
    | IBLBankMerchantProfile
    | ICICIBankMerchantProfile
    | AxisBankMerchantProfile
    | null {
    let trusteeView = false,
      trusteeApprove = false;
    switch (bank.trusteeAccess) {
      case 'approve': {
        trusteeView = true;
        trusteeApprove = true;
        break;
      }
      case 'view': {
        trusteeView = true;
        trusteeApprove = false;
        break;
      }
      case 'none': {
        trusteeView = false;
        trusteeApprove = false;
        break;
      }
    }

    if (bank.accountChecked) {
      let bankAccount:
        | RBLBankMerchantProfile
        | YesBankMerchantProfile
        | IDFCBankMerchantProfile
        | IBLBankMerchantProfile
        | AxisBankMerchantProfile = {
        trusteeApprove: trusteeApprove,
        trusteeView: trusteeView,
        disableAdmin: bank.disableAdmin,
        isIMPS: bank.isIMPS,
        trusteeThresholdAmt: bank.trusteeThresholdAmt,
        trusteeThresholdFreq: bank.trusteeThresholdFreq
      };

      if (
        bank.payoutMode &&
        [
          bankTypes.ICICI,
          bankTypes.RBL,
          bankTypes.IDFC,
          bankTypes.DBS
        ].includes(bankName)
      ) {
        Object.assign(bankAccount, { paymentMode: bank.payoutMode });
      }

      return bankAccount;
    }
    return null;
  }

  //On Form Submit
  onSubmit() {
    this.errors = [];
    this.banks = [];

    //Select RBL Bank Accounts and map details
    let selectedICICIBanksAccountNumber: ICICIBankMerchantProfile[] = [];
    this.bankForm.controls.iciciBanksFA.value.forEach(
      (result: ICICIBankFormElement, i: number) => {
        let iciciBankAccount: ICICIBankMerchantProfile = this.checkBankControls(
          result,
          bankTypes.ICICI
        ) as ICICIBankMerchantProfile;
        if (iciciBankAccount) {
          iciciBankAccount.accountName = this.iciciBanks[i].accountName;
          iciciBankAccount.accountPrefix = this.iciciBanks[i].accountPrefix;
          iciciBankAccount.accountNo = this.iciciBanks[i].accountNo;
          iciciBankAccount.accountNumber = this.iciciBanks[i].accountNo;
          iciciBankAccount.trusteeMail = this.iciciBanks[i].trusteeMail;
          iciciBankAccount.accountCode = this.iciciBanks[i].accountCode;
          iciciBankAccount.ifsc = this.iciciBanks[i].ifsc;
          iciciBankAccount.enableConnectedBanking = this.iciciBanks[
            i
          ].connectedBanking;
          iciciBankAccount.enableConnectedBankingWithVA = this.iciciBanks[
            i
          ].enableConnectedBankingWithVA;
          selectedICICIBanksAccountNumber.push(iciciBankAccount);
        }
      }
    );

    //Select RBL Bank Accounts and map details
    let selectedRblBanksAccountNumber: RBLBankMerchantProfile[] = [];
    this.bankForm.controls.rblBanksFA.value.forEach(
      (result: RBLBankFormElement, i: number) => {
        let rblBankAccount: RBLBankMerchantProfile = this.checkBankControls(
          result,
          bankTypes.RBL
        ) as RBLBankMerchantProfile;
        if (rblBankAccount) {
          rblBankAccount.accountName = this.rblBanks[i].rblAccountName;
          rblBankAccount.accountNo = this.rblBanks[i].rblAccountNo;
          rblBankAccount.accountNumber = this.rblBanks[i].rblAccountNo;
          rblBankAccount.trusteeMail = this.rblBanks[i].rblTrusteeMail;
          rblBankAccount.accountCode = this.rblBanks[i].rblAccountCode;
          rblBankAccount.upiId = this.rblBanks[i].upiId;
          rblBankAccount.ifsc = this.rblBanks[i].rblIFSC;
          rblBankAccount.enableConnectedBanking = this.rblBanks[
            i
          ].connectedBanking;
          rblBankAccount.enableConnectedBankingWithVA = this.rblBanks[
            i
          ].enableConnectedBankingWithVA;
          selectedRblBanksAccountNumber.push(rblBankAccount);
        }
      }
    );

    //Select Yes Bank Accounts and map details
    let selectedYesBanksAccounts: YesBankMerchantProfile[] = [];
    this.bankForm.controls.yesBanksFA.value.forEach(
      (result: YesBankFormElement, i: number) => {
        let yesBankAccount: YesBankMerchantProfile = this.checkBankControls(
          result,
          bankTypes.YES_BANK
        ) as YesBankMerchantProfile;
        if (yesBankAccount) {
          yesBankAccount.accountName = this.yesBanks[i].yesAccountName;
          yesBankAccount.accountNo = this.yesBanks[i].yesAccountNo;
          yesBankAccount.trusteeMail = this.yesBanks[i].yesTrusteeMail;
          yesBankAccount.accountCode = this.yesBanks[i].yesAccountCode;
          yesBankAccount.enableConnectedBanking = this.yesBanks[
            i
          ].connectedBanking;
          yesBankAccount.enableConnectedBankingWithVA = this.yesBanks[
            i
          ].enableConnectedBankingWithVA;
          selectedYesBanksAccounts.push(yesBankAccount);
        }
      }
    );

    //Select IDFC Bank Accounts and map details
    const selectedIDFCBanksAccounts: IDFCBankMerchantProfile[] = [];
    this.bankForm.controls.idfcBanksFA.value.forEach(
      (result: IDFCBankFormElement, i: number) => {
        let idfcBankAccount: IDFCBankMerchantProfile = this.checkBankControls(
          result,
          bankTypes.IDFC
        ) as IDFCBankMerchantProfile;
        console.log(idfcBankAccount);
        if (idfcBankAccount) {
          //Trustee View for H2H customers to be false
          idfcBankAccount.accountName = this.idfcBanks[i].idfcAccountName;
          idfcBankAccount.trusteeView = false;
          idfcBankAccount.accountNo = this.idfcBanks[i].idfcAccountNo;
          idfcBankAccount.trusteeMail = this.idfcBanks[i].idfcTrusteeMail;
          idfcBankAccount.accountCode = this.idfcBanks[i].idfcAccountCode;
          idfcBankAccount.accountPOBOCode = this.idfcBanks[
            i
          ].idfcAccountPOBOCode;
          idfcBankAccount.ifsc = this.idfcBanks[i].idfcIFSC;
          idfcBankAccount.enableConnectedBanking = this.idfcBanks[
            i
          ].connectedBanking;
          idfcBankAccount.enableConnectedBankingWithVA = this.idfcBanks[
            i
          ].enableConnectedBankingWithVA;
          selectedIDFCBanksAccounts.push(idfcBankAccount);
        }
      }
    );

    const selectedIBLBankAccounts: IBLBankMerchantProfile[] = [];
    this.bankForm.controls.iblBanksFA.value.forEach(
      (result: any, i: number) => {
        let iblBankAccount: IBLBankMerchantProfile = this.checkBankControls(
          result,
          bankTypes.IBL
        ) as IBLBankMerchantProfile;

        if (iblBankAccount) {
          iblBankAccount.accountName = this.iblBanks[i].iblAccountName;
          iblBankAccount.accountNo = this.iblBanks[i].iblAccountNo;
          iblBankAccount.trusteeMail = this.iblBanks[i].iblTrusteeMail;
          iblBankAccount.accountCode = this.iblBanks[i].iblAccountCode;
          selectedIBLBankAccounts.push(iblBankAccount);
        }
      }
    );

    const selectedHDFCBankAccounts: HDFCBankMerchantProfile[] = [];
    this.bankForm.controls.hdfcBanksFA.value.forEach(
      (result: HDFCBankFormElement, i: number) => {
        let hdfcBankAccount = this.checkBankControls(result, bankTypes.HDFC);
        if (hdfcBankAccount) {
          hdfcBankAccount.accountName = this.hdfcBanks[i].hdfcAccountName;
          hdfcBankAccount.accountNo = this.hdfcBanks[i].hdfcAccountNo;
          hdfcBankAccount.trusteeMail = this.hdfcBanks[i].hdfcTrusteeMail;
          hdfcBankAccount.accountCode = this.hdfcBanks[i].hdfcAccountCode;
          selectedHDFCBankAccounts.push(hdfcBankAccount);
        }
      }
    );

    const selectedDBSBankAccounts: DBSBankMerchantProfile[] = [];
    this.bankForm.controls.dbsBanksFA.value.forEach(
      (result: DBSBankFormElement, i: number) => {
        let dbsBankAccount: DBSBankMerchantProfile = this.checkBankControls(
          result,
          bankTypes.DBS
        ) as DBSBankMerchantProfile;
        if (dbsBankAccount) {
          dbsBankAccount.accountName = this.dbsBanks[i].dbsAccountName;
          dbsBankAccount.accountNo = this.dbsBanks[i].dbsAccountNo;
          dbsBankAccount.trusteeMail = this.dbsBanks[i].dbsTrusteeMail;
          dbsBankAccount.accountCode = this.dbsBanks[i].dbsPrefixCode;
          dbsBankAccount.ifsc = this.dbsBanks[i].dbsIFSC;
          dbsBankAccount.enableConnectedBanking = this.dbsBanks[
            i
          ].connectedBanking;
          dbsBankAccount.enableConnectedBankingWithVA = this.dbsBanks[
            i
          ].enableConnectedBankingWithVA;
          selectedDBSBankAccounts.push(dbsBankAccount);
        }
      }
    );

    const selectedAxisBankAccounts: AxisBankMerchantProfile[] = [];
    this.bankForm.controls.axisBanksFA.value.forEach(
      (result: AxisBankFormElement, i: number) => {
        let axisBankAccount: AxisBankMerchantProfile = this.checkBankControls(
          result,
          bankTypes.AXIS
        ) as AxisBankMerchantProfile;
        if (axisBankAccount) {
          axisBankAccount.accountName = this.axisBanks[i].holderName;
          axisBankAccount.accountNo = this.axisBanks[i].id;
          axisBankAccount.trusteeMail =
            this.axisBanks[i].trusteeEmails?.length > 0
              ? this.axisBanks[i].trusteeEmails[0]
              : '';
          axisBankAccount.accountCode = this.axisBanks[i].prefixCode;
          axisBankAccount.ifsc = this.axisBanks[i].ifsc;
          axisBankAccount.paymentMode = 'api';
          axisBankAccount.enableConnectedBanking = this.axisBanks[
            i
          ].connectedBanking;
          axisBankAccount.enableConnectedBankingWithVA = this.axisBanks[
            i
          ].allowChildAccount;
          selectedAxisBankAccounts.push(axisBankAccount);
        }
      }
    );

    if (!this.merchantId) {
      this.bankForm.removeControl('bankAccountVerified');
    }

    if (!this.bankForm.valid) {
      console.log('Invalid form values found');
      this.errors.push('Please fill all the required fields marked with *');
      this.validateAllFormFields(this.bankForm);
      return;
    }
    if (this.bankForm.controls.rblCheckbox.value) {
      this.banks.push({
        bankName: bankTypes.RBL
      });
      if (selectedRblBanksAccountNumber.length <= 0) {
        this.errors = ['Please select RBL Account'];
        this.cdr.detectChanges();
        return;
      }
    }
    if (this.bankForm.controls.iciciCheckbox.value) {
      this.banks.push({
        bankName: bankTypes.ICICI
      });
      if (selectedICICIBanksAccountNumber.length <= 0) {
        this.errors = ['Please select ICICI Bank Account'];
        this.cdr.detectChanges();
        return;
      }
    }

    if (this.bankForm.controls.yesBankCheckbox.value) {
      this.banks.push({
        bankName: bankTypes.YES_BANK
      });
      if (selectedYesBanksAccounts.length <= 0) {
        this.errors = ['Please select YES Bank Account'];
        this.cdr.detectChanges();
        return;
      }
    } else {
      selectedYesBanksAccounts = [];
    }

    if (this.bankForm.controls.idfcBankCheckbox.value) {
      this.banks.push({
        bankName: bankTypes.IDFC
      });
      if (selectedIDFCBanksAccounts.length <= 0) {
        this.errors = ['Please select IDFC Bank Account'];
        this.cdr.detectChanges();
        return;
      }
    }

    if (this.bankForm.controls.hdfcBankCheckbox.value) {
      this.banks.push({
        bankName: bankTypes.HDFC
      });
      if (selectedHDFCBankAccounts.length <= 0) {
        this.errors = ['Please select HDFC Bank Account'];
        this.cdr.detectChanges();
        return;
      }
    }

    if (this.bankForm.controls.dbsCheckbox.value) {
      this.banks.push({
        bankName: bankTypes.DBS
      });
      if (selectedDBSBankAccounts.length <= 0) {
        this.errors = ['Please select DBS Bank Account'];
        this.cdr.detectChanges();
        return;
      }
    }

    if (this.bankForm.controls.axisCheckbox.value) {
      this.banks.push({
        bankName: bankTypes.AXIS
      });
      if (selectedAxisBankAccounts.length <= 0) {
        this.errors = ['Please select Axis Bank Account'];
        this.cdr.detectChanges();
        return;
      }
    }

    if (this.bankForm.controls.iblCheckbox.value) {
      this.banks.push({
        bankName: bankTypes.IBL
      });
    }
    // Select ICICI by default.
    // if (this.banks.length === 0) this.banks.push({ bankName: bankTypes.ICICI });

    const formData = {
      banks: this.banks,
      iciciBanks: selectedICICIBanksAccountNumber,
      rblBanks: selectedRblBanksAccountNumber,
      yesBanks: selectedYesBanksAccounts,
      idfcBanks: selectedIDFCBanksAccounts,
      hdfcBanks: selectedHDFCBankAccounts,
      iblBanks: selectedIBLBankAccounts,
      dbsBanks: selectedDBSBankAccounts,
      axisBanks: selectedAxisBankAccounts
    };
    console.log(this.rblAccountType);
    this._loadingData$.next(true);

    this.merchantService
      .updateProfileDetails(this.merchantId, this.accountId, formData)
      .subscribe(
        resp => {
          console.log(this.iciciAccountType);
          this._loadingData$.next(false);
          this.dataLoaded = true;
          this.ngOnInit();
          if (resp.success) {
            console.log(resp);
            this.toastBody =
              this.merchantId.length > 0
                ? 'Merchant settings updated successfully.'
                : 'Account settings updated successfully.';
            this.toastHead = 'Success';
            this.utilityService.showToast(this.toastHead, this.toastBody, {
              headerClasses: 'bg-success text-white'
            });
            this.cdr.detectChanges();
          }
        },
        (err: any) => {
          this.ngOnInit();
          this._loadingData$.next(false);
          this.errors = err.error.errors;
          this.toastHead = 'Failed';
          this.toastBody = 'Merchant Update Failed';
          this.utilityService.showToast(this.toastHead, this.toastBody, {
            headerClasses: 'bg-danger text-white'
          });
          this.cdr.detectChanges();
        }
      );
  }

  /**
   * Go to Back
   * Page
   */
  goBack() {
    this._location.back();
  }

  /**
   * On Update
   */
  onUpdate() {
    this.bankAccountVerified = false;
    this.cdr.detectChanges();
  }
}
