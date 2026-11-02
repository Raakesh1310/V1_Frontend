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

import { PartiesService } from '@modules/parties/services';
import merchantUserRoles from 'config/merchantUserRoles';

@Component({
  selector: 'sbpro-parties-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './parties-list.component.pug',
  styleUrls: ['parties-list.component.scss']
})
export class PartiesListComponent implements OnInit {
  @Input() pageSize = 8;
  @Input() page = 1;
  searchTerm = '';
  @Input() readOnly = false;
  @Input() merchantId = '';
  partyId = '';
  model!: NgbDateStruct;
  payees$!: Observable<Payee[]>;
  parties: any;
  total$!: Observable<number>;
  total = 0;
  sortedColumn!: string;
  sortedDirection!: string;
  modalRef?: NgbModalRef;
  clearForm = false;
  isAdmin = false;
  upiPayoutEnabled = false;
  @ViewChild('infoMessage', { static: true }) infoMessage?: ElementRef;
  roles: string[] = [];
  isMerchantAuthorizer: boolean = false;
  isTrustee: boolean = false;

  constructor(
    public partiesService: PartiesService,
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
    this.loadData(1);
    this.checkForReadOnly();
  }

  checkForReadOnly() {
    this.roles = this.authService.getRole();
    this.isMerchantAuthorizer =
      this.roles?.indexOf(merchantUserRoles.MERCHANT_AUTHORIZER) > -1
        ? true
        : false;
    this.isTrustee =
      this.roles?.indexOf(merchantUserRoles.TRUSTEE) > -1 ? true : false;
    if (this.roles && (this.isMerchantAuthorizer || this.isTrustee)) {
      this.readOnly = true;
    }
  }

  loadData(page: number = 1) {
    this.partiesService
      .getParties(this.isAdmin, this.merchantId, this.page)
      .subscribe((resp: any) => {
        this.parties = resp.result;
        this.total = resp.allItemsCount;
        this.changeDetectorRef.detectChanges();
      });
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
    this.partiesService
      .getParties(this.isAdmin, this.merchantId, this.page, this.searchTerm)
      .subscribe((resp: any) => {
        this.parties = resp.result;
        this.total = resp.allItemsCount;
        this.changeDetectorRef.detectChanges();
      });
  }

  showDetails(partyId: string) {
    this.partyId = partyId;
    this.modalRef = this.modalService.open(this.infoMessage, {
      backdrop: 'static',
      size: 'xl'
    });
  }

  onSort({ column, direction }: SortEvent) {
    this.sortedColumn = column;
    this.sortedDirection = direction;
    this.payeeService.sortColumn = column;
    this.payeeService.sortDirection = direction;
    this.changeDetectorRef.detectChanges();
  }

  addParty() {
    this.partyId = '';
    this.modalRef = this.modalService.open(this.infoMessage, {
      backdrop: 'static',
      size: 'xl'
    });
  }

  closeModal() {
    this.partyId = '';
    this.modalRef?.close();
  }

  setModalClose(flag: boolean) {
    if (flag) {
      this.closeModal();
    }
    this.loadData();
  }

  pageChange(event: any) {
    const params: any = { page: event };
    this.page = event;
    this.loadData();
    this.changeDetectorRef.detectChanges();
  }
}
