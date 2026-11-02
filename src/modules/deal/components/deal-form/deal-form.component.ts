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
import { Deal, DealData, DealParty, dealRoles } from '@modules/deal/models';
import { DealService } from '@modules/deal/services';
import {
  NgbCalendar,
  NgbDate,
  NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'environments/environment';

@Component({
  selector: 'sbpro-deal-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './deal-form.component.pug',
  styleUrls: ['deal-form.component.scss']
})
export class DealFormComponent implements OnInit {
  dealForm: FormGroup;
  dealDataForm: FormGroup;
  @Input() errors: string[] = [];

  startDateMin!: NgbDateStruct;
  endDateMin!: NgbDateStruct;

  file?: any;

  docUrlPrefix = environment.apiHost + '/uploads/deals/';

  @Input() deal?: Deal;
  @Input() dealCreateForm?: Deal;
  @Input() isEditDeal?: boolean;
  @Input() dealData?: DealData;
  @Input() viewMode = false;
  isSuperAdmin = this.authService.isSuperAdmin();

  @Output() emitPatchDeal: EventEmitter<Deal> = new EventEmitter<Deal>();
  @Output() emitSubmitDeal: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() emitPatchDealData: EventEmitter<DealData> = new EventEmitter<
    DealData
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
    // set min dates
    const dNow = new Date();
    this.startDateMin = calendar.getNext(
      new NgbDate(dNow.getFullYear(), dNow.getMonth() + 1, dNow.getDate()),
      'd',
      0
    );
    this.endDateMin = calendar.getNext(
      new NgbDate(dNow.getFullYear(), dNow.getMonth() + 1, dNow.getDate()),
      'd',
      0
    );
    console.log(
      new NgbDate(dNow.getFullYear(), dNow.getMonth() + 1, dNow.getDate())
    );

    this.dealForm = this.formBuilder.group({
      purpose: ['Security Deposit', Validators.required],
      startDate: ['', Validators.required],
      tenure: [1, Validators.required],
      endDate: [''],
      documents: [[], Validators.required]
    });
    this.dealDataForm = this.formBuilder.group({
      securityDeposit: [0, Validators.required]
    });
  }

  ngOnInit() {
    console.log(this.deal);
    const startDate = this.deal?.startDate,
      endDate = this.deal?.endDate,
      dealDocuments = this.deal?.documents;
    if (startDate) {
      const startDateCal = new NgbDate(
        parseInt(startDate.split('T')[0].split('-')[0]),
        parseInt(startDate.split('T')[0].split('-')[1]),
        parseInt(startDate.split('T')[0].split('-')[2])
      );
      this.dealForm.controls.startDate.setValue(startDateCal);
      this.startDateMin = this.calendar.getNext(startDateCal, 'd', 0);
    }
    if (endDate) {
      const endDateCal = new NgbDate(
        parseInt(endDate.split('T')[0].split('-')[0]),
        parseInt(endDate.split('T')[0].split('-')[1]),
        parseInt(endDate.split('T')[0].split('-')[2])
      );
      this.dealForm.controls.endDate.setValue(endDateCal);
      this.endDateMin = this.calendar.getNext(endDateCal, 'd', 0);
    }
    if (dealDocuments) {
      const dealDocs: string[] = dealDocuments.map(dealDocument => {
        return dealDocument.documentId;
      });
      this.dealForm.controls.documents.setValue(dealDocs);
      this.file = dealDocuments[0];
    }
    const dealPurpose = this.deal?.purpose;
    if (dealPurpose) {
      this.dealForm.controls.purpose.setValue(dealPurpose);
    } else {
      this.dealForm.controls.purpose.setValue(this.dealCreateForm?.purpose);
    }
    this.dealForm.controls.tenure.setValue(this.deal?.tenure);
    this.dealDataForm.controls.securityDeposit.setValue(
      this.dealData?.securityDeposit
    );
    this.tabCount = 3;
    this.emitSetTab.emit(this.tabCount);
  }

  get startDate() {
    return this.dealForm.get('startDate');
  }

  get endDate() {
    return this.dealForm.get('endDate');
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

  get tenure() {
    return this.dealForm.get('tenure');
  }

  updateEndDate() {
    const sd = this.dealForm.controls.startDate.value;
    const t = this.dealForm.controls.tenure.value;
    this.dealForm.controls.endDate.setValue(this.calendar.getNext(sd, 'm', t));
  }

  submitBasicDetail() {
    this.emitPatchDeal.emit(this.dealForm.value);
  }

  findInvalidControls(form: FormGroup) {
    const controls = form.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        this.errors.push('Please enter valid ' + name);
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

  deleteDoc() {
    this.dealService.deleteDocument(this.file?.documentId).subscribe(resp => {
      console.log(resp);
      if (resp.success) {
        this.file = null;
        this.cdr.detectChanges();
        this.dealForm.controls.documents.setValue([]);
      }
    });
  }

  validateAllForms() {
    this.errors = [];

    if (this.dealForm.invalid) {
      this.markInvalidControls(this.dealForm);
      this.findInvalidControls(this.dealForm);
      return;
    }

    if (this.dealDataForm.invalid) {
      this.markInvalidControls(this.dealDataForm);
      this.findInvalidControls(this.dealDataForm);
      return;
    }
    // if (!this.file) {
    //   this.errors.push('Please upload rent agreement.');
    //   return;
    // }
    this.submitDealDetail();
  }

  submitDealDetail() {
    this.emitPatchDealData.emit(this.dealDataForm.value);
    this.emitPatchDeal.emit(this.dealForm.value);
    this.emitSubmitDeal.emit(true);
  }

  captureFile($event: any) {
    console.log($event.target.files[0]);
    const formData = new FormData();

    formData.append('file', $event.target.files[0]);
    formData.append('docType', 'Rent Agreement');
    this.dealService.upload(formData).subscribe(
      resp => {
        console.log(resp);
        if (resp.success) {
          this.dealForm.controls.documents.setValue([resp.result.documentId]);
          this.file = resp.result;
          console.log(this.file);
          this.cdr.detectChanges();
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  unlockNext() {
    this.emitNextTab.emit(true);
  }

  goBack() {
    this._location.back();
  }
}
