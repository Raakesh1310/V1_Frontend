import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { UtilityService } from '@common/services';
import banksTypes from '@modules/accounts/constants/banksTypes';
import { AuthService } from '@modules/auth/services';
import {
  PayeesSubMenuList,
  TransferSubMenuList,
  sideNavItems,
  sideNavItemsAdmin,
  sideNavSections,
  sideNavSectionsAdmin
} from '@modules/navigation/data/side-nav-dashboard.data';
import {
  SideNavItem,
  SideNavItems,
  SideNavSection
} from '@modules/navigation/models';
import { NavigationService } from '@modules/navigation/services';
import { RoleAccessPoint } from '@modules/profile/models/roleAccess.model';
import merchantUserRoles from 'config/merchantUserRoles';
import _ from 'lodash';
import { Subscription } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { TAndCStatusEnum } from '@modules/auth/models/tAndC.model';

@Component({
  selector: 'sbpro-layout-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './layout-dashboard.component.pug',
  styleUrls: ['layout-dashboard.component.scss']
})
export class LayoutDashboardComponent implements OnInit, OnDestroy {
  @Input() static = false;
  @Input() light = false;
  @Input() rtl = false;
  @HostBinding('class.sidenav-toggled') sideNavHidden = false;
  subscription: Subscription = new Subscription();
  sideNavItems!: SideNavItems;
  sideNavSections!: SideNavSection[];
  sideNavItemsAdmin!: SideNavItems;
  sideNavSectionsAdmin!: SideNavSection[];
  sidenavStyle = 'sidenav-dark';
  modalRef?: NgbModalRef;
  @ViewChild('tAndCAccept', { static: true }) rejectMessage?: ElementRef;

  constructor(
    public utilityService: UtilityService,
    public navigationService: NavigationService,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    private authService: AuthService,
    private modalService: NgbModal
  ) {
    this.sideNavItems = {};
    this.sideNavSections = [];
    this.sideNavItemsAdmin = {};
    this.sideNavSectionsAdmin = [];
  }

