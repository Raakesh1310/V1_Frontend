import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastMessageData, ToastMessageOptions } from '@common/models';
import { ToastService } from '@common/services';
import { DocumentsService } from '@modules/documents/services';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { environment } from '../../../../environments/environment';
import { Branch, Signer, UploadFile } from '../../models/doqfy.model';

@Component({
  selector: 'sbpro-doqfy-form-component',
  templateUrl: './doqfy-form-component.component.pug',
  styleUrls: ['./doqfy-form-component.component.scss']
})
export class DoqfyFormComponentComponent implements OnInit {
  @Input() apiLink = '';
  @Input() uploadLink = '/document/upload';
  @Input() doClose?: NgbModalRef;
  @Input() accountId = '';
  @Input() branch = 'NEW DELHI';
  // form toggles
  estampRequired = false;
  esignRequired = false;
  notaryRequired = false;
  submitting = false;
  branchList: Branch[] = [];

  // form data
  file?: UploadFile;
  provider = 'DOCUSIGN';
  method = 'ELECTRONIC';
  signers: Array<Signer> = [];
  errors: string[] = [];
  pages = 'ALL';
  document: any = '';
  selectedBranch?: string;
  signingPositions: string[] = [
    'TOP_CENTRE',
    'TOP_RIGHT',
    'MIDDLE_LEFT',
    'MIDDLE_RIGHT',
    'BOTTOM_LEFT',
    'BOTTOM_CENTRE',
    'BOTTOM_RIGHT'
  ];

  // form groups
  esignForm: FormGroup;
  estampForm: FormGroup;
  orderName = '';

  constructor(
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private documentService: DocumentsService,
    private toastService: ToastService
  ) {
    this.documentService.fetchBranchList().subscribe((resp: any) => {
      if (resp.success) {
        this.branchList = resp.result;
        this.selectedBranch = this.branchList[0].branch_uuid;
        this.cdr.detectChanges();
      }
    });

    this.estampForm = this.formBuilder.group({
      firstPartyName: ['', [Validators.required]],
      secondPartyName: ['', [Validators.required]],
      stampDutyPaidBy: ['', [Validators.required]],
      stampDutyValue: ['', [Validators.required]],
      purposeOfStampDuty: ['', [Validators.required]],
      NoOfCopies: ['', [Validators.required]],
      articleNumber: ['', [Validators.required]],
      considerationPrice: ['', [Validators.required]]
    });

    this.esignForm = this.formBuilder.group({
      email: [
        '',
        [
          Validators.required,
          Validators.pattern('[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]+')
        ]
      ],
      signing_type: ['', [Validators.required]],
      name: ['', [Validators.required]],
      pages: [''],
      mobileNumber: [''],
      signPosition: [this.signingPositions[0], [Validators.required]]
    });
  }

  ngOnInit(): void {}

