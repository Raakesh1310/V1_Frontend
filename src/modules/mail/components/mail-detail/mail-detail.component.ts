import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { Mail, Recipient } from '@modules/mail/models';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'sbpro-mail-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mail-detail.component.pug',
  styleUrls: ['mail-detail.component.scss']
})
export class MailDetailComponent implements OnInit {
  showSearch = false;
  recipients: Recipient[] = [];
  @Input() mail: Mail = {} as Mail;
  @Input() modal?: NgbModalRef;

  constructor(private cdr: ChangeDetectorRef) {}
  ngOnInit() {
    this.recipients = this.mail.recipients;
  }

  toggleSearch() {
    this.showSearch = !this.showSearch;
    this.recipients = this.mail.recipients;
  }

  filterEmail(event: KeyboardEvent) {
    console.log((event.target as HTMLInputElement).value);
    this.recipients = this.mail.recipients.filter(x =>
      x.email.match((event.target as HTMLInputElement).value)
    );
    console.log(this.recipients);
    this.cdr.detectChanges();
  }

  close() {
    this.modal?.close();
  }
}
