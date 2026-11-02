import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DocumentsService } from '@modules/documents/services';
import {
  NgbCalendar,
  NgbDate,
  NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

import { Order, OrderRespModel } from '../../models/doqfy.model';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'sbpro-list-document',
  templateUrl: './list-document.component.pug',
  styleUrls: ['./list-document.component.scss']
})
export class ListDocumentComponent implements OnInit {
  model!: NgbDateStruct;
  orders$!: Observable<Order[]>;
  total$!: Observable<number>;
  sortedColumn!: string;
  sortedDirection!: string;
  clearForm = false;
  loading = false;
  docUrlPrefix = '';
  statusList = ['COMPLETED', 'IN_PROGRESS', 'FAILED', 'EXPIRED'];

  constructor(
    private httpClient: HttpClient,
    private documentService: DocumentsService,
    private router: Router,
    public changeDetectorRef: ChangeDetectorRef,
    private calendar: NgbCalendar
  ) {
    this.orders$ = this.documentService.orders$;
    this.total$ = this.documentService.total$;
    this.loadData();
  }

  loadData() {
    this.documentService.page = 1;
  }

  clearSearchForm() {
    this.clearForm = false;
    this.documentService.dateFrom = this.calendar.getNext(
      new NgbDate(0, 0, 0),
      'd',
      0
    );
    // tslint:disable-next-line:no-any
    this.documentService.dateTo = this.calendar.getNext(
      new NgbDate(0, 0, 0),
      'd',
      0
    );

    this.documentService.pageSize = 10;
    this.documentService.searchTerm = '';
    this.documentService.status = '';
    this.documentService.page = 1;
  }

  async refresh() {
    this.loading = true;
    // refresh the list
    let orders: Order[] = [];
    this.orders$.subscribe(resp => (orders = resp));
    Promise.all(
      orders.map((order: Order) => {
        return new Promise(resolve => {
          this.documentService
            .refreshOrder(order.orderUuid)
            .subscribe(resp => resolve(resp));
        });
      })
    ).then(value => {
      console.log('resolved all');
      this.documentService.performSearch();
      this.loading = false;
    });
  }

  submitSearchForm() {
    this.clearForm = true;
    console.log('Submitting Search Form');

    // Reload the data
    this.documentService.performSearch();
  }

  viewOrder(order: Order) {
    this.router.navigate([
      environment.urlPortalPrefix + '/document/order/' + order.documentId
    ]);
  }

  generateFileLink(type: String) {
    if (type === 'account') {
      return (this.docUrlPrefix = environment.apiHost + '/uploads/accounts/');
    } else {
      return (this.docUrlPrefix = environment.apiHost + '/uploads/documents/');
    }
  }

  downloadData() {
    localStorage.setItem('pageMe','1');
    this.documentService.downloadExcel();
  }

  ngOnInit(): void {}
}