  addMenuItemByRoles() {
    let userRole = this.authService.getRole();
    let merchantProfile = this.authService.getMerchantProfile();
    let hasICICIAccess = false;

    if (!merchantProfile?.escrowPagePG) {
      delete sideNavItems.escrowPage;
    }

    if (
      !merchantProfile?.connectedBanking ||
      !merchantProfile?.isAccountAddAllowed
    ) {
      delete sideNavItems.digitalEscrow;
      delete sideNavItems.connectedBanking;
      delete sideNavItems.spacing;
    }
    //Check if Merchant has ICICI access and then load challan
    if (merchantProfile?.banks) {
      for (let bank of merchantProfile?.banks) {
        if (bank.bankName === banksTypes.ICICI) {
          hasICICIAccess = true;
        }
      }
      if (!hasICICIAccess) {
        delete sideNavItems.challan;
      }
    }

    //Check if Merchant has E-KYC Access
    if (!merchantProfile?.enableKYC) {
      delete sideNavItems.usersKYC;
    }

    //Check if Merchant has Escrow-QR Access
    if (!merchantProfile?.escrowQrEnabled) {
      delete sideNavItems.escrowQR;
      delete sideNavItems.VPAs;
    }
    if (
      !merchantProfile?.enablePayeeValidation &&
      sideNavItems['payee'].submenu
    ) {
      _.remove(sideNavItems['payee'].submenu, function(pay) {
        return [PayeesSubMenuList.PayeeValidation].includes(pay.text);
      });
    }

    if (
      merchantProfile?.enablePayeeValidation &&
      sideNavItems['payee'].submenu
    ) {
      _.remove(sideNavItems['payee'].submenu, function(pay) {
        return [PayeesSubMenuList.AddPayee].includes(pay.text);
      });
    }

    // if (
    //   !merchantProfile?.upiPayoutEnabled &&
    //   sideNavItems['transfer']?.submenu
    // ) {
    //   _.remove(sideNavItems['transfer'].submenu, function(transfer) {
    //     return [TransferSubMenuList.UPITransfer].includes(transfer.text);
    //   });
    // }

    // if (
    //   !merchantProfile?.upiPayoutEnabled &&
    //   sideNavItems['connectedBankingTransfer']?.submenu
    // ) {
    //   _.remove(sideNavItems['connectedBankingTransfer'].submenu, function(
    //     transfer
    //   ) {
    //     return [TransferSubMenuList.UPITransfer].includes(transfer.text);
    //   });
    // }

    if (
      merchantProfile?.connectedBanking &&
      !merchantProfile?.isAccountAddAllowed
    ) {
      delete sideNavItems.accounts;
      delete sideNavItems.passbook;
      delete sideNavItems.escrowPage;
      delete sideNavItems.transfer;
    } else if (
      merchantProfile?.isAccountAddAllowed &&
      !merchantProfile?.connectedBanking
    ) {
      delete sideNavItems.bankAccountTransfer;
      delete sideNavItems.depositList;
      delete sideNavItems.connectedBankingTransfer;
      delete sideNavItems.bankAccounts;
    }

    if(!merchantProfile?.reportSectionEnabled){
      delete sideNavItems.reports
    }

    // if (!merchantProfile?.connectedBanking && merchantProfile?.isAccountAddAllowed) {
    //   delete sideNavItems.bankAccount;
    // }

    if (userRole.indexOf(merchantUserRoles.CUSTOM.toLowerCase()) > -1) {
      let access = this.authService.getAccess() as RoleAccessPoint;
      /**
       * Remove Unnecessary items for
       * Normal Menu Items
       */
      _.map(sideNavItems, (val, key) => {
        //Changing condition to OR to support Authorizer additional role with Custom
        if (val.roles.some(r => userRole.indexOf(r) >= 0) || key in access) {
          const newSubMenus: SideNavItem[] = [];
          if (key != 'escrowQR') {
            _.forEach(val.submenu, submenu => {
              if (
                submenu.roles.some(r => userRole.indexOf(r) >= 0) ||
                (typeof access[key as keyof RoleAccessPoint] !== 'undefined' &&
                  access[key as keyof RoleAccessPoint].includes(submenu.text))
              ) {
                newSubMenus.push(submenu);
              } else if (
                submenu.roles.some(r => userRole.indexOf(r) >= 0) ||
                (typeof access[key as keyof RoleAccessPoint] !== 'undefined' &&
                  access[key as keyof RoleAccessPoint].includes('Add Account'))
              ) {
                newSubMenus.push(submenu);
              }
            });
          }
          val.submenu = newSubMenus;
          this.sideNavItems[key] = val;
        }
      });

      if (
        !merchantProfile?.enablePayeeValidation &&
        sideNavItems['payee'].submenu
      ) {
        _.remove(sideNavItems['payee'].submenu, function(pay) {
          return [PayeesSubMenuList.PayeeValidation].includes(pay.text);
        });
      }

      if (
        merchantProfile?.enablePayeeValidation &&
        sideNavItems['payee'].submenu
      ) {
        _.remove(sideNavItems['payee'].submenu, function(pay) {
          return [PayeesSubMenuList.AddPayee].includes(pay.text);
        });
      }

      _.forEach(sideNavSections, navSection => {
        const newSection: SideNavSection = { items: [], text: navSection.text };
        _.forEach(navSection.items, sectionText => {
          if (_.includes(Object.keys(this.sideNavItems), sectionText)) {
            newSection.items.push(sectionText);
          }
        });
        this.sideNavSections.push(newSection);
      });
    } else {
      /**
       * Remove Unnecessary items for
       * Normal Menu Items
       */
      _.map(sideNavItems, (val, key) => {
        if (val.roles.some(r => userRole.indexOf(r) >= 0)) {
          const newSubMenus: SideNavItem[] = [];
          _.forEach(val.submenu, submenu => {
            if (submenu.roles.some(r => userRole.indexOf(r) >= 0)) {
              newSubMenus.push(submenu);
            }
          });
          val.submenu = newSubMenus;
          this.sideNavItems[key] = val;
        }
      });

      _.forEach(sideNavSections, navSection => {
        const newSection: SideNavSection = { items: [], text: navSection.text };
        _.forEach(navSection.items, sectionText => {
          if (_.includes(Object.keys(this.sideNavItems), sectionText)) {
            newSection.items.push(sectionText);
          }
        });
        this.sideNavSections.push(newSection);
      });
    }
    /**
     * Remove Unnecessary items for
     * Admin Menu Items
     */
    // _.filter(this.sideNavItemsAdmin, { roles: [this.authService.getRole()] });
    // // _.filter(this.sideNavSectionsAdmin, {
    // //   roles: [this.authService.getRole()]
    // // });
    // this.sideNavSectionsAdmin = sideNavSectionsAdmin;
    // _.map(sideNavItemsAdmin, (val, key) => {
    //   if (this.authService.isSuperAdmin()) {
    //     const newSubMenus: SideNavItem[] = [];
    //     _.forEach(val.submenu, submenu => {
    //       if (this.authService.isSuperAdmin()) {
    //         newSubMenus.push(submenu);
    //       }
    //     });
    //     val.submenu = newSubMenus;
    //     this.sideNavItemsAdmin[key] = val;
    //   }
    // });

    // _.forEach(sideNavSectionsAdmin, navSection => {
    //   const newSection: SideNavSection = { items: [], text: navSection.text };
    //   _.forEach(navSection.items, sectionText => {
    //     if (_.includes(Object.keys(this.sideNavItemsAdmin), sectionText)) {
    //       newSection.items.push(sectionText);
    //     }
    //   });
    //   this.sideNavSectionsAdmin.push(newSection);
    // });
  }

