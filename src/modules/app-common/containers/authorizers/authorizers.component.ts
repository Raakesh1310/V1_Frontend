import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@modules/auth/services';
import { ProfileService } from '@modules/profile/services';
import merchantUserRoles from 'config/merchantUserRoles';

@Component({
  selector: 'sbpro-authorizers',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './authorizers.component.pug',
  styleUrls: ['authorizers.component.scss']
})
export class AuthorizersComponent implements OnInit {
  @Input() merchantId: string = '';
  readOnly = false;
  _merchantId!: string | null;
  isPayeeAuthorizer: boolean = false;
  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private profileServie: ProfileService
  ) {
    this.checkForReadOnly();
    this._merchantId = activatedRoute.snapshot.paramMap.get('merchantId');

  }

  checkForReadOnly() {
    let roles = this.authService.getRole();
    if (
      roles &&
      (roles?.indexOf(merchantUserRoles.TRUSTEE) > -1 ||
        roles?.indexOf(merchantUserRoles.SUPER_ADMIN_VIEWER) > -1 ||
        roles?.indexOf(merchantUserRoles.MERCHANT_AUTHORIZER) > -1)
    ) {
      this.readOnly = true;
    }
  }
  ngOnInit() {
    this.profileServie.getProfile(this._merchantId, false).subscribe((resp: any) => { 
      if(resp.result?.payeeAuthorizerSettings?.enabled){
        this.isPayeeAuthorizer = true;
        this.cdr.detectChanges();
      }
    })
  }
}
