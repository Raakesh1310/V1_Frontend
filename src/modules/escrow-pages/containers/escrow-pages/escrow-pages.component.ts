import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationService } from '@modules/navigation/services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'sbpro-escrow-pages',
  templateUrl: './escrow-pages.component.pug',
  styleUrls: ['./escrow-pages.component.scss']
})
export class EscrowPagesComponent implements OnInit, OnDestroy {
  subscription: Subscription = new Subscription();
  includeDashboardLayout: boolean | undefined = false;

  constructor(public navigationService: NavigationService) {
    console.log('constructor called');
  }

  ngOnInit(): void {
    console.log('ngOnInit called');
    this.subscription.add(
      this.navigationService.routeData$().subscribe(routeData => {
        this.includeDashboardLayout = routeData.includeDashboardLayout || true;
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