  ngOnInit() {
    const tAndC = this.authService.getTAndC();

    if (_.isNull(tAndC) || tAndC?.status === TAndCStatusEnum.DECLINED) {
      //TODO: Add conditional rendering here.
      this.modalRef = this.modalService.open(this.rejectMessage, {
        backdrop: 'static',
        size: 'lg'
      });
    }

    if (this.authService.isSuperAdmin()) {
      // Enable the user option conditionally
      if (environment.canAdminViewUserOptions) {
        this.addMenuItemByRoles();
      }

      let userRole = this.authService.getRole();
      let email = this.authService.getEmail();

      if (
        !environment.adminEmail
          .split(',')
          .map(email => email.trim())
          .includes(email as string)
      ) {
        delete sideNavItemsAdmin.transfer;
      }
      _.map(sideNavItemsAdmin, (val, key) => {
        if (val.roles.some(r => userRole.indexOf(r) >= 0)) {
          const newSubMenus: SideNavItem[] = [];
          _.forEach(val.submenu, submenu => {
            if (submenu.roles.some(r => userRole.indexOf(r) >= 0)) {
              newSubMenus.push(submenu);
            }
          });
          val.submenu = newSubMenus;
          this.sideNavItems[key] = val;
        }
      });

      _.forEach(sideNavSectionsAdmin, navSection => {
        const newSection: SideNavSection = { items: [], text: navSection.text };
        _.forEach(navSection.items, sectionText => {
          if (_.includes(Object.keys(this.sideNavItems), sectionText)) {
            newSection.items.push(sectionText);
          }
        });
        this.sideNavSections.push(newSection);
      });
    } else {
      this.addMenuItemByRoles();
    }

    if (this.light) {
      this.sidenavStyle = 'sidenav-light';
    }
    this.subscription.add(
      this.navigationService.sideNavVisible$().subscribe(isVisible => {
        this.sideNavHidden = !isVisible;
        this.changeDetectorRef.markForCheck();
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  closeModal() {
    this.modalRef?.close();
  }

  acceptTAndC() {
    try {
      this.authService.acceptTAndC().subscribe(resp => {
        if (resp.success) {
          this.closeModal();
          window.location.reload();
        }
      });
    } catch (err) {
      console.log(err);
    }
  }

  declineTAndC() {
    this.authService.logOut().subscribe(resp => {
      if (resp.success) {
        this.closeModal();
        return this.router.navigateByUrl('/auth');
      }
      console.log('Error Occurred Logged out');
    });
  }

  closeSideNavIfOpen() {
    const BOOTSTRAP_LG_WIDTH = 992;
    if (this.utilityService.window.innerWidth >= 992) {
      return;
    }
    // After the lg breakpoint, hidden is actually visible.
    // So the toggleSideNav below only will fire if the screen is < 992px
    // and the sideNav is open.
    if (this.sideNavHidden) {
      this.navigationService.toggleSideNav(true);
    }
  }
}
