import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { KycWidgetsService } from '@modules/kyc-widgets/services';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'sbpro-kyc-widget-base',
  templateUrl: './kyc-widget-base.component.pug',
  styleUrls: ['./kyc-widget-base.component.scss']
})
export class KycWidgetBaseComponent implements OnInit {

  logoPath = '';
  crnId = '';

  constructor(
    private cdr: ChangeDetectorRef,
    private kycService: KycWidgetsService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.crnId = document.URL.split('/')[5];
    this.getKycData();
  }

  getKycData() {
    let params = {};
    let url = environment.apiPrefix + `/kyclink/${this.crnId}`;
    this.kycService.getKycData(url, params).subscribe(
      (resp: any) => {
        console.log('USER KYC DETAIL ', resp);
        if (resp.success) {
          console.log(resp.result);
          if (resp.result.documents.length > 0) {
            const documents = resp.result.documents;
            for (let document of documents){
              if (document.type === "logo") {
                this.logoPath = environment.apiHost + '/uploads/kyc/' + document.hash;
              }
            }
          }
          this.cdr.detectChanges();
        }
        if (!this.logoPath) this.logoPath = "/assets/img/Castler_logo.png";
      },
      err => {
        console.log('ERROR FROM API SIDE ', err);
        if (err.status === 0) {
          console.log('Connection Error');
        } else {
          console.log(err.error.errors);
        }
        this.cdr.detectChanges();
      }
    );
  }
}
