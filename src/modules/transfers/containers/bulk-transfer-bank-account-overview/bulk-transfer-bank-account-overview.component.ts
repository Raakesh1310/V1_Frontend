import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'sbpro-bulk-transfer-bank-account-overview',
  templateUrl: './bulk-transfer-bank-account-overview.component.pug',
  styleUrls: ['./bulk-transfer-bank-account-overview.component.scss']
})
export class BulkTransferBankAccountOverviewComponent implements OnInit {
  parentSubject: Subject<number> = new Subject();
  constructor() { }

  ngOnInit(): void {
  }
  moveToUpload() {
    this.parentSubject.next(1);
  }

}
