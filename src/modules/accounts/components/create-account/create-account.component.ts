import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OtpModalComponent } from '@common/components';
import { ModalInfoComponent } from '@common/components/modal-info/modal-info.component';
import { UtilityService } from '@common/services';
import { AccountPayeeDetail } from '@modules/accounts/models';
import { AccountsService } from '@modules/accounts/services';
import { PayeeService } from '@modules/payee/services';
import {
  NgbCalendar,
  NgbDate,
  NgbDateStruct,
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import * as date from 'date-and-time';
import { environment } from 'environments/environment';
import _ from 'lodash';

import smsMsg91TemplateId from '../../../../config/smsMsg91TemplateId';

@Component({
  selector: 'sbpro-create-account',
  templateUrl: './create-account.component.pug',
  styleUrls: ['./create-account.component.scss']
})
export class CreateAccountComponent implements OnInit {
  // initializers
  payee: any;
  otp = 0;
  shareSum = 0;
  descValid = '1';
  payeeValid = '1';
  docsValid = '1';
  selectedDoc = '';
  selectedPayee: any = null;
  @Input() public account: any = null;
  @Input() private doClose: any = '';
  docUrlPrefix: string = environment.apiHost + '/uploads/accounts/';
  @ViewChild('myInput')
  myInputVariable: ElementRef | null = null;
  minDate1!: NgbDateStruct;

  // form toggles and enabling
  currentTab = '1';
  payeeEnabled = true;
  docsEnabled = true;
  shareUnitSelected = false;
  selectedValue = '%';
  isDetailPage = false;
  isAuto = false;
  hiddenOnAuto = false;
  submitted = false;

  // form builders
  descForm!: FormGroup;
  linkPayeeForm!: FormGroup;
  linkedPayeeArray: Array<{}> = new Array();
  docsForm!: FormGroup;
  docsArray: Array<{}> = [];

  // errors
  errors: any = [];

  constructor(
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private accountsService: AccountsService,
    private router: Router,
    private payeeService: PayeeService,
    private calendar: NgbCalendar,
    private modalService: NgbModal,
    private utilityService: UtilityService
  ) {
    const currDate = new Date();
    this.minDate1 = calendar.getNext(
      new NgbDate(
        currDate.getFullYear(),
        currDate.getMonth() + 1,
        currDate.getDate()
      ),
      'd',
      0
    );
  }

  checkboxAction(checkbox: HTMLInputElement, content: ElementRef) {
    if (checkbox.checked) {
      this.errors = [];
      if (this.selectedValue === 'INR') {
        this.errors.push(
          'Auto transfer feature only applicable when payout unit is in %'
        );
        checkbox.checked = false;
        setTimeout(() => {
          this.errors = [];
          this.cdr.detectChanges();
        }, 5000);
        return;
      }
      const modalRef = this.modalService.open(ModalInfoComponent, {
        backdrop: 'static',
        size: 'lg'
      });
      modalRef.componentInstance.doClose = modalRef;
      modalRef.componentInstance.passEntry.subscribe((resp: boolean) => {
        if (resp) {
          console.log('Auto transfer set...');
          this.isAuto = true;
        } else {
          console.log('false');
          checkbox.checked = false;
        }
      });
    } else {
      this.isAuto = false;
    }
  }

  ngOnInit() {
    if (this.account) {
      // mark auto schedule
      if (this.account.shareUnit === '%') {
        this.isAuto = this.account.isAutoTransfer;
        this.hiddenOnAuto = this.isAuto;
      } else {
        this.isAuto = false;
        this.hiddenOnAuto = false;
      }

      // update arrays
      // this.linkedPayeeArray = this.account.payees;
      this.docsArray = this.account.docs;
      if (this.account.payees) {
        this.account.payees.forEach((element: any) => {
          this.account.payeesInfo.forEach((info: any) => {
            if (element.payeeId === info.payeeId) {
              this.linkedPayeeArray.push({ ...element, ...info });
            }
          });
        });
      }

      // update variables and booleans
      if (this.account.shareUnit === '%') {
        this.shareSum += this.account.payees.reduce(
          (a: number, b: AccountPayeeDetail) => a + b.share,
          0
        );
      } else {
        this.selectedValue = 'INR';
      }
      this.payeeEnabled = false;
      this.docsEnabled = false;
      this.isDetailPage = true;

      // update payee list
      this.payeeService.performSearch();
      this.payeeService.payees$.subscribe(resp => {
        this.payee = resp;
        this.payee = _.differenceBy(
          this.payee,
          this.linkedPayeeArray,
          'payeeId'
        );
      });

      // parse date
      this.account.parsedDate = this.account.startDate;

      // description form constructor
      this.descForm = this.formBuilder.group({
        name: [this.account.name, Validators.required],
        purpose: [this.account.purpose, Validators.required],
        email: [this.account.email, [Validators.required, Validators.email]],
        validity: [
          this.account.validity,
          [Validators.required, Validators.min(1)]
        ],
        start_date: [this.account.startDate],
        expectedVolume: [this.account.expectedVolume]
      });

      // link payee form constructor
      this.linkPayeeForm = this.formBuilder.group({
        payeeId: [null],
        payee: [null, Validators.required],
        email: ['', Validators.required],
        share: [null, Validators.required],
        name: [null]
      });

      // documents form constructor
      this.docsForm = this.formBuilder.group({
        type: ['', Validators.required],
        name: [''],
        file: [null, Validators.required]
      });
    } else {
      // update payee list
      this.payeeService.performSearch();
      this.payeeService.payees$.subscribe(resp => {
        this.payee = resp;
      });

      // description form constructor
      this.descForm = this.formBuilder.group({
        name: ['', Validators.required],
        purpose: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        validity: ['', [Validators.required, Validators.min(1)]],
        start_date: [''],
        expectedVolume: ['']
      });

      // link payee form constructor
      this.linkPayeeForm = this.formBuilder.group({
        payeeId: [null],
        payee: [null, Validators.required],
        email: ['', Validators.required],
        share: [null, Validators.required],
        name: [null]
      });

      // documents form constructor
      this.docsForm = this.formBuilder.group({
        docType: ['', Validators.required],
        name: [''],
        file: [null, Validators.required]
      });
    }
  }

  // parse date function
  getParsedDate(inputDate: string) {
    const dateSplit = inputDate.split('/');
    const toDate = new Date(
      dateSplit[1] + '/' + dateSplit[0] + '/' + dateSplit[2]
    );
    const d = new Date(toDate);
    console.log(date.format(d, 'DD-MMM-YYYY'));
    return date.format(d, 'DD MMM YYYY');
  }

  // fetch payee on
  // each search hit
  fetchPayee(term: string) {
    this.payeeService.searchTerm = term;
    this.payeeService.performSearch();
    this.payeeService.payees$.subscribe(resp => {
      this.payee = resp;
      this.payee = _.differenceBy(this.payee, this.linkedPayeeArray, 'payeeId');
      this.cdr.detectChanges();
    });
  }

  // to toggle tabs
  toggle(n: string) {
    switch (n) {
      case '2':
        this.currentTab = '2';
        break;
      case '3':
        this.currentTab = '3';
        break;
      default:
        this.currentTab = '1';
    }
    this.cdr.detectChanges();
  }

  // to enable a section
  // like link payee, documents
  enableSection(section: string) {
    switch (section) {
      case 'payee':
        this.payeeEnabled = false;
        this.descValid = '0';
        this.currentTab = '2';
        break;
      case 'docs':
        this.docsEnabled = false;
        this.payeeValid = '0';
        this.currentTab = '3';
        break;
    }
    this.cdr.detectChanges();
  }

  // function to find invalid controls
  findInvalidControls(form: any) {
    const controls = form.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        this.errors.push('Please enter a valid ' + name);
      }
    }
  }

  /*
  Description Form
  */

  // form validators
  descValidate() {
    this.errors = [];
    if (!this.descForm.valid) {
      this.findInvalidControls(this.descForm);
      setTimeout(() => {
        this.errors = [];
        this.cdr.detectChanges();
      }, 8000);
      return;
    }
    this.enableSection('payee');
  }

  // getters
  get name() {
    return this.descForm.get('name');
  }

  get purpose() {
    return this.descForm.get('purpose');
  }

  get email() {
    return this.descForm.get('email');
  }

  get validity() {
    return this.descForm.get('validity');
  }

  get start_date() {
    return this.descForm.get('start_date');
  }

  get expectedVolume() {
    return this.descForm.get('expectedVolume');
  }

  /*
  Link Payee Form
  */

  // toggle payee
  updatePayee($event: any) {
    this.linkPayeeForm.controls.payee.setValue(this.selectedPayee._id);
    this.linkPayeeForm.controls.payeeId.setValue(this.selectedPayee.payeeId);
    this.linkPayeeForm.controls.email.setValue(this.selectedPayee.email);
    this.linkPayeeForm.controls.name.setValue(this.selectedPayee.accountHolder);
  }

  // form validators
  payeeValidate() {
    if (!this.linkPayeeForm.valid) {
      this.findInvalidControls(this.linkPayeeForm);
      return;
    }
    // if (this.linkPayeeForm.controls['share'].value === 0) {
    //   this.errors.push('Please enter share amount greater than 0.');
    //   return;
    // }
    if (this.selectedValue === '%') {
      if (
        this.shareSum > 100 ||
        this.shareSum + this.linkPayeeForm.controls.share.value > 100
      ) {
        this.errors.push('Payout share cannot exceed 100%.');
        setTimeout(() => {
          this.errors = [];
          this.cdr.detectChanges();
        }, 8000);
        return;
      }
      this.shareSum += this.linkPayeeForm.controls.share.value;
    } else {
      this.isAuto = false;
    }
    this.linkedPayeeArray.push(this.linkPayeeForm.value);
    this.shareUnitSelected = true;
    this.selectedPayee = null;
    this.fetchPayee('');
    // this.payee = _.differenceBy(this.payee, this.linkedPayeeArray, 'payeeId');
    this.linkPayeeForm.reset();
  }

  removePayee(n: number) {
    const payees: any = this.linkedPayeeArray.splice(n, 1);
    if (this.selectedValue === '%') {
      this.shareSum -= parseInt(String(payees[0].share), 10);
    }
    this.fetchPayee('');
  }

  payeeNext() {
    if (this.linkedPayeeArray.length < 1) {
      this.errors.push('Please select at least one payee.');
      setTimeout(() => {
        this.errors = [];
        this.cdr.detectChanges();
      }, 8000);
      return;
    }
    // Auto Transfer validation
    if (this.selectedValue === '%') {
      if (this.isAuto) {
        if (this.shareSum !== 100) {
          this.errors.push(
            'To enable AUTO TRANSFER, please make payee share 100%.'
          );
          setTimeout(() => {
            this.errors = [];
            this.cdr.detectChanges();
          }, 8000);
          return;
        }
      }
    }
    this.enableSection('docs');
    return;
  }

  /*
  Documents Form
  */

  // form validators
  docUp() {
    const element: HTMLElement = document.getElementById(
      'ndocs'
    ) as HTMLElement;
    element.click();
  }

  onfileChange($event: any) {
    this.docsForm.patchValue({
      docType: this.selectedDoc,
      name: $event.target.files[0].name,
      file: $event.target.files[0]
    });
    console.log(this.docsForm.value);
    this.docsValidate();
  }

  docsValidate() {
    if (!this.docsForm.valid) {
      this.findInvalidControls(this.docsForm);
      if (this.myInputVariable) {
        this.myInputVariable.nativeElement.value = null;
      }
      return;
    }
    this.docsArray.push(this.docsForm.value);
    this.docsForm.reset();
    this.selectedDoc = '';
    if (this.myInputVariable) {
      this.myInputVariable.nativeElement.value = null;
    }
  }

  removeDoc(n: number) {
    this.docsArray.splice(n, 1);
  }

  /*
   * submitting full form
   **/
  onSubmit() {
    // all validation before submission
    if (!this.descForm.valid) {
      this.findInvalidControls(this.descForm);
      return;
    }
    if (this.linkedPayeeArray.length < 1) {
      this.errors.push('Please select at least one payee.');
      setTimeout(() => {
        this.errors = [];
        this.cdr.detectChanges();
      }, 8000);
      return;
    }
    if (this.docsArray.length < 1) {
      this.errors.push('Please select at least one file.');
      setTimeout(() => {
        this.errors = [];
        this.cdr.detectChanges();
      }, 8000);
      return;
    }

    // create a submission formData form
    const submitForm = new FormData();

    // parse date from desc form
    const dateObj = this.descForm.get('start_date')?.value;
    let parsedDate;
    if (this.account) {
      // const vdate = this.account.startDate.split('/');
      // const datestring = vdate[1] + '/' + vdate[0] + '/' + vdate[2];
      // parsedDate = new Date(datestring).toISOString();
      parsedDate = this.account.startDate;
    } else {
      parsedDate = new Date(
        dateObj.year,
        dateObj.month - 1,
        dateObj.day
      ).toISOString();
    }

    // set data
    // from: description form
    // to: submit form

    submitForm.append('name', this.descForm.get('name')?.value);
    submitForm.append('email', this.descForm.get('email')?.value);
    submitForm.append('purpose', this.descForm.get('purpose')?.value);
    submitForm.append('validity', this.descForm.get('validity')?.value);
    submitForm.append('startDate', parsedDate);
    submitForm.append('shareUnit', this.selectedValue);
    submitForm.append('isAutoTransfer', JSON.stringify(this.isAuto));
    submitForm.append(
      'expectedVolume',
      this.descForm.get('expectedVolume')?.value
    );

    // set data
    // from: document form
    // to: submit form
    this.docsArray.forEach((obj: any) => {
      submitForm.append(obj.docType, obj.file);
    });

    // set data
    // from: linkedPayee form
    // to: submit form
    submitForm.append('payees', JSON.stringify(this.linkedPayeeArray));

    // submit form
    if (this.account) {
      submitForm.append('id', this.account.accountId);
      this.accountsService
        .updateAccount(this.account.accountId, submitForm)
        .subscribe(resp => {
          if (resp.success) {
            console.log('form submitted successfully... ');
            this.closeModal();
            return resp;
          } else {
            this.errors = resp.errors;
          }
        });
    } else {
      const modalRef = this.modalService.open(OtpModalComponent, {
        backdrop: 'static',
        size: 'md'
      });
      modalRef.componentInstance.doClose = modalRef;
      modalRef.componentInstance.templateId =
        smsMsg91TemplateId.accountCreateOtp;
      modalRef.componentInstance.passOtp.subscribe((otp: number) => {
        if (otp) {
          submitForm.append('otp', otp.toString());
          // call to backend
          this.submitted = true;
          this.cdr.detectChanges();
          this.accountsService.addAccount(submitForm).subscribe(resp => {
            if (resp.success) {
              this.submitted = false;
              console.log('form submitted successfully... ');
              this.accountsService.performSearch();
              this.router.navigate([
                environment.urlPortalPrefix + '/escrow',
                {}
              ]);
              return resp;
            } else {
              this.errors = resp.errors;
              this.submitted = false;
              this.cdr.detectChanges();
            }
          });
        } else {
          console.log('something went wrong with modal');
        }
      });
    }
  }

  closeModal() {
    this.accountsService.performSearch();
    this.doClose.dismiss();
  }
}
