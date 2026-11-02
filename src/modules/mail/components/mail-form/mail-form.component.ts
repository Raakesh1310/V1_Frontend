import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  Merchant,
  MerchantResponseModel
} from '@modules/auth/models/merchant.model';
import { UserMerchantResponseModel } from '@modules/auth/models/user-merchant-response.model';
import { MailInput, Recipient } from '@modules/mail/models';
import { MailService } from '@modules/mail/services';
import { environment } from 'environments/environment';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'sbpro-mail-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mail-form.component.pug',
  styleUrls: ['mail-form.component.scss']
})
export class MailFormComponent implements OnInit {
  /**
   *    DROPDOWN SETTINGS
   */
  loading = false;
  disabled = false;
  ShowFilter = true;
  limitSelection = false;
  selectedItems: Recipient[] = [];
  dropdownSettings: IDropdownSettings = {};

  /**
   *    STANDALONE FORM BINDINGS
   */

  recipients: Recipient[] = [];
  subject: string = '';
  body: string = '';

  /**
   *    TOGGLERS AND DATA VARIABLES
   */
  merchants: Merchant[] = [];
  customMails = '';
  dropDownMails = [];
  showCustomMail = false;
  errors: string[] = [];

  constructor(
    private fb: FormBuilder,
    private mailService: MailService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.mailService.getMerchants().subscribe(
      (resp: MerchantResponseModel) => {
        this.merchants = resp.result;
        console.log(this.merchants);
      },
      err => {
        this.errors = ['could not load recipients. please try again later.'];
        this.cdr.detectChanges();
      }
    );
  }

  ngOnInit() {
    this.selectedItems = [];
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'title',
      textField: 'email',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: this.ShowFilter
    };
  }

  toogleShowFilter() {
    this.ShowFilter = !this.ShowFilter;
    this.dropdownSettings = Object.assign({}, this.dropdownSettings, {
      allowSearchFilter: this.ShowFilter
    });
  }

  handleLimitSelection() {
    if (this.limitSelection) {
      this.dropdownSettings = Object.assign({}, this.dropdownSettings, {
        limitSelection: 2
      });
    } else {
      this.dropdownSettings = Object.assign({}, this.dropdownSettings, {
        limitSelection: null
      });
    }
  }

  onSubmit() {
    this.loading = true;

    this.dropDownMails.map((merchant: Merchant) =>
      this.recipients.push({ email: merchant.email })
    );
    if (this.customMails) {
      this.customMails
        .split(',')
        .map(mail => this.recipients.push({ email: mail }));
      this.recipients = this.recipients.concat();
    }

    let data: MailInput = {
      subject: this.subject,
      body: this.body,
      recipients: this.recipients
    };

    console.log(data);
    this.mailService.sendMail(data).subscribe(
      resp => {
        this.loading = false;
        if (resp.success) {
          this.router.navigate([environment.urlAdminPrefix + '/mail/']);
        }
        this.cdr.detectChanges();
      },
      err => {
        this.loading = false;
        console.log(err.error.errors);
        this.errors = ['Email Could not be sent. Please try again later.'];
        this.cdr.detectChanges();
      }
    );
  }
}
