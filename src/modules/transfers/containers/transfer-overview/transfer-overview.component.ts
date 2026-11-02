import {
  ChangeDetectionStrategy,
  Component,
  OnInit
} from '@angular/core';
import { MerchantProfile } from '@modules/auth/models/merchantProfile.model';
import { AuthService } from '@modules/auth/services';
import transferSelection from '@modules/transfers/constants/transferSelection';
@Component({
  selector: 'sbpro-transfer-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './transfer-overview.component.pug',
  styleUrls: ['transfer-overview.component.scss']
})
export class TransferOverviewComponent implements OnInit {
  merchantProfile: MerchantProfile | null;
  transferNormal: Boolean = true;

  constructor(private authService: AuthService) {
    this.merchantProfile = this.authService.getMerchantProfile();
  }
  ngOnInit() { }

  updateSelection(selection: string) {
    selection === transferSelection.toBankAccount ? this.transferNormal = true : this.transferNormal = false;
  }
}
