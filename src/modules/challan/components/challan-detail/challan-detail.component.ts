import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChallanModel } from '@modules/challan/models';
import { ChallanService } from '@modules/challan/services';

import { environment } from '../../../../environments/environment';

@Component({
  selector: 'sbpro-challan-detail',
  templateUrl: './challan-detail.component.pug',
  styleUrls: ['./challan-detail.component.scss']
})
export class ChallanDetailComponent implements OnInit {
  public challan!: ChallanModel;
  private _challanId: string | null = '';

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private challanService: ChallanService,
    private cdr: ChangeDetectorRef
  ) {
    try {
      this._challanId = activatedRoute.snapshot.paramMap.get('challanId');
      //console.log("shallan id",this._challanId)
    } catch (e) {
      console.log(e);
    }
  }

  ngOnInit(): void {
    if (this._challanId) {
      this.challanService.findOne(this._challanId).subscribe(resp => {
        if (resp.success) {
          console.log(resp.result)
          this.challan = resp.result;
          this.cdr.detectChanges();
          //console.log("challan",this.challan)
          return;
        }
        this.challan = {} as ChallanModel;
      });
    } else if (!this.challan) {
      this.challan = {} as ChallanModel;
    }
  }

  goBack() {
    console.log('navigating to list');
    this.router.navigate([environment.urlPortalPrefix + '/challan']);
  }

  convertToNumber(val : string) {
    return Number(val).toFixed(2);
  }

}
