import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  QueryList,
  ViewChildren
} from '@angular/core';
import {
  SBSortableHeaderDirective,
  SortEvent
} from '@modules/tables/directives';
import { Activity } from '@modules/tables/models';
import { ActivitiesService } from '@modules/tables/services';
import { Observable } from 'rxjs';

@Component({
  selector: 'sbpro-transaction-table-default',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './transaction-table-default.component.pug',
  styleUrls: ['transaction-table-default.component.scss']
})
export class TransactionTableDefaultComponent implements OnInit {
  @Input() pageSize = 8;

  activities$!: Observable<Activity[]>;
  total$!: Observable<number>;
  sortedColumn!: string;
  sortedDirection!: string;

  @ViewChildren(SBSortableHeaderDirective) headers!: QueryList<
    SBSortableHeaderDirective
  >;

  constructor(
    public activitiesService: ActivitiesService,
    public changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.activitiesService.pageSize = this.pageSize;
    this.activities$ = this.activitiesService.activities$;
    this.total$ = this.activitiesService.total$;
  }

  onSort({ column, direction }: SortEvent) {
    this.sortedColumn = column;
    this.sortedDirection = direction;
    this.activitiesService.sortColumn = column;
    this.activitiesService.sortDirection = direction;
    this.changeDetectorRef.detectChanges();
  }
}
