import {
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  HostListener,
  Input,
  OnInit
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilityService } from '@common/services';
import { EscrowPageWidgetsPageComponent } from '@modules/escrow-page-widgets/containers';
import {
  EscrowPage,
  EscrowPageChildPage,
  FullForm
} from '@modules/escrow-pages/models';
import { EscrowPagesService } from '@modules/escrow-pages/services';
import { NgxSpinnerService } from 'ngx-spinner';
import { BehaviorSubject, Subscription, interval } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { escrowPageTransactionStatus } from '../../data/escrow-page-transaction-status.constant';
import { Account } from '../../models/escrow-pages.model';
@Component({
  selector: 'sbpro-preview',
  templateUrl: './preview.component.pug',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit {
  @Input() private doClose: any;
  @Input() pageId: string | null = '';
  @Input() isModal = false;
  @Input() private form?: FullForm;
  escrowPage: EscrowPage = {} as EscrowPage;
  productFields?: EscrowPageChildPage;
  customerFields?: EscrowPageChildPage;
  // @ViewChild('viewContainer', { read: ViewContainerRef })
  // viewContainer!: ViewContainerRef;
  view = 1;
  errors: string[] = [];
  validating = false;
  private _widget?: ComponentRef<EscrowPageWidgetsPageComponent>;
  accounts: Account[] = [];
  items = [];
  selectedAccount: Account | null = null;
  paymentDetailsForm!: FormGroup;
  amount: string | null = '0';
  paymentSuccessful = false;
  paymentFailed = false;
  orderId = '';
  accountId: string = '';
  emailError = '';
  nameError = '';
  panError = '';
  aadhaarError = '';
  customError = '';
  mobileError = '';
  accountError = '';
  amountError = '';
  innerWidth: number = 0;
  paymentPending = false;
  paymentId = '';
  mobileViewWidth: number = 0;
  updating: boolean = false;

  values: any = {};

  private _loadingList$ = new BehaviorSubject(false);
  constructor(
    private formBuilder: FormBuilder,
    private escrowPageService: EscrowPagesService,
    private activatedRoute: ActivatedRoute,
    private componentFactoryResolver: ComponentFactoryResolver,
    private cdr: ChangeDetectorRef,
    private spinner: NgxSpinnerService,
    private utilityService: UtilityService
  ) {
    this.spinner.show();

    console.log('Constructor');
    this.activatedRoute.paramMap.subscribe(resp => {
      try {
        if (resp.get('escrowPageId')) {
          this.pageId = resp.get('escrowPageId');
        }
      } catch (e) {
        console.error(e);
      }
    });

    this.activatedRoute.queryParamMap.subscribe(resp => {
      console.log('RESPONSE FOR order Id ', resp);
      this.orderId = resp.get('order_id') || '';
    });

    if (this.orderId) {
      this.view = 2;
    } else {
      this.escrowPageService.getEscrowPage(this.pageId).subscribe(
        (resp: any) => {
          console.log(resp);
          if (resp.success) {
            this.escrowPage = resp.result;
            this.customerFields = resp.result.childPages[1];
            this.productFields = resp.result.childPages[0].fields;
            this.accounts = resp.result.accounts;
            this.items = resp.result.accounts;
            if (!this.escrowPage.bypassCustomerForm) {
              this.spinner.hide();
              // window.location.href = this.escrowPage.paymentLink || '';
              this.renderForm();
            }
          }
        },
        (error: any) => {
          console.log(error);
        }
      );
    }

    this.paymentDetailsForm = this.formBuilder.group({
      account: [null, Validators.required],
      email: [null, [Validators.required, Validators.email]],
      mobile: [null, Validators.required],
      amount: [null, Validators.required],
      name: [null, Validators.required]
    });
  }

  page = 1;
  loading = false;
  pollSubscription?: Subscription;

  ngOnInit(): void {
    this.spinner.show();
    this.innerWidth = window.innerWidth;
    this.mobileViewWidth = this.innerWidth;
    console.log(this.pageId);

    this.activatedRoute.queryParamMap.subscribe(resp => {
      console.log('RESPONSE FOR order Id ', resp);
      this.orderId = resp.get('order_id') || '';
    });

    this.escrowPageService.getEscrowPage(this.pageId).subscribe(
      (resp: any) => {
        console.log(resp);
        if (resp.success) {
          // this.spinner.hide();
          this.escrowPage = resp.result;
          this.customerFields = resp.result.childPages[1];
          this.productFields = resp.result.childPages[0].fields;
          this.accounts = resp.result.accounts;
          this.items = resp.result.accounts;

          if (!this.escrowPage.bypassCustomerForm || this.orderId) {
            this.spinner.hide();
            // window.location.href = this.escrowPage.paymentLink || '';
            this.renderForm();
          } else {
            this.escrowPageService
              .createBypassedOrder(this.pageId as string)
              .subscribe(
                (resp: any) => {
                  if (resp?.success) {
                    window.location.href = resp.result.paymentLink || '';
                  }
                  console.log(resp);
                },
                error => {
                  console.log(error);
                }
              );
          }
        }
      },
      error => {
        console.log(error);
      }
    );

    if (this.orderId) {
      this.view = 2;
      this.loading = true;
      this.paymentPending = true;
      this.cdr.detectChanges();
      this.spinner.show();
      const pollInterval = 5000; // Poll every 5 seconds

      let success = false;

      this.pollSubscription = interval(pollInterval)
        .pipe(
          takeWhile(
            () => !success && !this.paymentFailed && !this.paymentSuccessful
          )
        )
        .subscribe(() => {
          this.escrowPageService
            .getOrderStatus({
              escrowPageId: this.pageId,
              orderId: this.orderId
            })
            .subscribe((resp: any) => {
              console.log(resp);
              if (resp.success) {
                this.paymentId = resp.result.orderId;
                this.amount = parseFloat(resp.result.amount).toFixed(2);

                const latestStatus =
                  resp.result.status;

                if (
                  latestStatus === escrowPageTransactionStatus.SUCCESSFUL ||
                  latestStatus === escrowPageTransactionStatus.SETTLED
                ) {
                  this.paymentSuccessful = true;
                  this.view = 2;
                  success = true;
                  this.spinner.hide();
                  this.cdr.detectChanges();
                } else if (
                  latestStatus === escrowPageTransactionStatus.FAILED
                ) {
                  this.paymentFailed = true;
                  success = true;
                  this.view = 2;
                  this.spinner.hide();
                  this.cdr.detectChanges();
                } else if (
                  latestStatus === escrowPageTransactionStatus.SENT_TO_PG
                ) {
                  this.paymentPending = true;
                  this.view = 2;
                  this.cdr.detectChanges();
                }
              }
            });
        });
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe from the pollSubscription if it exists
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
    }
  }

  searchAccount(accountName: string) {
    this._loadingList$.next(true);

    console.log('searchAccount');
    console.log(accountName);
    let arr = this.items;

    if (accountName.length > 0) {
      this.accounts = [];
      arr.map((element: any) => {
        if (element.name.includes(accountName)) {
          this.accounts.push(element);
        }
      });
      this._loadingList$.next(false);
    } else {
      this.accounts = this.items;
    }
    console.log(this.accounts);
    this.cdr.detectChanges();
  }

  updateAccount() {
    if (this.selectedAccount) {
      this.accountId = this.selectedAccount.accountName;
    } else {
      this.paymentDetailsForm.reset();
    }
    this.accountError = '';
    this.cdr.detectChanges();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.innerWidth = window.innerWidth;
    console.log(this.innerWidth);
    console.log('onReSize');
  }

  addValue(event: any) {
    try {
      console.log(event.target.value);
      this.values[event.target.placeholder.toLowerCase()] = event.target.value;
      if (event.target.placeholder.toLowerCase() === 'pan') {
        this.validatePan(event.target.value);
      }

      if (event.target.placeholder.toLowerCase() === 'aadhaar') {
        this.validateAadhaar(event.target.value);
      }

      this.cdr.detectChanges();
    } catch (error) {
      console.log(error);
    }
  }

  private validatePan(pan: string): boolean {
    // let pan = event.target.value;
    let validation = pan.match(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/);
    if (!validation) {
      this.panError = 'Enter a valid PAN.';
      return false;
    } else {
      this.panError = '';
      this.cdr.detectChanges();
      return true;
    }
  }

  private validateAadhaar(aadhaar: string): boolean {
    // let aadhaar = event.target.value;
    let validation = aadhaar.match(/^[0-9]{12}$/);
    if (!validation) {
      this.aadhaarError = 'Enter a valid AADHAAR.';
      return false;
    } else {
      this.aadhaarError = '';
      this.cdr.detectChanges();
      return true;
    }
  }

  async submit() {
    this.updating = true;
    this.cdr.detectChanges();
    console.log(this.paymentDetailsForm.value);
    console.log(this.customerFields?.fields);
    console.log(this.values);
    this.accountError = '';
    this.amountError = '';
    this.nameError = '';
    this.emailError = '';
    this.panError = '';
    if (this.isModal) {
      this.nextView();
      return;
    }
    // /**
    //  * field validation
    //  */

    if (this.escrowPage) {
      // this.escrowPage.childPages[1] = this.customerFields;
      if (!this.selectedAccount) {
        this.accountError = 'Select an Escrow.';
        this.updating = false;
        this.cdr.detectChanges();
        return;
      }

      if (this.amount && parseFloat(this.amount) < 1) {
        this.amountError = 'Enter a valid amount';
        this.updating = false;
        this.cdr.detectChanges();
        return;
      }

      if (this.nameError || !this.paymentDetailsForm.controls['name'].value) {
        this.nameError = 'Enter a valid Name.';
        this.updating = false;
        this.cdr.detectChanges();

        return;
      }

      if (this.emailError || !this.paymentDetailsForm.controls['email'].value) {
        this.emailError = 'Enter a valid Email.';
        this.updating = false;
        this.cdr.detectChanges();

        return;
      }

      if (
        this.mobileError ||
        !this.paymentDetailsForm.controls['mobile'].value
      ) {
        this.mobileError = 'Enter a valid mobile number.';
        this.updating = false;
        this.cdr.detectChanges();
        return;
      }

      if (this.escrowPage.childPages?.length >= 1 && this.customerFields) {
        this.escrowPage.childPages[1] = this.customerFields;
        for (let field of this.escrowPage.childPages[1].fields) {
          if (Object.keys(this.values).includes(field.label.toLowerCase())) {
            field.value = this.values[field.label?.toLowerCase()];
          } else {
            field.value = this.paymentDetailsForm.controls[
              field.label?.toLowerCase()
            ]?.value;
          }
          if (field.type === 'custom' && field.required && !field.value) {
            this.customError = `${field.label} is required`;
            this.updating = false;
            this.cdr.detectChanges();
            return;
          }
          if (field.label === 'AADHAAR' && field.required && !field.value) {
            this.aadhaarError = 'AADHAAR is required';
            this.updating = false;
            this.cdr.detectChanges();
            return;
          } else if (
            field.label === 'AADHAAR' &&
            field.required &&
            !this.validateAadhaar(field.value as string)
          ) {
            this.updating = false;
            this.cdr.detectChanges();
            return;
          }
          if (field.label === 'PAN' && field.required && !field.value) {
            this.panError = 'PAN is required';
            this.updating = false;
            this.cdr.detectChanges();
            return;
          } else if (
            field.label === 'PAN' &&
            field.required &&
            !this.validatePan(field.value as string)
          ) {
            this.updating = false;
            this.cdr.detectChanges();
            return;
          }
        }
      }

      let data = {
        // escrowPageId: this.escrowPage.escrowPageId,
        accountId: this.selectedAccount.id,
        amount: Number.parseFloat(
          this.paymentDetailsForm.controls['amount'].value.toString()
        ),
        // order_currency: 'INR',
        customerDetails: {
          customerName: this.paymentDetailsForm.controls['name'].value,
          customerEmail: this.paymentDetailsForm.controls['email'].value,
          customerPhone: this.paymentDetailsForm.controls[
            'mobile'
          ].value.toString()
        },
        childPages: this.escrowPage.childPages
      };

      this.escrowPageService
        .createOrder(this.escrowPage.escrowPageId, data)
        .subscribe((resp: any) => {
          if (resp.success) {
            if (this.escrowPage && this.customerFields && resp.result.orderId) {
              Object.assign(this.escrowPage, { orderId: resp.result.orderId });
              window.location.href = resp.result.paymentLink;
            }
            this.updating = false;
            this.cdr.detectChanges();
          } else {
            console.log('error occured');
            this.updating = false;
            this.cdr.detectChanges();
          }
        });
    }
  }

  setButtonText($event: any) {
    console.log('setButtonText');
    console.log(this.amount);
    this.amount = parseFloat(
      this.paymentDetailsForm.controls['amount'].value
    ).toFixed(2);

    this.cdr.detectChanges();
  }

  async validate() {
    if (this.isModal) {
      this.nextView();
      return;
    }
    this.validating = true;
    console.log('\n\ncalling required function....');
    const required = await this._widget?.instance._validate();
    console.log('overall required ---> ', required);
    if (!required) {
      this.validating = false;
      return;
    }
    console.log('\n\ncalling validate function....');
    const verification = await this._widget?.instance._validate();
    console.log(verification);
    if (!verification) {
      this.validating = false;
      return;
    }
    this.nextView();
  }

  findInvalidControls(form: FormGroup) {
    const controls = form.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        this.errors.push('Please enter a valid ' + name);
      }
    }
  }

  validateForm(formGroup: FormGroup) {
    // {1}
    Object.keys(this.paymentDetailsForm.controls).forEach(field => {
      // {2}
      const control = this.paymentDetailsForm.get(field); // {3}
      if (control instanceof FormControl) {
        // {4}
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        // {5}
        this.validateForm(control); // {6}
      }
    });
  }

  validateEmail() {
    try {
      let email = this.paymentDetailsForm.controls['email'].value;
      let validation = email
        .toLowerCase()
        .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
      if (!validation) {
        this.emailError = 'Enter a valid email address.';
      } else {
        this.emailError = '';
        this.cdr.detectChanges();
      }
      this.cdr.detectChanges();
    } catch (error) {
      console.log(error);
    }
  }

  validateName() {
    try {
      let name = this.paymentDetailsForm.controls['name'].value;
      let validation = name.toLowerCase().match(/^[a-zA-Z .]+$/);
      if (!validation) {
        this.nameError = 'Enter a valid Name.';
      } else {
        this.nameError = '';
        this.cdr.detectChanges();
      }
      this.cdr.detectChanges();
    } catch (error) {
      console.log(error);
    }
  }

  validateKeyDownMobile(e: any) {
    try {
      let name = e.key;
      let validation = name.toLowerCase().match(/^\d$/);
      let mobile: number = this.paymentDetailsForm.controls['mobile'].value;
      if (
        (validation && (mobile?.toString()?.length ?? 0) + 1 <= 10) ||
        name === 'Backspace' ||
        name === 'Delete' ||
        name === 'ArrowRight' ||
        name === 'ArrowLeft'
      ) {
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  validateMobile() {
    try {
      let mobile = this.paymentDetailsForm.controls['mobile'].value;
      let validation = mobile
        .toString()
        .toLowerCase()
        .match(/^\d{10}$/);
      if (!validation) {
        this.mobileError = 'Enter a valid mobile number.';
        return false;
      } else {
        this.mobileError = '';
        this.cdr.detectChanges();
        return true;
      }
    } catch (error) {
      console.log(error);
    }
  }

  nextView() {
    this.view += 1;
    // if (this.view !== 1) {
    // this.viewContainer.clear();
    // }
    this.cdr.detectChanges();
  }

  prevView() {
    this.validating = false;
    this.view -= 1;
    this.renderForm();
    // if (this.view !== 1) {
    // this.viewContainer.clear();
    // }
    this.cdr.detectChanges();
  }

  renderForm() {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
      EscrowPageWidgetsPageComponent
    );
    let widget: ComponentRef<EscrowPageWidgetsPageComponent>;

    // this.viewContainer.clear(); // Clear the view

    // widget = this.viewContainer.createComponent(componentFactory);
    // if (this.customerFields) {
    //   widget.instance.data = this.customerFields;
    // }
    // this._widget = widget;
    // widget.instance.livePage = true;

    // widget.instance.change.subscribe((value: EscrowPageChildPage) => {
    //   this.customerFields = value;
    //   console.log(this.customerFields);
    // });
    this.spinner.hide();
    this.cdr.detectChanges();
  }

  captureData() {
    this.loading = true;
    console.log(this.form?.customerDetail);
    setTimeout(() => {
      this.next();
    }, 5000);
  }

  next() {
    this.loading = false;
    this.page += 1;
  }

  genLink() {
    this.doClose.close(true);
  }

  closer() {
    this.doClose.close(false);
  }
}
