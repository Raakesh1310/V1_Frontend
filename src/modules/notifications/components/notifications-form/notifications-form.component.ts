import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ToastService, UtilityService } from '@common/services';
import { NotificationsService } from '@modules/notifications/services';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'environments/environment';
import moment from 'moment';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'sbpro-notifications-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notifications-form.component.pug',
  styleUrls: ['notifications-form.component.scss']
})
export class NotificationsFormComponent implements OnInit {
  editorSettings = {
    base_url: '/tinymce',
    height: 500,
    menubar: false,
    plugins: [
      'advlist autolink lists link image charmap print preview anchor textcolor emoticons',
      'searchreplace',
      'insertdatetime media table paste'
    ],
    toolbar:
      'undo redo | fontselect | forecolor | formatselect | bold italic underline | emoticons \
       alignleft aligncenter alignright alignjustify | \
       bullist numlist outdent indent | removeformat'
  };

  today: Date = new Date();

  editorContent!: SafeHtml;
  notificationFormGroup!: FormGroup;

  errors: string[] = [];

  _loading$!: BehaviorSubject<boolean>;
  isSubmitting = false;

  minDate!: NgbDateStruct;
  minEndDate!: NgbDateStruct;

  constructor(
    public cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    public sanitizer: DomSanitizer,
    private notificationService: NotificationsService,
    private toastService: ToastService,
    private router: Router,
    private utilityService: UtilityService
  ) {
    this._loading$ = new BehaviorSubject<boolean>(false);

    this.notificationFormGroup = this.formBuilder.group({
      title: [null, Validators.required],
      content: [null, Validators.required],
      summary: [null, Validators.required],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      sendMail: [false]
    });
  }

  ngOnInit() {
    this.minDate = {
      day: this.today.getDate(),
      month: this.today.getMonth() + 1,
      year: this.today.getFullYear()
    } as NgbDateStruct;

    this.cdr.detectChanges();

    this.notificationFormGroup.valueChanges.subscribe(value => {
      console.log(value);

      this.editorContent = this.sanitizer.bypassSecurityTrustHtml(
        value.content
      );

      this.minEndDate = value.startDate;

      this.cdr.detectChanges();
    });

    this._loading$.subscribe(res => {
      this.isSubmitting = res;
      this.cdr.detectChanges();
    });
  }

  handleSubmit(form: NgForm) {
    this.errors = [];
    this.cdr.detectChanges();

    if (form.invalid) {
      this.errors.push('Please fill all the fields.');
      this.cdr.detectChanges();
      return;
    }

    const _startDate = form.value.startDate;
    const _endDate = this.utilityService.getNextDayFromNgb(form.value.endDate);

    const startDate = new Date(
      `${_startDate.year}/${_startDate.month}/${_startDate.day}`
    ).toISOString();

    let endDate = new Date(
      `${_endDate.year}/${_endDate.month}/${_endDate.day}`
    );

    let __endDate = moment(endDate)
      .subtract(1, 'm')
      .toDate()
      .toISOString();

    const data = {
      ...form.value,
      startDate,
      endDate: __endDate
    };

    this._loading$.next(true);
    this.notificationService.addNotification(data).subscribe(
      res => {
        this._loading$.next(false);
        this.router.navigate([environment.urlAdminPrefix + '/notifications']);
      },
      err => {
        this.toastService.show('Error', err.error.errors[0], {
          ...ToastService.errorHeaderOptions,
          ...ToastService.defaultOptions
        });

        this._loading$.next(false);
      }
    );
  }
}
