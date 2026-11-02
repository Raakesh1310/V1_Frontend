import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AuthService } from '@modules/auth/services';
import { ProfileService } from '@modules/profile/services';

@Component({
  selector: 'sbpro-dashboard-escrow-cb-overview',
  templateUrl: './dashboard-escrow-cb-overview.component.pug',
  styleUrls: ['./dashboard-escrow-cb-overview.component.scss']
})
export class DashboardEscrowCbOverviewComponent implements OnInit {
  isAdmin = false;
  connectedBanking!: boolean;
  isAccountAddAllowed!: boolean;
  constructor(
    private authService: AuthService,
    private merchantProfileService: ProfileService,
    private cdr: ChangeDetectorRef,
  ) {
    this.isAdmin = this.authService.isSuperAdmin();
  }

  ngOnInit() {
    this.merchantProfileService.getProfile(null,false).subscribe(resp=>{
      this.connectedBanking  = resp.result.connectedBanking;
      this.isAccountAddAllowed = resp.result.isAccountAddAllowed;
      this.cdr.detectChanges();
    });
  }
}
