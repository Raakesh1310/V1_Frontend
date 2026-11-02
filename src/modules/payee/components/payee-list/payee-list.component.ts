import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@modules/auth/services';
import { Payee } from '@modules/payee/models';
import { PayeeService } from '@modules/payee/services';
import { ProfileService } from '@modules/profile/services';
import { SortEvent } from '@modules/tables/directives';
import {
  NgbDateStruct,
  NgbModal,
  NgbModalRef
} from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

@Component({
  selector: 'sbpro-payee-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payee-list.component.pug',
  styleUrls: ['payee-list.component.scss']
})
export class PayeeListComponent implements OnInit {
  @Input() pageSize = 8;
  @Input() readOnly = false;
  @Input() merchantId = '';
  model!: NgbDateStruct;
  payees$!: Observable<Payee[]>;
  total$!: Observable<number>;
  sortedColumn!: string;
  sortedDirection!: string;
  modalRef?: NgbModalRef;
  clearForm = false;
  isAdmin = false;
  upiPayoutEnabled = false;
  @ViewChild('infoMessage', { static: true }) infoMessage?: ElementRef;

  constructor(
    public payeeService: PayeeService,
    private router: Router,
    public changeDetectorRef: ChangeDetectorRef,
    private authService: AuthService,
    private modalService: NgbModal,
    private profileService: ProfileService
  ) {
    this.isAdmin = this.authService.isSuperAdmin();
  }

  ngOnInit() {
    // this.accountsService.retrieveData();
    // this.accountsService.performSearch();
    this.profileService
      .getProfile(this.merchantId ? this.merchantId : null, false)
      .subscribe((resp: any) => {
        this.upiPayoutEnabled = resp.result.upiPayoutEnabled;

        this.changeDetectorRef.detectChanges();
      });
    this.loadData();
    this.payeeService.pageSize = this.pageSize;
    this.payees$ = this.payeeService.payees$;
    this.total$ = this.payeeService.total$;
    this.payeeService.updateReportDownloadLink(this.merchantId);
  }

  loadData() {
    if (this.merchantId) {
      this.payeeService.merchantId = this.merchantId;
    }
    this.payeeService.performSearch();
  }

  clearSearchForm() {
    this.clearForm = false;
    this.payeeService.searchTerm = '';
    this.loadData();
  }

  submitSearchForm() {
    this.clearForm = true;
    console.log('Submitting Search Form');

    // Reload the data
    this.payeeService.performSearch();
  }

  showDetails(payeeId: string) {
    if (!this.isAdmin) {
      this.router.navigate([environment.urlPortalPrefix + '/payee/' + payeeId]);
    } else {
      this.router.navigate([environment.urlAdminPrefix + '/payee/' + payeeId], {
        queryParams: { merchantId: this.merchantId }
      });
    }
  }

  onSort({ column, direction }: SortEvent) {
    this.sortedColumn = column;
    this.sortedDirection = direction;
    this.payeeService.sortColumn = column;
    this.payeeService.sortDirection = direction;
    this.changeDetectorRef.detectChanges();
  }

  addPayee() {
    this.modalRef = this.modalService.open(this.infoMessage, {
      backdrop: 'static',
      size: 'lg'
    });
  }

  closeModal() {
    this.modalRef?.close();
  }

  setModalClose(flag: boolean) {
    if (flag) {
      this.closeModal();
    }
    this.loadData();
  }
}
