import {
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  Input,
  OnInit,
  SimpleChanges,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { Router } from '@angular/router';
import { UtilityService } from '@common/services';
import { NgbDateParserService } from '@common/services/NgbDateParser.service';
import { Account } from '@modules/accounts/models';
import { AccountsResponseModel } from '@modules/accounts/models/accounts-response.model';
import { AccountsService } from '@modules/accounts/services';
import { AuthService } from '@modules/auth/services';
import { EscrowPageWidgetsPageComponent } from '@modules/escrow-page-widgets/containers';
import { EscrowPagesService } from '@modules/escrow-pages/services';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

import {
  formCache,
  page1Fields,
  page2Fields
} from '../../data/escrow-page-form.data';
import {
  AccountDetails,
  EscrowPageChildPage,
  EscrowPageCustomerField,
  EscrowPageProductField
} from '../../models/escrow-pages.model';
import { PreviewComponent } from '../preview/preview.component';

@Component({
  selector: 'sbpro-create-form',
  templateUrl: './escrow-page-form.component.pug',
  styleUrls: ['./escrow-page-form.component.scss']
})
export class EscrowPageFormComponent implements OnInit {
  private modalRef?: NgbModalRef;
  private preview = false;
  logo: string | null;
  businessName: string | null;
  submitting = false;
  formCache: any = formCache;
  errors: string[];
  @ViewChild('viewContainer', { read: ViewContainerRef })
  viewContainer!: ViewContainerRef;
  private _pages: EscrowPageChildPage[] = [];
  currentPage = 1;

  // account dropdown settings
  accounts!: any;
  selectedAccount: any = null;
  accounts$!: Observable<Account[]>;
  productFields: EscrowPageProductField[];
  customerFields: EscrowPageCustomerField[];
  pageTitle = '';
  dropdownList: any = [];
  selectedItems: any = [];
  selectedAccounts: any = {};
  dropdownSettings = {};
  @ViewChild('infoMessage', { static: true }) infoMessage?: ElementRef;
  @Input() public escrowPagePG = false;
  @Input() public pgSettlementAccount: string = '';

  constructor(
    private modalService: NgbModal,
    private accountService: AccountsService,
    private authService: AuthService,
    private utilityService: UtilityService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private dateParser: NgbDateParserService,
    private cdr: ChangeDetectorRef,
    private escrowPageService: EscrowPagesService,
    private router: Router
  ) {
    localStorage.removeItem('escrow_page_bool');
    this.errors = [];
    this.logo = authService.getLogo();
    this.businessName = authService.getTitle();
    this.productFields = page1Fields;
    this.customerFields = page2Fields;
  }

  ngOnInit(): void {
    this.changePage(1);

    this.dropdownSettings = {
      singleSelection: false,
      text: 'Select Escrows',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: 'myclass custom-class',
      badgeShowLimit: 3
    };
  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes.pgSettlementAccount) {
      if (changes.pgSettlementAccount.currentValue !== '') this.loadAccounts(changes.pgSettlementAccount.currentValue);
    }
  }

  loadAccounts(hardEscrowAccountNumber: string[]) {
    this.accountService
      .getAccounts(null, -1, {hardEscrowAccountNumber: hardEscrowAccountNumber})
      .subscribe((resp: AccountsResponseModel) => {
        console.log(resp);
        if (resp.success) {
          this.accounts = resp.result;
          console.log(resp.result);
          this.dropdownList = this.mapAccounts(this.accounts);
          this.cdr.detectChanges();
        }
      });
  }

  detectChanges() {
    // set form controls
    this.checkIfSomethingUpdated();
    this.cdr.detectChanges();
  }

  detectTitleChange(event: any) {
    this.checkIfSomethingUpdated();
    console.log('EVENT ', event.target.value);
  }

  removeOldErrors() {
    this.errors = [];
    this.cdr.detectChanges();
  }

  checkIfSomethingUpdated() {
    let flag = false;
    if (
      this.pageTitle !== null &&
      this.pageTitle !== '' &&
      this.pageTitle !== undefined
    ) {
      flag = true;
    }
    if (this.selectedAccount) {
      flag = true;
    }
    if (flag) {
      localStorage.setItem('escrow_page_bool', 'false');
    } else {
      localStorage.setItem('escrow_page_bool', 'true');
    }
  }

  mapAccounts(accounts: any) {
    let itemsList = [];
    for (let account of accounts) {
      itemsList.push({
        id: account.accountId,
        itemName: account.name,
        name: account.name,
        ifsc: account.ifsc,
        bankAccount: account.accountId,
        phone: account.mobile,
        email:account.email?.split(',')[0],
        address1: 's'
      });
    }
    return itemsList;
  }

  /**
   *   submit Basic form
   */
  submitAccount() {
    /**
     * Remove Old errors
     * to prevent the error's dismissable
     * issue
     */
    this.removeOldErrors();

    if (!this.escrowPagePG) {
      this.modalRef = this.modalService.open(this.infoMessage, {
        backdrop: 'static',
        size: 'lg'
      });
      this.cdr.detectChanges();
      return;
    }

    if (!this.pageTitle) {
      this.errors.push('Please provide a title for your page.');
      this.detectChanges();
      return;
    }
    if (this.selectedItems.length === 0) {
      this.errors.push('Please select an Escrow.');
      this.detectChanges();
      return;
    }

    this.submitting = true;

    for (let item of this.selectedItems) {
      // delete item.id;
      // delete item.itemName;
      item.phone = item.phone.toString();
      Object.assign(item, { status: 'ACTIVE' });
    }

    console.log(this.selectedItems);

    /**
     * make service call here to first API
     * and put below code into response success
     */
    // this.escrowPageService
    //   .createVendors(this.selectedItems)
    //   .subscribe((resp: any) => {
    //     // this.submitting = false;
    //     console.log(resp);
    //     if (resp.success) {
    //       console.log(resp.result);
    //     }
    //   });

    /**
     * make service call here to first API
     * and put below code into response success
     */
    // this.escrowPageService
    //   .createBeneficiary(this.selectedItems)
    //   .subscribe((resp: any) => {
    //     // this.submitting = false;
    //     console.log(resp);
    //     if (resp.success) {
    //       console.log(resp.result);
    //       this.selectedItems = resp.result;
    //     }
    //   });

    // set form cache
    this.formCache.businessName = this.authService.getTitle();
    this.formCache.logo = this.authService.getLogo();
    // this.formCache.accountId = this.selectedAccount.accountId;
    // this.formCache.ifsc = this.selectedAccount.ifsc;
    this.formCache.title = this.pageTitle;

    // create body
    const inputs: AccountDetails = {
      // accountId: this.formCache.accountId,
      // ifsc: this.formCache.ifsc,
      accounts: this.selectedItems,
      businessName: this.formCache.businessName,
      logo: this.formCache.logo,
      title: this.formCache.title
    };

    /**
     * make service call here to first API
     * and put below code into response success
     */
    this.escrowPageService.create(inputs).subscribe((resp: any) => {
      this.submitting = false;
      console.log(resp);
      if (resp.success) {
        this.formCache.pages = resp.result.childPages;
        this.pages = this.formCache.pages;
        console.log(this.pages);
        this.nextView();
        this.renderPage(1);
      }
    });
  }

  closeModal() {
    this.modalRef?.close();
    this.router.navigate([`/dashboard`]);
  }

  /**
   * submit pages
   */

  submitPage(page: number) {
    /**
     * Remove Old errors
     * to prevent the error's dismissable
     * issue
     */
    this.removeOldErrors();

    if (!this.escrowPagePG) {
      this.modalRef = this.modalService.open(this.infoMessage, {
        backdrop: 'static',
        size: 'lg'
      });
      this.cdr.detectChanges();
      return;
    }

    // console.log('submitting page : ', page);

    const pageCache = this._pages[page - 1];
    for (let j = 0; j < pageCache.fields.length; j++) {
      console.log('Page CACHE ', pageCache);
      if (pageCache.fields[j].required) {
        console.log(pageCache.fields[j].value);
        if (!pageCache.fields[j].value) {
          localStorage.setItem('escrow_page_bool', 'true');
          this.errors.push(`${pageCache.fields[j].label} is required`);
          this.cdr.detectChanges();
          return;
        } else {
          localStorage.setItem('escrow_page_bool', 'false');
        }
      }
    }

    this.formCache.pages[page - 1] = pageCache;
    this.escrowPageService
      .updateEscrowChildPage(
        pageCache.escrowPageId,
        pageCache.childPageId,
        pageCache
      )
      .subscribe((resp: any) => {
        if (resp.success) {
          this.nextView();
          this.renderPage(2);
        }
      });
  }

  /**
   * submit last page
   */
  submitLastPage(page: number) {
    /**
     * Remove Old errors
     * to prevent the error's dismissable
     * issue
     */
    this.removeOldErrors();

    this.submitting = true;
    console.log('submitting last page', page);

    const pageCache = this._pages[page - 1];

    if (page === 2) {
      Object.assign(pageCache, { status: 'Active' });
    }

    this.formCache.pages[page - 1] = pageCache;
    this.escrowPageService
      .updateEscrowChildPage(
        pageCache.escrowPageId,
        pageCache.childPageId,
        pageCache
      )
      .subscribe((resp: any) => {
        this.submitting = false;
        console.log(resp);
        if (resp.success) {
          this.previewModal(pageCache.escrowPageId);
          // this.router.navigate([environment.urlPortalPrefix + '/escrow-page']);
        }
      });
  }

  /**
   *
   *
   *      Page Functions
   *
   *
   */
  nextView() {
    this.currentPage += 1;
    this.errors = [];
    this.cdr.detectChanges();
  }

  previousView() {
    this.currentPage -= 1;
    this.errors = [];
    this.cdr.detectChanges();
    this.previousPage();
  }

  /**
   *
   * preview functions
   *
   */
  previewModal(pageId: string) {
    const modalRef = this.modalService.open(PreviewComponent, {
      windowClass: 'my-class',
      backdrop: 'static'
    });
    modalRef.componentInstance.doClose = modalRef;
    modalRef.componentInstance.pageId = pageId;
    modalRef.componentInstance.isModal = true;
    modalRef.componentInstance.form = this.formCache;

    modalRef.result.then((result: boolean) => {
      if (result) {
        localStorage.setItem('escrow_page_bool', 'true');
        this.escrowPageService
          .updateEscrowPage(pageId, { status: 'Active' })
          .subscribe((resp: any) => {
            if (resp.success) {
              this.router.navigate([
                environment.urlPortalPrefix + '/escrow-page'
              ]);
            }
          });
      } else {
        localStorage.setItem('escrow_page_bool', 'false');
        return;
      }
    });
  }

  /**
   *
   * INdividual page rendering and functions
   *
   */
  renderPage(pageNo: number) {
    console.log('Rendering page');
    console.log('Page: ' + pageNo);
    const fieldObject = this.pages[pageNo - 1];

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
      EscrowPageWidgetsPageComponent
    );
    let widget: ComponentRef<EscrowPageWidgetsPageComponent>;

    this.viewContainer.clear(); // Clear the view

    widget = this.viewContainer.createComponent(componentFactory);
    widget.instance.data = fieldObject;

    widget.instance.change.subscribe((value: EscrowPageChildPage) => {
      this._pages[pageNo - 1] = value;
      console.log(this._pages);
    });
    this.cdr.detectChanges();
  }

  changePage(pageNo: number) {
    if (
      !this._pages ||
      this._pages.length === 0 ||
      pageNo <= 0 ||
      pageNo >= this._pages.length + 1
    ) {
      return;
    }

    this.renderPage(pageNo);
  }

  nextPage() {
    this.changePage(this.currentPage + 1);
  }

  previousPage() {
    this.changePage(this.currentPage - 1);
  }

  get pages(): EscrowPageChildPage[] {
    return this._pages;
  }

  set pages(value: EscrowPageChildPage[]) {
    this._pages = value;
  }
}
