import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { MailDetailComponent } from '@modules/mail/components/mail-detail/mail-detail.component';
import { Mail } from '@modules/mail/models/mail.model';
import { MailService } from '@modules/mail/services/mail.service';
import {
  NgbCalendar,
  NgbDate,
  NgbDateStruct,
  NgbModal,
  NgbModalRef
} from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'sbpro-mail-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mail-list.component.pug',
  styleUrls: ['mail-list.component.scss']
})
export class MailListComponent implements OnInit {
  model!: NgbDateStruct;
  mails$!: Observable<Mail[]>;
  total$!: Observable<number>;
  private _loadingList$ = new BehaviorSubject(false);
  sortedColumn!: string;
  sortedDirection!: string;
  mailModal?: NgbModalRef;

  filtersVisible = true;
  private modalRef?: NgbModalRef;

  constructor(
    private mailService: MailService,
    public changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    private calendar: NgbCalendar,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.mails$ = this.mailService.mails$;
    this.total$ = this.mailService.total$;
    this.loadData();
  }

  openDetails(mail: Mail) {
    this.mailModal = this.modalService.open(MailDetailComponent, {
      size: 'xl',
      backdrop: 'static'
    });
    this.mailModal.componentInstance.mail = mail;
    this.mailModal.componentInstance.modal = this.mailModal;
  }

  loadData() {
    this._loadingList$.next(true);
    this.mailService.retrieveData().subscribe(resp => {
      this._loadingList$.next(false);
    });
  }

  get loadingList$(): Observable<boolean> {
    return this._loadingList$.asObservable();
  }

  toggleFilters() {
    this.filtersVisible = !this.filtersVisible;
  }

  submitSearchForm() {
    this.mailService.page = 1;
    console.log('Submitting Search Form');
    // Reload the data
    this.mailService.retrieveData().subscribe();
  }

  clearForm() {
    console.log('clearing form');
    // tslint:disable-next-line:no-any
    this.mailService.dateFrom = this.calendar.getNext(
      new NgbDate(0, 0, 0),
      'd',
      0
    );
    // tslint:disable-next-line:no-any
    this.mailService.dateTo = this.calendar.getNext(
      new NgbDate(0, 0, 0),
      'd',
      0
    );
    this.mailService.pageSize = 10;
    this.mailService.searchTerm = '';
    this.mailService.status = '';
    this.loadData();
  }
}
