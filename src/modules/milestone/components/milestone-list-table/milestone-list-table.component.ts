import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MilestoneModel } from '@modules/milestone/models';
import { MilestoneService } from '@modules/milestone/services';
import { SortEvent } from '@modules/tables/directives';
import { Observable } from 'rxjs';

@Component({
  selector: 'sbpro-milestone-list-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './milestone-list-table.component.pug',
  styleUrls: ['milestone-list-table.component.scss']
})
export class MilestoneListTableComponent implements OnInit {
  /**
   * Initialise the
   * milestone list Observable
   */
  private _milestones$!: Observable<MilestoneModel[]>;

  /**
   * Loading observable
   * to detect if the data
   * is being loaded or not
   */
  private _loading$!: Observable<boolean>;

  /**
   * Search Term
   * to highlight the searched text
   * in the table
   */
  private _searchTerm!: string;

  sortedColumn!: string;
  sortedDirection!: string;

  constructor(private milestoneService: MilestoneService) {
    this._milestones$ = milestoneService.milestones$;
    this._loading$ = milestoneService.loading$;

    /**
     * Subscribe to loading
     */
    this._loading$.subscribe(() => {
      this._searchTerm = milestoneService.searchTerm;
    });
  }
  ngOnInit() {}

  onSort({ column, direction }: SortEvent) {
    // this.sortedColumn = column;
    // this.sortedDirection = direction;
    // this.countryService.sortColumn = column;
    // this.countryService.sortDirection = direction;
    // this.changeDetectorRef.detectChanges();
  }
}
