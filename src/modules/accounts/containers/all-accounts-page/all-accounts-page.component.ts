import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild
} from '@angular/core';
import { AllAccountsComponent } from '@modules/accounts/components';

@Component({
  selector: 'sbpro-all-accounts-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './all-accounts-page.component.pug',
  styleUrls: ['all-accounts-page.component.scss']
})
export class AllAccountsPageComponent implements OnInit {
  @ViewChild(AllAccountsComponent) child?: AllAccountsComponent;

  constructor() {}
  ngOnInit() {}

  refresh() {
    this.child?.refreshData();
  }

  toggleFiltersParent() {
    this.child?.toggleFilters();
  }
}
