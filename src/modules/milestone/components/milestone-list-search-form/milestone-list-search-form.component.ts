import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MilestoneService } from '@modules/milestone/services';

@Component({
  selector: 'sbpro-milestone-list-search-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './milestone-list-search-form.component.pug',
  styleUrls: ['milestone-list-search-form.component.scss']
})
export class MilestoneListSearchFormComponent implements OnInit {
  private _searchText!: string;
  constructor(private milestoneService: MilestoneService) {}
  ngOnInit() {
    this.performSearch();
  }

  get searchText() {
    return this._searchText;
  }

  set searchText(str: string) {
    this._searchText = str;
  }

  performSearch() {
    /**
     * Update the vars
     * in service
     */

    this.milestoneService.searchTerm = this._searchText;

    /**
     * And then fetch
     * the list
     */
    this.milestoneService.fetchMilestones();
  }

  clearForm() {
    /**
     * Reset all the
     * vars
     */

    this._searchText = '';
  }
}
