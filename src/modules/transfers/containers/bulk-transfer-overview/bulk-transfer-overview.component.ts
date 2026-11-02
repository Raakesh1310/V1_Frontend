import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'sbpro-bulk-transfer-overview',
  templateUrl: './bulk-transfer-overview.component.pug',
  styleUrls: ['./bulk-transfer-overview.component.scss']
})
export class BulkTransferOverviewComponent implements OnInit {

  parentSubject: Subject<number> = new Subject();

  constructor() { }

  ngOnInit(): void {
  }

  moveToUpload() {
    this.parentSubject.next(1);
  }

}
