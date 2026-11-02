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
import { Deal, DealDocument, DealParty, dealRoles } from '@modules/deal/models';
import { DealService } from '@modules/deal/services';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'sbpro-deal-basic-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './deal-basic-detail.component.pug',
  styleUrls: ['deal-basic-detail.component.scss']
})
export class DealBasicDetailComponent implements OnInit {
  dealForm: FormGroup;
  @Input() viewMode = false;
  isSuperAdmin = this.authService.isSuperAdmin();

  @Input() errors: string[] = [];

  @Input() deal?: DealDocument;
  @Input() isEditDeal?: boolean;
  @Input() dealParty1?: DealParty;
  @Input() dealDocument?: DealDocument;

  @Output() emitPatchDeal: EventEmitter<Deal> = new EventEmitter<Deal>();
  @Output() emitPatchDealParty1: EventEmitter<DealParty> = new EventEmitter<
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
    this.dealForm = this.formBuilder.group({
      purpose: ['Security Deposit', Validators.required]
    });
  }

  ngOnInit() {
    this.dealForm.controls.purpose.setValue('Security Deposit');
    this.tabCount = 0;
    this.emitSetTab.emit(this.tabCount);
  }

  ngOnChanges() {
    const role = this.dealParty1?.role;
    if (role) {
      this.myRole = role;
    } else {
      this.myRole = dealRoles.Tenant;
    }
    this.emitMyRole.emit(this.myRole);
  }

  emitRole() {
    this.emitMyRole.emit(this.myRole);
  }

  submitBasicDetail() {
    this.emitMyRole.emit(this.myRole);
    this.emitPatchDeal.emit(this.dealForm.value);

    if (this.tabCount === 0) {
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
    if (this.dealForm.invalid) {
      this.markInvalidControls(this.dealForm);
      return;
    }
    // if (!this.file) {
    //   this.errors.push('Please upload rent agreement.');
    //   return;
    // }
    this.submitBasicDetail();
  }

  unlockNext() {
    this.emitNextTab.emit(true);
  }

  goBack() {
    this._location.back();
  }
}
