import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChallanModel } from '@modules/challan/models';
import { ChallanService } from '@modules/challan/services';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from '@modules/auth/services/auth.service';

import { environment } from '../../../../environments/environment';
import { UtilityService } from '@common/services';

@Component({
  selector: 'sbpro-challan-table',
  templateUrl: './challan-table.component.pug',
  styleUrls: ['./challan-table.component.scss']
})
export class ChallanTableComponent implements OnInit {
  private isSuperAdmin = false;
  private _challans$!: Observable<ChallanModel[]>;
  private _loadingList$ = new BehaviorSubject(false);
  private generatedFiles = new Map();
  total$!: Observable<number>;
  page = 1;
  placeholder = '';

  get challans$(): Observable<ChallanModel[]> {
    return this._challans$;
  }

  get loadingList$(): BehaviorSubject<boolean> {
    return this._loadingList$;
  }

  showDetail($event: Event, challan: ChallanModel) {
    $event.preventDefault();
    if (!challan) {
      console.log('No Challan entry found');
      return;
    }
    if (this.isSuperAdmin) {
      this.router.navigate([
        `${environment.urlAdminPrefix}/challan/${challan.challanId}`
      ]);
    } else {
      this.router.navigate([
        `${environment.urlPortalPrefix}/challan/${challan.challanId}`
      ]);
    }
  }

  loadData() {
    this._loadingList$.next(true);
    this.challanService.fetchData();
  }

  constructor(
    private challanService: ChallanService,
    private router: Router,
    private authService: AuthService,
    private utilityService: UtilityService
  ) {
    this._challans$ = challanService.challans$;
    this.total$ = challanService.total$;
    this.isSuperAdmin = this.authService.isSuperAdmin();
    challanService.challans$.subscribe(() => {
      this._loadingList$.next(false);
    });

    this.placeholder = this.isSuperAdmin
      ? 'Search By Merchant Name, URN, Virtual ID'
      : 'Search By URN, Virtual ID';

    /**
     * Trigger the Network call
     * to fetch the challan list
     */
    this.loadData();
  }

  ngOnInit(): void {
    this.page = this.challanService.page;
    this.total$ = this.challanService.total$;
  }

  generateChallan(challan: ChallanModel) {
    console.log('challan on click', challan);
    if (this.generatedFiles.has(challan.challanId)) {
      window.open(
        environment.apiPrefix +
          '/challan/download/' +
          this.generatedFiles.get(challan.challanId),
        '_blank'
      );
      return;
    }
    let formData = {
      customerCopy: {
        payTo: 'NCOME',
        payerName: challan.payerName,
        payerDetail1: challan.payerDetail1,
        payerDetail2: challan.payerDetail2,
        payerDetail3: `Unique Reference Number: ${challan.challanId}`,
        contactNo: [challan.contact1, challan.contact2 === null ? "" : challan.contact2],
        total: challan.amount
      },
      bankCopy: {
        payTo: 'NCOME',
        payerName: challan.payerName,
        payerDetail1: challan.payerDetail1,
        payerDetail2: challan.payerDetail2,
        payerDetail3: `Unique Reference Number: ${challan.challanId}`,
        contactNo: [challan.contact1, challan.contact2 === null ? "" : challan.contact2],
        total: challan.amount,
        amountWords: challan.amountWords
      }
    };

    this.challanService.generatePdfLink(formData).subscribe(data => {
      console.log(data);
      window.open(
        environment.apiPrefix + '/challan/download/' + data.result.fileName,
        '_blank'
      );
      const challanId = challan.challanId;
      this.generatedFiles.set(challanId, data.result.fileName);
    });
  }
  clearSearchForm() {
    this.challanService.page = 1;
    this.challanService.searchTerm = '';
    this.loadData();
  }

  convertToNumber(val : string) {
    return Number(val).toFixed(2);
  }

  /**
   * Format number according to Indian currency
   * @param number
   * @returns
   */
   public toINR(number: number) {
    return this.utilityService.toINR(number);
  }
}