  // function to find invalid controls
  findInvalidControls(form: any) {
    const controls = form.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        return 'Please enter a valid ' + name;
      }
    }
    return '';
  }

  /**
   * checkbox actions
   *  - estamp checkbox
   *  - esign checkbox
   *  - notary checkbox
   * @param checkbox
   */
  estampAction(checkbox: HTMLInputElement) {
    if (checkbox.checked) {
      this.estampRequired = true;
    } else {
      this.estampRequired = false;
    }
  }

  esignAction(checkbox: HTMLInputElement) {
    if (checkbox.checked) {
      this.esignRequired = true;
    } else {
      this.esignRequired = false;
    }
  }

  notaryAction(checkbox: HTMLInputElement) {
    if (checkbox.checked) {
      this.notaryRequired = true;
    } else {
      this.notaryRequired = false;
    }
  }

  /**
   * functions for select options
   *
   */
  setpages(pages: string) {
    this.pages = pages;
  }

  setmethod(method: string) {
    switch (method) {
      case 'ELECTRONIC':
        this.method = method;
        this.provider = 'DOCUSIGN';
        break;
      case 'AADHAAR':
        this.method = method;
        this.provider = 'DIGIO';
        break;
      default:
        this.method = 'ELECTRONIC';
        this.provider = 'DOCUSIGN';
    }
  }

  /**
   * upload file cpomponent function
   * return array of file
   * for multi false returns array with one element
   * @param files
   */
  catchFile(files: UploadFile[]) {
    this.file = files[0];
  }

  uploadFile($event: any) {
    this.errors = [];
    const file = $event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    this.documentService
      .uploadFile(formData, this.uploadLink)
      .subscribe((resp: any) => {
        if (resp.success) {
          this.document = resp.result;
          this.cdr.detectChanges();
        } else {
          this.errors = resp.errors;
          this.cdr.detectChanges();
        }
      });
  }

  /**
   * add signer function
   * check validation for signing form
   * add form to signer array
   */
  addSigner() {
    this.esignForm.controls.pages.setValue(this.pages);
    this.esignForm.controls.mobileNumber.setValue('');
    // validate signer form
    if (!this.esignForm.valid) {
      this.errors.push(this.findInvalidControls(this.esignForm));
      return;
    }
    console.log('SIGN POSITION ', this.esignForm.controls.signPosition.value);
    const val = this.esignForm.controls.signPosition.value;
    const new1 = this.signingPositions.filter(ele => {
      //console.log(ele);
      return ele.toString() !== val.toString();
    });
    this.signingPositions = new1;
    this.signers.push(this.esignForm.value);
    this.esignForm.reset();
    this.cdr.detectChanges();
  }

  removeSigner(i: number) {
    //console.log(this.signers[i]);
    this.signingPositions.push(this.signers[i].signPosition);
    console.log('NEW POSITION ADDED ', this.signingPositions);
    this.signers.splice(i, 1);
    this.cdr.detectChanges();
  }

  /**
   * function to create
   * body for submission
   */
  createData() {
    const data = {
      orderName: this.orderName,
      branch_uuid: this.selectedBranch,
      estamp: {
        is_required: this.estampRequired,
        firstPartyName: this.estampForm.controls.firstPartyName.value,
        secondPartyName: this.estampForm.controls.secondPartyName.value,
        stampDutyPaidBy: this.estampForm.controls.stampDutyPaidBy.value,
        stampDutyValue: this.estampForm.controls.stampDutyValue.value,
        purposeOfStampDuty: this.estampForm.controls.purposeOfStampDuty.value,
        NoOfCopies: this.estampForm.controls.NoOfCopies.value,
        articleNumber: this.estampForm.controls.articleNumber.value,
        considerationPrice: this.estampForm.controls.considerationPrice.value
      },
      esignRequired: this.esignRequired,
      provider: this.provider,
      method: this.method,
      notaryRequired: this.notaryRequired,
      signingParties: this.signers
    };
    return data;
  }

  onSubmit() {
    this.errors = [];
    if (!this.orderName) {
      this.errors.push('Please provide a name to your agreement.');
      this.cdr.detectChanges();
      return;
    }
    if (!this.selectedBranch) {
      this.errors.push('Please select a branch.');
      this.cdr.detectChanges();
      return;
    }

    if (!this.document) {
      this.errors.push('Please select a file.');
      this.cdr.detectChanges();
      return;
    }

    if (!this.esignRequired) {
      this.errors.push('please provide e-sign details.');
      this.cdr.detectChanges();
      return;
    }

    if (this.estampRequired && !this.estampForm.valid) {
      this.errors.push(this.findInvalidControls(this.estampForm));
      this.cdr.detectChanges();
      return;
    }
    if (this.esignRequired && this.signers.length < 1) {
      this.errors.push('please select at least one signing party.');
      this.cdr.detectChanges();
      return;
    }
    this.submitting = true;
    const data = this.createData();

    this.documentService
      .sendToSign(data, this.apiLink, this.document.documentId)
      .subscribe((resp: any) => {
        this.submitting = false;
        if (resp.success) {
          // if (this.esignRequired || this.estampRequired) {
          if (resp.result.status === 'ACCEPTED') {
            this.showToast(
              'Success',
              resp.result.genericResponse.apiStatusMessage,
              {
                headerClasses: 'bg-success text-white'
              }
            );
            if (this.apiLink) {
              this.closeModal();
              return;
            }
            this.router.navigate([
              environment.urlPortalPrefix + '/document/order'
            ]);
            return;
          }
          this.showToast(
            'Failed',
            resp.result.genericResponse.apiStatusMessage,
            {
              headerClasses: 'bg-danger text-white'
            }
          );
          return;
          // }
          // if (this.apiLink) {
          //   this.closeModal();
          // } else {
          //   this.router.navigate([environment.apiAdminPrefix + 'documents/orders']);
          // }
          // return;
        }
        this.errors = resp.errors;
        this.showToast('Failed', resp.message, {
          headerClasses: 'bg-danger text-white'
        });
      });
  }

  showToast(
    header: ToastMessageData,
    body: ToastMessageData,
    options: ToastMessageOptions = {}
  ) {
    const defaultOptions = {
      autohide: true,
      delay: 5000
    };
    this.toastService.show(header, body, { ...defaultOptions, ...options });
  }

  closeModal() {
    this.doClose?.close(true);
  }
}
