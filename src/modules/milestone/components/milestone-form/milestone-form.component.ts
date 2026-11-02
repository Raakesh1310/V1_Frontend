import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Account } from '@modules/accounts/models/accounts.model';
import { AccountsService } from '@modules/accounts/services';
import { Payee } from '@modules/payee/models';
import { PayeeService } from '@modules/payee/services';
import { Observable } from 'rxjs';

@Component({
  selector: 'sbpro-milestone-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './milestone-form.component.pug',
  styleUrls: ['milestone-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MilestoneFormComponent implements OnInit {
  private _errors!: string[];
  private _accounts$!: Observable<Account[]>;
  private _payees!: Payee[];
  private _accountSelected!: Account;
  private _payeeSelected!: Payee;
  private _form!: FormGroup;
  private _disableForm = false;

  /**
   * Input for Form component
   */
  @Input() private showAccountDropdown = true;
  @Input() private showPayeeDropdown = true;
  @Input() private accountId!: string;
  @Input() private payeeId!: string;

  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountsService,
    private payeeService: PayeeService
  ) {
    // this._disableForm = true;
  }

  ngOnInit() {
    this._form = this.formBuilder.group({
      title: [null, Validators.required],
      description: [null, Validators.required],
      amount: [null, Validators.required],
      // remarks: [null],
      // paymentDate: [null],
      account: [this._accountSelected?.accountId, Validators.required]
    });

    /**
     * Subscribe to account
     * from AccountService Instance
     */
    this._accounts$ = this.accountService.account$;

    /**
     * Trigger search for account
     * Initially, for initial values
     */
    this.accountService.performSearch();
  }

  submit() {
    this._disableForm = true;
    console.log('Submitting the form');
  }

  updateAccountSelected() {
    /**
     * Patch the form
     * with selected account's value
     */
    this._form.controls.title.setValue(this._accountSelected.accountId);

    /**
     * Update Payee list
     * whose are came in selected
     * account
     */
    this._payees = (this._accountSelected.payees as unknown) as Payee[];
    this._accountSelected.payees.forEach(accountPayee => {
      const payee = this._accountSelected.payeesInfo.find(
        item => item.payeeId === accountPayee.payeeId
      );
      if (payee) {
        this._payees.push(payee);
      }
    });
  }

  updatePayeeSelected() {}

  disableForm() {
    this._form.controls.title.disable();
    this._form.controls.description.disable();
  }

  enableForm() {
    this._form.controls.title.enable();
    this._form.controls.description.enable();
  }

  // tslint:disable-next-line:no-any
  fetchAccounts($event: any) {
    /**
     * Set the Search term
     * in account service
     */
    this.accountService.searchTerm = $event.term;

    /**
     * And then
     * perform search
     */
    this.accountService.performSearch();
  }
}
