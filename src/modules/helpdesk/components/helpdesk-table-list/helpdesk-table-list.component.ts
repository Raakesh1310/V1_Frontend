import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren
} from '@angular/core';
import { AccountsService } from '@modules/accounts/services';
import { SBSortableHeaderDirective } from '@modules/helpdesk/directives';
import { helpdeskService } from '@modules/helpdesk/services';
import { Transfer } from '@modules/transfers/models';
import * as date from 'date-and-time';
import { Observable } from 'rxjs';

@Component({
  selector: 'sbpro-helpdesk-table-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './helpdesk-table-list.component.pug',
  styleUrls: ['helpdesk-table-list.component.scss']
})
export class HelpdeskTableListComponent implements OnInit, OnDestroy {
  @Input() pageSize = 8;

  requests$!: Observable<Transfer[]>;
  total$!: Observable<number>;
  sortedColumn!: string;
  sortedDirection!: string;
  clearForm = false;
  showDetail = false;
  selectedRequest: any = null;

  @ViewChildren(SBSortableHeaderDirective) headers!: QueryList<
    SBSortableHeaderDirective
  >;

  constructor(
    public helpDeskService: helpdeskService,
    public accountService: AccountsService,
    public changeDetectorRef: ChangeDetectorRef,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.helpDeskService.pageSize = this.pageSize;
    this.requests$ = this.helpDeskService.requests$;
    this.total$ = this.helpDeskService.total$;
    this.helpDeskService.performSearch();
  }

  clearSearchForm() {
    this.clearForm = false;
    this.helpDeskService.searchTerm = '';
    this.helpDeskService.performSearch();
  }

  submitSearchForm() {
    this.clearForm = true;
    console.log('Submitting Search Form');

    // Reload the data
    this.helpDeskService.performSearch();
  }

  getParsedDate(inputDate: Date) {
    if (!inputDate) {
      return '';
    }
    const d = new Date(inputDate);
    return date.format(d, 'DD MMM YYYY');
  }

  ngOnDestroy() {
    this.helpDeskService.performReset();
  }

  selectrequest(transfer: any) {
    this.showDetail = true;
    this.selectedRequest = transfer;
    this.cdr.detectChanges();
  }

  goBack() {
    this.showDetail = false;
    this.selectedRequest = null;
    this.cdr.detectChanges();
  }
}
