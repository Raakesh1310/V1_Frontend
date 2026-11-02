import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@modules/auth/services';
import { DealDocument, DealParty, dealRoles } from '@modules/deal/models';
import { DealService } from '@modules/deal/services';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'sbpro-deal-party-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './deal-party-detail.component.pug',
  styleUrls: ['deal-party-detail.component.scss']
})
export class DealPartyDetailComponent implements OnInit {
  dealparty1Form: FormGroup;
  dealparty2Form: FormGroup;
  @Input() errors: string[] = [];

  @Input() deal?: DealDocument;
  @Input() isEditDeal?: boolean;
  @Input() dealParty1?: DealParty;
  @Input() dealParty2?: DealParty;
  @Input() viewMode = false;
  isSuperAdmin = this.authService.isSuperAdmin();

  @Output() emitPatchDealParty1: EventEmitter<DealParty> = new EventEmitter<
    DealParty
  >();
  @Output() emitPatchDealParty2: EventEmitter<DealParty> = new EventEmitter<
    DealParty
  >();

  @Input() myRole = dealRoles.Landlord;
  @Input() loading = false;
  @Input() tabCount = 0;
  @Input() currentTab = 0;
  @Output() emitNextTab: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() emitMyRole: EventEmitter<string> = new EventEmitter<string>();
  @Output() emitSetTab: EventEmitter<number> = new EventEmitter<number>();
  constructor(
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private calendar: NgbCalendar,
    private dealService: DealService,
    private _location: Location
  ) {
    this.dealparty1Form = this.formBuilder.group({
      role: [dealRoles.Landlord, Validators.required],
      email: [this.authService.getFullName(), Validators.required],
      mobile: [this.authService.getEmail(), Validators.required],
      name: [this.authService.getMobile(), Validators.required]
    });
    this.dealparty2Form = this.formBuilder.group({
      role: [
        this.dealparty1Form.controls.role.value === dealRoles.Landlord
          ? dealRoles.Tenant
          : dealRoles.Landlord,
        Validators.required
      ],
      email: ['',  [Validators.required, Validators.email]],
      mobile: [0, [Validators.pattern('^[0-9]{10}$'), Validators.required]],
      name: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.dealparty1Form.controls.role.setValue(
      this.dealParty1?.role || dealRoles.Landlord
    );
    this.dealparty1Form.controls.email.setValue(
      this.dealParty1?.email || this.authService.getEmail()
    );
    this.dealparty1Form.controls.mobile.setValue(
      this.dealParty1?.mobile || this.authService.getMobile()
    );
    this.dealparty1Form.controls.name.setValue(
      this.dealParty1?.name || this.authService.getFullName()
    );

    this.dealparty2Form.controls.role.setValue(this.dealParty2?.role);
    this.dealparty2Form.controls.email.setValue(this.dealParty2?.email);
    this.dealparty2Form.controls.mobile.setValue(this.dealParty2?.mobile);
    this.dealparty2Form.controls.name.setValue(this.dealParty2?.name);
    this.tabCount = 1;
    this.emitSetTab.emit(this.tabCount);
  }

  get name() {
    return this.dealparty2Form.get('name');
  }

  get email() {
    return this.dealparty2Form.get('email');
  }

  get mobile() {
    return this.dealparty2Form.get('mobile');
  }

  submitTenantDetail() {
    if (!this.dealparty2Form.valid) {
      this.markInvalidControls(this.dealparty2Form);
      return;
    }
    this.emitPatchDealParty2.emit(this.dealparty2Form.value);
    this.emitPatchDealParty1.emit(this.dealparty1Form.value);

    if (this.tabCount === 1) {
      this.unlockNext();
    }
  }

  findInvalidControls(form: FormGroup) {
    const controls = form.controls;
    //Clear Errors array on every check
    this.errors = [];
    for (const name in controls) {
      if (controls[name].invalid) {
        this.errors.push('Please enter a valid ' + name);
      }
    }
  }

  markInvalidControls(form: FormGroup) {
    const controls = form.controls;
    //Clear Errors array on every check
    this.errors = [];
    for (const name in controls) {
      if (controls[name].invalid) {
        this.errors.push('Please enter a valid ' + name);
        form.controls[name].markAsDirty();
      }
    }
  }

  validateAllForms() {
    this.errors = [];
    if (this.dealparty1Form.invalid) {
      this.findInvalidControls(this.dealparty1Form);
      return;
    }
    if (this.dealparty2Form.invalid) {
      this.findInvalidControls(this.dealparty2Form);
      return;
    }
    this.submitTenantDetail();
  }

  unlockNext() {
    this.emitNextTab.emit(true);
  }

  goBack() {
    this._location.back();
  }
}
