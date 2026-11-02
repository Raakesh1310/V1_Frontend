import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { AccountsService } from '@modules/accounts/services';
import {
  NgbCalendar,
  NgbDate,
  NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'sbpro-accounts-create-new-account',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './accounts-create-new-account.component.pug',
  styleUrls: ['accounts-create-new-account.component.scss']
})
export class AccountsCreateNewAccountComponent implements OnInit {
  model!: NgbDateStruct;
  accountForm!: FormGroup;
  myFiles: any[] = [];
  errors: any = [];
  startDateMin!: NgbDateStruct;
  gAuthEnabled = false;

  constructor(
    private formBuilder: FormBuilder,
    private accountsService: AccountsService,
    private router: Router,
    private calendar: NgbCalendar,
    private cdr: ChangeDetectorRef
  ) {
    // Update Date field limitations
    const dNow = new Date();
    this.startDateMin = calendar.getNext(
      new NgbDate(dNow.getFullYear(), dNow.getMonth() + 1, dNow.getDate()),
      'd',
      0
    );
  }

  validateAllFormFields(formGroup: FormGroup) {
    // {1}
    Object.keys(this.accountForm.controls).forEach(field => {
      // {2}
      const control = this.accountForm.get(field); // {3}
      if (control instanceof FormControl) {
        // {4}
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        // {5}
        this.validateAllFormFields(control); // {6}
      }
    });
  }

  ngOnInit() {
    this.accountForm = this.formBuilder.group({
      name: ['', Validators.required],
      purpose: ['', Validators.required],
      email: ['', Validators.required],
      validity: ['', Validators.required],
      start_date: ['', Validators.required],
      expectedVolume: ['', Validators.required]
    });

    // this.validateAllFormFields(this.accountForm);
  }

  docUp() {
    const element: HTMLElement = document.getElementById(
      'ndocs'
    ) as HTMLElement;
    element.click();
  }

  onfileChange($event: any) {
    for (let i = 0; i < $event.target.files.length; i++) {
      this.myFiles.push($event.target.files[i]);
    }
    console.log(this.myFiles);
    this.cdr.detectChanges();
  }

  removeFile(i: number) {
    this.myFiles.splice(i, 1);
  }

  get name() {
    return this.accountForm.get('name');
  }

  get purpose() {
    return this.accountForm.get('purpose');
  }

  get email() {
    return this.accountForm.get('email');
  }

  get validity() {
    return this.accountForm.get('validity');
  }

  get start_date() {
    return this.accountForm.get('start_date');
  }

  get expectedVolume() {
    return this.accountForm.get('expectedVolume');
  }

  onSubmit() {
    if (!this.accountForm.valid || !this.purpose?.touched) {
      console.log('Invalid form values found');
      this.validateAllFormFields(this.accountForm);
      this.errors.push('Please enter the correct values.');
      return;
    }

    const dateObj = this.accountForm.get('start_date')?.value;
    const parsedDate = new Date(
      dateObj.year,
      dateObj.month - 1,
      dateObj.day
    ).toISOString();

    // Account Data
    const formData = new FormData();
    formData.append('name', this.accountForm.get('name')?.value);
    formData.append('email', this.accountForm.get('email')?.value);
    formData.append('purpose', this.accountForm.get('purpose')?.value);
    formData.append('validity', this.accountForm.get('validity')?.value);
    formData.append('startDate', parsedDate);
    formData.append(
      'expectedVolume',
      this.accountForm.get('expectedVolume')?.value
    );

    this.myFiles.forEach(file => {
      formData.append('uploads', file);
    });
    // Adding the Object
    this.accountsService.addAccount(formData).subscribe(resp => {
      if (resp.success) {
        this.accountsService.performSearch();
        this.router.navigate([environment.urlPortalPrefix + '/escrow']);

        return resp;
      }

      // Show error
    });
  }
}
