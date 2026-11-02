import { ChangeDetectorRef, Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import {
  FormBuilder, FormControl,
  FormGroup,
  NgSelectOption,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { UtilityService } from '@common/services';
import { Account } from '@modules/accounts/models';
import { AccountsService } from '@modules/accounts/services/accounts.service';
import { ChallanService } from '@modules/challan/services';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { numberToWordsIndian } from './numberToWords';
import { AuthService } from '@modules/auth/services';
import { Merchant } from '@modules/auth/models/merchant.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';


interface Challan {
  payTo: string | undefined;
  payerName: string;
  payerDetail1: string;
  payerDetail2: string;
  contact1: string;
  contact2: string;
  amount: string;
  amountWords: string;
  challanId: string;
}

@Component({
  selector: 'sbpro-challan-form',
  templateUrl: './challan-form.component.pug',
  styleUrls: ['./challan-form.component.scss']
})
export class ChallanFormComponent implements OnInit {
  isPrintable = false;
  errors: Array<string> = [];
  accounts!: Account[];
  accounts$!: Observable<Account[]>;
  merchants: Merchant[] = [];
  selectedAccount!: Account;
  challanForm: FormGroup;
  challan!: Challan | null;
  isAdmin = false;
  selectedMerchant: Merchant | undefined;
  @Output() emitMerchantId: EventEmitter<string> = new EventEmitter<string>();
  loading: boolean = false;
  private _loadingList$ = new BehaviorSubject(false);

  constructor(
    public challanService: ChallanService,
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private router: Router,
    private accountService: AccountsService,
    private authService: AuthService,
    private utilService: UtilityService,
    private accountsService: AccountsService,
    private httpClient: HttpClient
  ) {
    localStorage.removeItem('challan_bool');
    this.isAdmin = this.authService.isSuperAdmin();
    this.challanForm = this.formBuilder.group({
      accountId: [this.selectedAccount, Validators.required],
      payerName: ['', Validators.required],
      payerDetail1: ['', Validators.required],
      payerDetail2: ['', Validators.required],
      contact1: ['', [Validators.required, (val: FormControl) => {
        //localStorage.setItem("bool", "false");
        return this.checkNumberLength(val, 'contact1');
      }]],
      contact2: [''],
      amount: [null, [Validators.required, (val: FormControl) => {
        if (!RegExp('^[0-9]*$').test(val.value)) {
          return { 'Error': `Amount must Contain numbers only` };
        }
      }]],
      amountWords: ['', [Validators.required, (val: FormControl) => {
        if (!RegExp('^[a-zA-Z\\s]*$').test(val.value)) {
          return { 'Error': 'Amount in Words Must contain Alphabets only' };
        }
      }]]
    });
  }

  private _loading$ = new BehaviorSubject(false);

  get loading$(): Observable<boolean> {
    return this._loading$.asObservable();
  }


  get account() {
    return this.challanForm.get('account');
  }

  // // @HostListener('window:beforeunload', ['$event'])
  // confirm(): Observable<boolean> | boolean {
  //   console.log('NAVIGATING>>>>>>');
  //   console.log('i am navigating away');
  //   // if (this.loading) {
  //   //   console.log('no, you wont navigate anywhere');
  //   //   return false;
  //   // }
  //   // console.log('you are going away, goodby');
  //   return false;
  // }


  ngOnDestroy() {
    console.log('NAVIGATING>>>>>>');
    // if(this.challanForm.controls['contact1'].value > 0) {
    //  localStorage.setItem("bool", "false");
    // }
    //this.confirm();
    //this.confirm();
  }

  ngOnInit(): void {
    if (!this.isAdmin) {
      this.getAccounts();
    }
    this.challanForm.controls['amount'].valueChanges.subscribe(change => {
      //console.log(change); // Value inside the input field as soon as it changes
      this.challanForm.controls['amountWords'].setValue(numberToWordsIndian(change));
      this.cdr.detectChanges();
    });
    this.challanForm.valueChanges.subscribe((data) => {
      console.log('Form changes', data);
      this.checkFormValue(data) ? localStorage.setItem('challan_bool', 'false') : localStorage.setItem('challan_bool', 'true');
    });
    this.getMerchants('');
    // this.accountService.account$.subscribe(resp => {
    //   this.accounts = resp;
    //   this.cdr.detectChanges();
    // });
  }

  checkNumberLength(val: FormControl, field: string) {
    //console.log(val);
    if (!RegExp('^[0-9]*$').test(val.value)) {
      return { 'Error': `${field} must Contain numbers only` };
    } else if (val.value.length !== 10) {
      return { 'Error': `${field} : Please enter 10 digit mobile number` };
    } else {
      return null;
    }
  }

  checkFormValue(data: any): boolean {
    for (let key in data) {
      if (data[key] !== null && data[key] !== '' && data[key] !== undefined) {
        return true;
      }
    }
    return false;
  }


  getAccounts() {
    //tslint:disable-next-line:no-any
    const params: any = { page: -1, _project: this.accountsService.project };
    let url = environment.apiPrefix + '/account';
    // checking if merchant is selected..
    if (this.selectedMerchant) {
      this.accountsService.merchantId = this.selectedMerchant.merchantId;
      params.merchantId = this.selectedMerchant.merchantId;
      url = environment.apiPrefix + '/super-admin/account';
    }
    // Hit the call on server
    this.challanService.getAllAccounts(url,params).subscribe((resp: any) => {
        console.log('ACCOUNTS ', resp);
        if (resp.success) {
          console.log(resp.result);
          this.accounts = resp.result;
          this.cdr.detectChanges();
        }
      }, catchError(err => {
        console.error(err);
        return throwError(err);
      })
    );
    // this.accountService.performSearch();
    // this.accountService.account$.subscribe(resp => {
    //   console.log(resp);
    //   this.accounts = resp;
    //   this.cdr.detectChanges();
    // });
  }

  getMerchants(term: string) {
    this._loadingList$.next(true);

    this.accountsService.getMerchants(term);

    this.accountsService.merchant$.subscribe(resp => {
      this._loadingList$.next(false);
      console.log('MERCHANTS ', resp);
      this.merchants = resp;
      this.cdr.detectChanges();
    });
  }


  updateMerchant($event: any) {
    if (this.selectedMerchant) {
      this.emitMerchantId.emit(this.selectedMerchant.merchantId);
      this.getAccounts();
      // this.getBanksAvailable();
      this.cdr.detectChanges();
    } else {
      this.challanForm.reset();
    }
  }

  // fetch account on each key hit
  fetchAccount($event: { term: string; items: object[] }) {
    this.accountService.searchTerm = $event.term;
    this.accountService.performSearch();
  }

  updateAccount() {
    // set form controls
    this.challanForm.controls.accountId.setValue(
      this.selectedAccount?.accountId
    );
  }

  findInvalidControls(form: FormGroup) {
    const controls = form.controls;
    if (controls['accountId'].invalid) {
      this.errors.push('Enter Valid Value in accountId');
    }
    if (controls['payerName'].invalid) {
      this.errors.push('Enter Valid Value in payerName');
    }
    if (controls['payerDetail1'].invalid) {
      this.errors.push('Enter Valid Value in payerDetail1');
    }
    if (controls['payerDetail2'].invalid) {
      this.errors.push('Enter Valid Value in payerDetail2');
    }
    if (controls['contact1'].invalid) {
      // @ts-ignore
      this.errors.push(controls['contact1'].errors.Error);
    }
    // if (controls['contact2'].invalid) {
    //     // @ts-ignore
    //     this.errors.push(controls['contact2'].errors.Error);
    // }
    if (controls['amount'].invalid) {
      // @ts-ignore
      this.errors.push(controls['amount'].errors.Error);
    }
    if (controls['amountWords'].invalid) {
      // @ts-ignore
      this.errors.push(controls['amountWords'].errors.Error);
    }
    // for (const name in controls) {
    //   if (controls[name].invalid) {
    //     // @ts-ignore
    //     this.errors.push(controls[name].errors);
    //   }
    //   // if(controls[name].invalid && name === "contact1"){
    //   //   console.log(controls[name].errors);
    //   //   // @ts-ignore
    //   //   this.errors.push(controls[name].errors.Error);
    //   // }
    // }
  }

  genNew() {
    console.log('navigating');
    window.location.reload();
  }

  onSubmit() {
    console.log('SUBMIT CALLEED');
    localStorage.setItem('challan_bool', 'true');
    this.errors = [];
    if (!this.challanForm.valid) {
      this.findInvalidControls(this.challanForm);
      return;
    }

    // this.challanForm.addControl('Merchant', new FormControl('', Validators.required)); // to add merchant field in form
    // console.log(this.challanForm);

    this._loading$.next(true);
    // @ts-ignore
    this.challanService.create(this.challanForm.value, this.isAdmin, this.selectedMerchant?.merchantId).subscribe(resp => {
      this._loading$.next(false);
      if (resp.success) {
        this.challan = {
          payTo: environment.challanPayTo,
          payerName: resp.result.payerName,
          payerDetail1: resp.result.payerDetail1,
          payerDetail2: resp.result.payerDetail2,
          contact1: resp.result.contact1,
          contact2: resp.result.contact2 || '',
          amount: resp.result.amount,
          amountWords: resp.result.amountWords,
          challanId: resp.result.challanId
        };

        this.router.navigate(
          [environment.urlPortalPrefix + '/challan/'],
          { state: { challan: resp.result } }
        );
        this.cdr.detectChanges();
      }
    });
  }
}
