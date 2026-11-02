import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilityService } from '@common/services';
import { AuthService } from '@modules/auth/services';
import { TransferDocumentInterface } from '@modules/passbook/models/document.model';
import approvalType from '@modules/transfers/constants/approvalType';
import { ExcelAccountFormat } from '@modules/transfers/models/create-transfer-response.model';
import { TransfersService } from '@modules/transfers/services';
import { S3FolderName } from '@modules/vpa/constants/s3FolderNameConstants';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import merchantUserRoles from 'config/merchantUserRoles';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'sbpro-bulk-transfer-details',
  templateUrl: './bulk-transfer-details.component.pug',
  styleUrls: ['./bulk-transfer-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BulkTransferDetailsComponent implements OnInit {
  transferTotal$!: number;
  transferPage = 1;
  transferPageSize = 10;
  payeeOfSingleTransfer: ExcelAccountFormat[] = [];
  isLoading = false;
  isDocumentLoading = false;
  isAdmin = false;
  queryPageNumber = 0;
  comingFromApprovals = false;
  selectedTransfer: any = null;
  private modalRef?: NgbModalRef;
  batchId = '';
  downloadLink = '';
  supportingDocuments: TransferDocumentInterface[] = [];
  docUrlPrefix = environment.apiHost + '/uploads/transfers/multi-transfers/';
  oldMap: boolean = false;
  authorizers = [];
  isLoadingAuthorization = false;
  errors: string[] = [];
  isUPIBulkTransfer = false;
  isTrustee = false;
  roles: string[] = [];
  isSuperAdminViewer = false;
  readOnly = false;
  downloadFolderName = S3FolderName.BULK_TRANSFERS;
  connectedBanking = false;
  previousURL = '';
  trusteeEmails = '';

  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private router: Router,
    private modalService: NgbModal,
    public transferService: TransfersService,
    private utilityService: UtilityService
  ) {
    this.isAdmin = this.authService.isSuperAdmin();
  }

  downloadFile($event: Event, docHash: string, docName?: string) {
    this.utilityService.downloadFile(
      $event,
      docHash,
      this.downloadFolderName,
      docName
    );
  }

  ngOnInit(): void {
    console.log('Routing data ' + this.route.snapshot.params.id);

    this.batchId = this.route.snapshot.params.id;
    this.getSingleBulkTransfers({ batchId: this.route.snapshot.params.id });
    // find Supporting documents
    this.findDocuments(this.batchId);
    // accessing query params...
    this.route.queryParams.subscribe((params: any) => {
      console.log('Params Data ', params);
      this.queryPageNumber = params.page;
      this.comingFromApprovals = params.approvals;
    });
    this.updateDownloadLink();
    this.checkForReadOnly();
  }

  checkForReadOnly() {
    this.roles = this.authService.getRole();
    this.isSuperAdminViewer =
      this.roles?.indexOf(merchantUserRoles.SUPER_ADMIN_VIEWER) > -1
        ? true
        : false;
    this.isTrustee =
      this.roles?.indexOf(merchantUserRoles.TRUSTEE) > -1 ? true : false;
    if (this.roles && (this.isTrustee || this.isSuperAdminViewer)) {
      this.readOnly = true;
    }
  }

  // modal functions
  //tslint:disable-next-line:no-any
  openModal(modal: any) {
    this.modalRef = this.modalService.open(modal);
  }

  setColor(status: string) {
    if (status === 'Success') {
      return '#18B81F';
    } else if (status === 'Pending for Authorization') {
      return '#F5A500';
    } else if (status === 'Sent for Processing') {
      return '#329ca8';
    } else if (status === 'Failed') {
      return '#FF0000';
    }
  }

  arrangeAuthorizations(authorizations: any) {
    let approvals: any = {
      '1account': {},
      '2merchant': {},
      '3admin': {},
      '4trustee': {}
    };

    let isArranged = false;
    for (let key of Object.keys(approvals)) {
      if (Object.keys(authorizations).includes(key)) {
        if (Object.keys(authorizations[key]).length > 0) {
          isArranged = true;
          break;
        }
      }
    }

    if (isArranged) {
      return authorizations;
    }

    authorizations.sort((a: any, b: any) => a.data.priority - b.data.priority);

    for (let authorization of authorizations) {
      if (authorization.data.type === approvalType.accountAuthorizer) {
        if (!(`${authorization.data.level}` in approvals['1account'])) {
          approvals['1account'][authorization.data.level] = {
            authorizers: [authorization],
            minApprovalsNeeded: authorization.data.approvalsRequired,
            isApproved: false,
            type: approvalType.accountAuthorizer
          };
        } else {
          approvals['1account'][authorization.data.level][
            'authorizers'
          ].unshift(authorization);
        }
      }

      if (authorization.data.type === approvalType.merchantAuthorizer) {
        if (!(`${authorization.data.level}` in approvals['2merchant'])) {
          approvals['2merchant'][authorization.data.level] = {
            authorizers: [authorization],
            minApprovalsNeeded: authorization.data.approvalsRequired,
            isApproved: false,
            type: approvalType.merchantAuthorizer
          };
        } else {
          approvals['2merchant'][authorization.data.level][
            'authorizers'
          ].unshift(authorization);
        }
      }

      if (authorization.data.type === approvalType.adminAuthorizer) {
        if (!(`${authorization.data.level}` in approvals['3admin'])) {
          approvals['3admin'][authorization.data.level] = {
            authorizers: [authorization],
            minApprovalsNeeded: authorization.data.approvalsRequired,
            isApproved: false,
            type: approvalType.adminAuthorizer
          };
        } else {
          approvals['3admin'][authorization.data.level]['authorizers'].unshift(
            authorization
          );
        }
      }

      if (authorization.data.type === approvalType.trustee) {
        if (!(`${authorization.data.level}` in approvals['4trustee'])) {
          approvals['4trustee'][authorization.data.level] = {
            authorizers: [authorization],
            minApprovalsNeeded: authorization.data.approvalsRequired,
            isApproved: false,
            type: approvalType.trustee
          };
        } else {
          approvals['4trustee'][authorization.data.level][
            'authorizers'
          ].unshift(authorization);
        }
      }
    }

    for (let approval_type in approvals) {
      for (let level in approvals[approval_type]) {
        // level.
        let totalApproved = 0;
        for (let auth of approvals[approval_type][level].authorizers) {
          totalApproved += auth.data.approved ? 1 : 0;
        }
        approvals[approval_type][level].isApproved =
          totalApproved >= approvals[approval_type][level].minApprovalsNeeded;

        approvals[approval_type][level].authorizers.sort((a: any, b: any) => {
          return new Date(a.verifiedAt) > new Date(b.verifiedAt) ? 1 : -1;
        });
      }
    }

    return approvals;
  }

  findDocuments(batchId: string) {
    // this.data = [];
    this.isDocumentLoading = true;
    this.cdr.detectChanges();
    let url = environment.apiPrefix + `/multi-transfer/${batchId}/document`;
    if (this.isAdmin) {
      url =
        environment.apiPrefix +
        `/super-admin/multi-transfer/${batchId}/document`;
    }
    this.httpClient.get(url, {}).subscribe(
      (resp: any) => {
        if (resp.success) {
          //this.noOfPayees = resp.itemsCount;
          if (resp.result.length > 0) {
            this.supportingDocuments = (resp.result as TransferDocumentInterface[])?.map(
              document => {
                return {
                  ...document,
                  fileURL:
                    environment.apiPrefix +
                    '/multi-transfer/download/' +
                    document.hash
                };
              }
            );
          }
        } else {
          console.log('ERROR ', resp.errors);
        }
        this.isDocumentLoading = false;
        this.cdr.detectChanges();
      },
      err => {
        this.isDocumentLoading = false;
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
  openMap(modal: HTMLTemplateElement) {
    console.log('GETTING BULK TRANSFERS Authorizations');
    console.log('SELECTED TRANSFER ', this.selectedTransfer);
    const url =
      environment.apiPrefix +
      `/transfer/${this.selectedTransfer.transferId}/authorization`;

    this.isLoadingAuthorization = true;
    this.cdr.detectChanges();
    this.httpClient.get(url).subscribe(
      (resp: any) => {
        console.log('RESP ', resp);
        if (resp.success) {
          this.selectedTransfer.authorization = resp.result;
        }
        this.mapAuthorizations();
        this.isLoadingAuthorization = false;
        this.cdr.detectChanges();
        this.modalRef = this.modalService.open(modal, {
          backdrop: 'static'
        });
      },
      err => {
        this.isLoadingAuthorization = false;
        console.log('ERROR FROM API SIDE ', err);
        if (err.status === 0) {
          console.log('Connection Error');
          this.errors.push('Connection Error');
        } else {
          console.log(err.error.errors);
          this.errors.push(err.error.errors);
          //this.errors = err.error.errors;
        }
        this.cdr.detectChanges();
      }
    );
  }

  mapAuthorizations() {
    let arrangedAuthorizer: any = {};
    const authorizations = [];
    if (
      this.selectedTransfer.authorization[0]?.data?.level ||
      Object.keys(this.selectedTransfer.authorization).includes('1account') ||
      Object.keys(this.selectedTransfer.authorization).includes('2merchant') ||
      Object.keys(this.selectedTransfer.authorization).includes('3admin') ||
      Object.keys(this.selectedTransfer.authorization).includes('4trustee')
    ) {
      this.oldMap = false;
      arrangedAuthorizer = this.arrangeAuthorizations(
        this.selectedTransfer.authorization
      );

      this.authorizers = arrangedAuthorizer;
      this.selectedTransfer.authorization = arrangedAuthorizer;
      if (typeof arrangedAuthorizer['4trustee'][1] !== 'undefined') {
        this.trusteeEmails = arrangedAuthorizer['4trustee'][1]['authorizers'].map((item: any) => item.email).join(', ');
      }
    } else if (this.selectedTransfer.authorization.length > 0) {
      this.oldMap = true;
      for (const auth of this.selectedTransfer.authorization) {
        console.log(auth);
        if (auth.verified && !auth.data.approved) {
          authorizations.push(auth);
          break;
        }
        authorizations.push(auth);
      }
      console.log(authorizations);
      authorizations.sort(
        (a: any, b: any) => a.data.priority - b.data.priority
      );

      this.selectedTransfer.authorization = authorizations;
    } else {
      // Authorization length is zero than set authorizers to 0
      this.authorizers = [];
    }
  }

  closeModal() {
    this.modalRef?.close();
  }

  getSingleBulkTransfers(params: any) {
    console.log('GETTING SINGLE BULK TRANSFERS');
    this.isLoading = true;
    this.cdr.detectChanges();
    let url =
      environment.apiPrefix + `/multi-transfer/${params.batchId}/transfers`;
    this.httpClient.get(url).subscribe(
      (resp: any) => {
        this.isLoading = false;
        this.payeeOfSingleTransfer = [];
        if (resp.success) {
          //this.noOfPayees = resp.itemsCount;
          if (resp.result.length > 0) {
            this.transferTotal$ = resp.result.length;
            this.payeeOfSingleTransfer = resp.result;
            this.isUPIBulkTransfer = resp.result.length && !!resp.result[0].vpa;
            if (resp.result[0].bankAccountNumber) {
              this.connectedBanking = true;
            }
          }
        } else {
          console.log('ERROR ', resp.errors);
        }
        this.cdr.detectChanges();
      },
      err => {
        console.log('ERROR FROM API SIDE ', err);
        if (err.status === 0) {
          console.log('Connection Error');
        } else {
          console.log(err.error.errors);
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    );
  }

  loadPage(event: any) {
    console.log('PAGE ', this.transferPage);
  }

  goBack() {
    if (this.isAdmin && !this.comingFromApprovals) {
      this.connectedBanking
        ? this.router
          .navigate([environment.urlAdminPrefix + '/transfer/bank-account'])
          .then(r => r)
        : this.router
          .navigate([environment.urlAdminPrefix + '/transfer'])
          .then(r => r);
    } else if (!this.comingFromApprovals) {
      this.connectedBanking
        ? this.router
          .navigate([environment.urlPortalPrefix + '/passbook/bank-accounts'])
          .then(r => r)
        : this.router
          .navigate([environment.urlPortalPrefix + '/passbook'])
          .then(r => r);
    } else {
      this.router
        .navigate([environment.urlPortalPrefix + '/approvals'])
        .then(r => r);
    }
  }

  showDetails(id: string) {
    this.router
      .navigate([environment.urlPortalPrefix + '/passbook/' + id])
      .then(r => r);
  }

  updateDownloadLink() {
    const params: any = {
      token: this.authService.getBearerToken()
    };

    console.log('PARAMS ', params);
    let paramsSerialized = '';

    for (const paramsKey in params) {
      if (paramsSerialized.length > 0) {
        paramsSerialized += '&';
      }
      paramsSerialized += `${paramsKey}=${params[paramsKey]}`;
    }
    if (this.isAdmin) {
      this.downloadLink =
        environment.apiPrefix +
        `/super-admin/multi-transfer/${this.batchId}/report/download?` +
        paramsSerialized;
    } else {
      this.downloadLink =
        environment.apiPrefix +
        `/multi-transfer/${this.batchId}/report/download?` +
        paramsSerialized;
    }
    this.cdr.detectChanges();
  }
}
