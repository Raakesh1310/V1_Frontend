import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '@modules/auth/services';
import { SideNavItems, SideNavSection } from '@modules/navigation/models';
import { NavigationService } from '@modules/navigation/services';
import { Subscription } from 'rxjs';

import { environment } from '../../../../environments/environment';

@Component({
  selector: 'sb-side-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './side-nav.component.pug',
  styleUrls: ['side-nav.component.scss']
})
export class SideNavComponent implements OnInit, OnDestroy {
  @Input() sidenavStyle!: string;
  @Input() sideNavItems!: SideNavItems;
  @Input() sideNavSections!: SideNavSection[];

  subscription: Subscription = new Subscription();
  routeDataSubscription!: Subscription;
  isActive = false;

  constructor(
    public navigationService: NavigationService,
    public userService: UserService,
    private route: Router
  ) {}

  ngOnInit() {}

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onClick() {
    this.route.navigate([environment.urlPortalPrefix + '/profile/settings']);
  }
}
