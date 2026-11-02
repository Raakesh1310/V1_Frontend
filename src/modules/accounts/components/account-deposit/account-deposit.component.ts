import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import {
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { AccountsService } from '@modules/accounts/services';
import { ActivatedRoute } from '@angular/router';
import { ToastMessageData, ToastMessageOptions } from '@common/models';
import { ToastService } from '@common/services';
import { NgbDateParserService } from '@common/services/NgbDateParser.service';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'environments/environment';

@Component({
  selector: 'sbpro-account-deposit',
  templateUrl: './account-deposit.component.pug',
  styleUrls: ['./account-deposit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountDepositComponent implements OnInit {
  @Input() accountId = '';
  processingErrors!: string[];
  descForm!: FormGroup;
  depositDate!: NgbDateStruct;
  errors: string[] = [];
  loading = false;
  maxDate = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getUTCDate()
  };

  constructor(
    private dateParser: NgbDateParserService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private accountsService: AccountsService
  ) {}

  ngOnInit(): void {
    console.log('Routing data ' + this.route.snapshot.params.accountId);
    this.descForm = this.formBuilder.group({
      remitterName: [''],
      remitterBank: [''],
      remitterIFSC: [''],
      amount: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      utr: [''],
      remarks: ['']
    });
    this.depositDate = { year: 0, day: 0, month: 0 };
  }

  //showTOast
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

  dateChange() {
    console.log('DEPOSIT DATE ', this.depositDate);
    console.log(
      'DATE ',
      new Date(
        this.depositDate.year,
        this.depositDate.month - 1,
        this.depositDate.day,
        new Date().getHours(),
        new Date().getMinutes(),
        new Date().getSeconds()
      ).toISOString()
    );
  }

  amountChanged(event: any) {
    this.processingErrors = [];
    if (
      !environment.production &&
      event.target.value > environment.depositMaxAmount
    ) {
      this.processingErrors = [
        `Cannot deposit more than Rs.${environment.depositMaxAmount}`
      ];

      return;
    }
  }

  onSubmit() {
    this.errors = [];
    //Validation Checks

    if (this.descForm.controls.amount.value === '') {
      this.processingErrors = ['Amount is Empty'];
      this.cdr.detectChanges();
      return;
    } else if (
      this.descForm.controls.amount.value > environment.depositMaxAmount &&
      !environment.production
    ) {
      this.processingErrors = [
        `Cannot deposit more than Rs.${environment.depositMaxAmount}`
      ];
      this.cdr.detectChanges();
      return;
    }

    let amount = Number.parseInt(this.descForm.controls.amount.value).toFixed(
      2
    );
    if (!RegExp('^[0-9]*\\.[0-9]{2}$').test(amount.toString())) {
      this.processingErrors = ['Amount should be Number'];
      this.cdr.detectChanges();
      return;
    }

    //API CALLING
    this.errors = [];
    console.log('SEND DATA TO API CALLED');
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const body: any = {};

    body.remitterName = this.descForm.controls.remitterName.value;
    body.remitterIFSCCode = this.descForm.controls.remitterIFSC.value;
    body.remitterAccNumber = this.descForm.controls.remitterBank.value;
    body.remarks = this.descForm.controls.remarks.value;
    body.utr = this.descForm.controls.utr.value;
    body.amount = this.descForm.controls.amount.value;
    body.date = new Date(
      this.depositDate.year,
      this.depositDate.month - 1,
      this.depositDate.day,
      new Date().getHours(),
      new Date().getMinutes(),
      new Date().getSeconds()
    ).toISOString();
    body.virtualAccNumber = this.route.snapshot.params.accountId;

    console.log('BODY', body);
    this.loading = true;
    this.cdr.detectChanges();
    this.accountsService.depositAmount(body).subscribe(
      (resp: any) => {
        console.log('Response from API', resp);
        if (resp.success) {
          let toastHead = 'Success';
          let toastBody = 'Data Submitted Successfully';

          this.showToast(toastHead, toastBody, {
            headerClasses: 'bg-success text-white'
          });
          this.ngOnInit();
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      err => {
        console.log('ERROR FROM API SIDE ', err);
        if (err.status === 0) {
          this.errors = ['Connection Error'];
        } else {
          this.errors = err.error.errors;
        }

        let toastHead = 'Error';
        let toastBody = `${this.errors[0]}`;
        this.showToast(toastHead, toastBody, {
          headerClasses: 'bg-danger text-white'
        });
        this.loading = false;
        this.cdr.detectChanges();
      }
    );
  }
}
