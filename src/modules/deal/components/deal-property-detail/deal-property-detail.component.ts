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
import { DealData, dealRoles } from '@modules/deal/models';
import { DealService } from '@modules/deal/services';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'sbpro-deal-property-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './deal-property-detail.component.pug',
  styleUrls: ['deal-property-detail.component.scss']
})
export class DealPropertyDetailComponent implements OnInit {
  dealDataForm: FormGroup;
  @Input() errors: string[] = [];

  @Input() dealData?: DealData;

  @Output() emitPatchDealData: EventEmitter<DealData> = new EventEmitter<
    DealData
  >();
  @Input() isEditDeal?: boolean;
  @Input() myRole = dealRoles.Landlord;
  @Input() loading = false;
  @Input() viewMode = false;
  isSuperAdmin = this.authService.isSuperAdmin();
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
    this.dealDataForm = this.formBuilder.group({
      propertyType: ['Residential', Validators.required],
      propertyAddress: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      pinCode: [0, [Validators.pattern('^[0-9]{6}$'), Validators.required]],
      securityDeposit: [0, Validators.required]
    });
  }

  ngOnInit() {
    console.log(this.dealData);

    this.dealDataForm.controls.propertyType.setValue(
      this.dealData?.propertyType || 'Residential'
    );
    this.dealDataForm.controls.propertyAddress.setValue(
      this.dealData?.propertyAddress
    );
    this.dealDataForm.controls.state.setValue(this.dealData?.state);
    this.dealDataForm.controls.city.setValue(this.dealData?.city);
    this.dealDataForm.controls.pinCode.setValue(this.dealData?.pinCode);
    this.dealDataForm.controls.securityDeposit.setValue(
      this.dealData?.securityDeposit
    );
    this.tabCount = 2;
    this.emitSetTab.emit(this.tabCount);
  }

  get propertyType() {
    return this.dealDataForm.get('propertyType');
  }
  get propertyAddress() {
    return this.dealDataForm.get('propertyAddress');
  }
  get state() {
    return this.dealDataForm.get('state');
  }
  get city() {
    return this.dealDataForm.get('city');
  }
  get pinCode() {
    return this.dealDataForm.get('pinCode');
  }

  get securityDeposit() {
    return this.dealDataForm.get('securityDeposit');
  }

  submitPropertyDetail() {
    const controls = this.dealDataForm.controls;
    for (const name in controls) {
      if (controls[name].invalid && name !== 'securityDeposit') {
        this.dealDataForm.controls[name].markAsDirty();
        console.log(name);
        return;
      }
    }
    this.emitPatchDealData.emit(this.dealDataForm.value);
    if (this.tabCount === 2) {
      this.unlockNext();
    }
  }

  findInvalidControls(form: FormGroup) {
    const controls = form.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        this.errors.push('Please enter a valid ' + name);
        console.log(this.errors);
      }
    }
  }

  markInvalidControls(form: FormGroup) {
    const controls = form.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        form.controls[name].markAsDirty();
        console.log(name);
      }
    }
  }

  validateAllForms() {
    this.errors = [];
    if (this.dealDataForm.invalid) {
      this.markInvalidControls(this.dealDataForm);
      return;
    }
    if (this.dealDataForm.invalid) {
      this.findInvalidControls(this.dealDataForm);
      return;
    }

    this.submitPropertyDetail();
  }

  unlockNext() {
    this.emitNextTab.emit(true);
  }
  goBack() {
    this._location.back();
  }
}
