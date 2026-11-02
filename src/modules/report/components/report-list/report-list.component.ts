import { ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastMessageData, ToastMessageOptions } from '@common/models';
import { ToastService, UtilityService } from '@common/services';
import accountsStatus from '@modules/accounts/constants/accountsStatus';
import banksTypes from '@modules/accounts/constants/banksTypes';
import { AccountsService } from '@modules/accounts/services';
import { MerchantProfile } from '@modules/auth/models/merchantProfile.model';
import { AuthService } from '@modules/auth/services';
import accountTypes from '@modules/report/constants/accountTypes';
import reportConstants from '@modules/report/constants/reportConstants';
import { ReportService } from '@modules/report/services';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import transferStatus from '../../../../config/transferStatus';
import { AccountsResponseModel } from '@modules/accounts/models/accounts-response.model';
import { BankAccount } from '@modules/bank-account/models';
import { Account } from '@modules/accounts/models';
import payeeStatus from '@modules/payee/constants/payeeStatus';
import { Merchant } from '@modules/auth/models/merchant.model';
import { ProfileService } from '@modules/profile/services';
import { banks } from '@modules/report/constants/banks';

@Component({
    selector: 'sbpro-report-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './report-list.component.pug',
    styleUrls: ['report-list.component.scss'],
})
export class ReportListComponent implements OnInit {
    reportForm!: FormGroup;
    selectedReport: string = '';
    escrowAccounts!: Account[] | any;
    merchantId!: string;
    bankAccounts!: BankAccount[] | any;
    selectedAccount!: Account | undefined;
    selectedBankAccount!: BankAccount | undefined;
    formErrors: string[] = [];
    @ViewChild('deposit') deposit!: TemplateRef<any>;
    @ViewChild('accounts') accounts!: TemplateRef<any>;
    @ViewChild('payee') payee!: TemplateRef<any>;
    profile!: MerchantProfile;
    isAdmin = false;
    connBankingWithDigiEscrow: boolean = false;
    banks: string[] = [];
    connectedBanking: boolean = false;
    selectedTypeOfAccount: string = accountTypes.escrowAccounts;
    selectedBank!: string;
    startDate!: NgbDateStruct;
    endDate!: NgbDateStruct;
    private allConstantForEscrow = { name: reportConstants.ALL, accountId: reportConstants.ESCROW_ACCOUNTS };
    private allConstantForCB = { accountName: 'All', bankAccountNo: reportConstants.BANK_ACCOUNTS };
    private allConstantForAllMerchants = { title: 'All', merchantId: '*', email: 'Select All Merchants' };
    reportTable$!: Observable<any[]>;
    totalItems$!: Observable<Number>;
    loading$!: Observable<boolean>;
    page: number = 1;
    TRANSFER_STATUS = transferStatus;
    ACCOUNT_STATUS = accountsStatus;
    PAYEE_STATUS = payeeStatus;
    TYPE_OF_ACCOUNT = accountTypes;
    ESCROW_ACCOUNT_TYPE = reportConstants;
    typeOfEscrowAccount: string = this.ESCROW_ACCOUNT_TYPE.ALL;
    selectedStatus: string[] = [];
    merchants: Merchant[] | { title: string, merchantId: string, email: string }[] = [];
    selectedMerchant: Merchant | undefined;
    constructor(
        private formBuilder: FormBuilder,
        private modalService: NgbModal,
        private authService: AuthService,
        private cdr: ChangeDetectorRef,
        private accountService: AccountsService,
        private reportService: ReportService,
        private toastService: ToastService,
        private profileService: ProfileService,
        private utilService: UtilityService,
        private ngZone: NgZone
    ) {
        this.isAdmin = this.authService.isSuperAdmin();
        this.profile = this.authService.getMerchantProfile() as MerchantProfile;
        if (!this.isAdmin) {
            this.setProfile(this.authService.getMerchantProfile() as MerchantProfile);
        }
    }

    setProfile(profile: MerchantProfile) {
        this.profile = profile;
        if (this.profile?.connectedBanking && this.profile.isAccountAddAllowed) {
            this.connBankingWithDigiEscrow = true;
            this.connectedBanking = true;
            this.selectedTypeOfAccount = accountTypes.escrowAccounts;
        }

        if (this.profile?.connectedBanking && !this.profile.isAccountAddAllowed) {
            this.connectedBanking = true;
            this.selectedTypeOfAccount = accountTypes.bankAccounts;
        }

        if (this.profile && !this.merchantId) {
            this.merchantId = this.authService.getMerchantId() as string;
        }
        this.assignBanks();
    }

    onMerchantSelect() {
        if (this.selectedMerchant && this.selectedMerchant.merchantId !== '*') {
            this.merchantId = this.selectedMerchant.merchantId;
            this.profileService.getProfile(this.selectedMerchant.merchantId, false).subscribe((profile: any) => {
                this.setProfile(profile.result as MerchantProfile);
            });
        } else {
            this.assignBanks();
        }
    }

    ngOnInit() {
        this.getReportList();
        this.loading$ = this.reportService.loading$;
        this.reportTable$ = this.reportService.reportData$;
        this.totalItems$ = this.reportService.totalItems$;
        this.reportForm = this.formBuilder.group({
            bank: [null, [(val: FormGroup) => {
                if (this.customValidator('bank', val)) {
                    return { Error: `Bank Selection is mandatory` };
                }
            }]],
            account: [null, [(val: FormGroup) => {
                if (this.customValidator('escrow', val)) {
                    return { Error: `Escrow Selection is mandatory` };
                }
            }]],
            bankAccount: [null, [(val: FormGroup) => {
                if (this.customValidator('bankAccount', val)) {
                    return { Error: `Bank Account Selection is mandatory` };
                }
            }]],
            startDate: [Validators.required],
            endDate: [Validators.required],
            // selectedMerchant: [null, [(control: AbstractControl) => {
            //     if (this.isAdmin && !control.value) {
            //         return { Error: `Merchant Selection is mandatory for admin` };
            //     }
            // }]]
        })
        if (this.isAdmin) {
            this.getMerchants('');
        }
        this.cdr.detectChanges();
    }

    getMerchants(term: string) {
        this.accountService.getMerchants(term);

        this.accountService.merchant$.subscribe(resp => {
            this.merchants = [this.allConstantForAllMerchants, ...resp];
            this.cdr.detectChanges();
        });
    }

    getReportList() {
        this.reportService.getReport$()?.subscribe(() => this.cdr.detectChanges());
    }

    updateBank() {
        this.reportForm.controls.account.reset();
        this.reportForm.controls.bankAccount.reset();
        this.reportForm.controls.bank.setValue(this.selectedBank);
        if (this.connectedBanking && this.selectedTypeOfAccount !== accountTypes.escrowAccounts) {
            this.getBankAccounts(this.merchantId, this.selectedBank);

        } else {
            this.getEscrowAccounts();
        }
    }

    getEscrowAccounts() {
        this.escrowAccounts = [];
        this.accountService.merchantId = this.merchantId;
        this.accountService.performSearch(
            accountsStatus.ACTIVE,
            '',
            this.selectedBank !== reportConstants.ALL ? this.selectedBank.toLowerCase() : ''
        );
        this.accountService.account$.subscribe(e => {
            if (e?.length > 0) {
                if (this.selectedReport !== reportConstants.STATEMENT) {
                    this.escrowAccounts = [this.allConstantForEscrow, ...e];
                } else {
                    this.escrowAccounts = [...e];
                }
                this.cdr.detectChanges();
            }

        });
    }

    getBankAccounts(merchantId: string, bank: string = '') {
        this.bankAccounts = [];
        this.reportService
            .getBankAccounts(merchantId, bank !== reportConstants.ALL ? bank : '')
            .subscribe((resp: any) => {
                if (resp.result && resp.result?.length > 0) {
                    this.bankAccounts = resp.result;
                    if (this.selectedTypeOfAccount === accountTypes.escrowOnBankAccount) {
                        this.bankAccounts = resp.result.filter(
                            (accounts: any) => accounts?.enableConnectedBankingWithVA === true
                        );
                        this.bankAccounts = [this.allConstantForCB, ...this.bankAccounts]
                    } else if (this.selectedTypeOfAccount !== accountTypes.escrowOnBankAccount) {
                        this.bankAccounts = [this.allConstantForCB, ...this.bankAccounts]
                    }

                    console.log(this.bankAccounts);
                    this.cdr.detectChanges();
                }
            });
    }

    openModal(modal: string, size: string = 'lg') {
        let modalRef: TemplateRef<any> | null;
        if (modal === 'Accounts') {
            modalRef = this.accounts;
        } else if (modal === 'Payee') {
            modalRef = this.payee;
        } else {
            modalRef = this.deposit;
        }

        if (modalRef) {
            if (this.selectedReport === 'Statement' && this.isAdmin) {
                this.merchants = this.merchants.filter(
                    merchant => merchant !== this.allConstantForAllMerchants
                );
            } else if (this.selectedReport !== 'Statement' && this.isAdmin) {
                if (!this.merchants.includes(this.allConstantForAllMerchants as any)) {
                    this.merchants = [this.allConstantForAllMerchants, ...this.merchants];
                }
            }
            this.modalService.open(modalRef, {
                backdrop: 'static',
                size: size
            });
        }
    }

    closeModal() {
        this.clearVlaues();
        this.modalService.dismissAll();
    }



    updateSelection(selection: string = '') {
        this.banks = [];
        this.reportForm.controls.bank.reset();
        this.reportForm.controls.account.reset();
        this.reportForm.controls.bankAccount.reset();
        this.escrowAccounts = [];
        this.bankAccounts = [];
        this.selectedStatus = [];
        this.selectedTypeOfAccount = selection;
        this.assignBanks();
        this.cdr.detectChanges();
    }

    assignBanks() {
        this.banks = [];
        if (this.isAdmin && this.selectedMerchant?.merchantId === '*') {
            this.banks = [reportConstants.ALL, ...banks];
        } else {
            this.profile.banks.forEach((bank: any) => {
                let bankName =
                    bank.bankName === banksTypes.YES_BANK
                        ? bank.bankName.split('_')[0]
                        : bank.bankName;
                if (this.profile[bankName + 'Banks']?.length > 0) {
                    let account = this.profile[bankName + 'Banks'].filter(
                        (account: any) => {
                            if (this.connectedBanking && this.selectedTypeOfAccount === accountTypes.bankAccounts) {
                                return account?.enableConnectedBanking === true;
                            }
                            else if (
                                this.connectedBanking && this.selectedTypeOfAccount === accountTypes.escrowOnBankAccount
                            ) {
                                return account?.enableConnectedBanking && account?.enableConnectedBankingWithVA;
                            }
                            else {
                                return (
                                    !account?.enableConnectedBanking ||
                                    account?.enableConnectedBanking === false ||
                                    (account?.enableConnectedBanking &&
                                        account.enableConnectedBankingWithVA)
                                );
                            }
                        }
                    );
                    if (account?.length > 0) {
                        this.banks.push(bankName.toUpperCase());
                    }

                }
            });
            if (this.banks?.length > 0) {
                this.banks = [reportConstants.ALL, ...this.banks];
            }
        }
        this.ngZone.run(() => {
            this.cdr.markForCheck();
        });
    }

    generateReport() {
        console.log(this.reportForm.value);
        const selectedStartDate = this.startDate ? new Date(this.startDate.year, this.startDate.month - 1, this.startDate.day, 0, 0, 0) : null;
        const selectedEndDate = this.endDate ? new Date(this.endDate.year, this.endDate.month - 1, this.endDate.day, 23, 59, 59) : null;
        if ((selectedStartDate && selectedEndDate) && selectedStartDate > selectedEndDate) {
            this.formErrors = [];
            this.formErrors.push('Start date cannot be after end date.')
            this.cdr.detectChanges();
            return;
        }

        if (this.selectedReport === 'Statement' && this.selectedTypeOfAccount !== this.TYPE_OF_ACCOUNT.bankAccounts) {
            this.mapDigitalEscrowStatementData(selectedStartDate, selectedEndDate);
            return;
        }

        if (this.reportForm.invalid && this.selectedReport !== 'Payee') {
            this.findInvalidControls(this.reportForm);
            return;
        }

        //this is common in every report
        let reportData: any = {
            templateId: this.reportService.getTemplateId(this.selectedReport, this.selectedTypeOfAccount !== accountTypes.bankAccounts ? true : false),
            params: {
                startDate: selectedStartDate ? selectedStartDate : null,
                endDate: selectedEndDate ? selectedEndDate : null,
                ...this.isAdmin ? { merchantIds: this.merchantId ? [this.merchantId] : [] } : { merchantId: this.merchantId },
                otherparams: {}
            },
            type: this.selectedReport
        };


        //for escrows mapping
        if (this.reportForm.controls.account.value) {
            reportData = this.mapEscrowAccount(reportData);
        }

        //for hard account or bank account mapping
        if (this.reportForm.controls.bankAccount.value && this.selectedTypeOfAccount !== accountTypes.escrowOnBankAccount) {
            reportData = this.mapBankAccount(reportData);
        }

        if ((this.selectedReport !== 'Deposit' && this.selectedReport !== 'Statement') && this.selectedStatus.length <= 0) {
            this.formErrors = ['Status is Mandatory'];
            return;
        } else if (this.selectedStatus.length > 0) {
            reportData = this.mapStatus(reportData);
        }

        if (this.selectedReport === "Accounts") {
            reportData = this.mapAccountsReportData(reportData);
        }


        this.reportService.generateReport(reportData, this.isAdmin).subscribe(
            (resp: any) => {
                console.log(resp);
                if (resp?.message === 'Success') {
                    this.showToast("Success", "Report Generation in Progress", {
                        headerClasses: 'bg-success text-white'
                    });
                    console.log("Report generation in process");
                } else {
                    this.showToast("Error", "Please try again ", {
                        headerClasses: 'bg-danger text-white'
                    });
                }

            }
        )

        this.closeModal();
        this.clearVlaues();
        this.ngOnInit();

        console.log(reportData);
    }



    /**
     * Maps the values related to Digital Escrow Accounts
     * @param reportData - Request Body
     * @returns reportData
     */
    mapEscrowAccount(reportData: any) {
        const accountName = this.reportForm.controls.account.value.name;
        const accountNo = this.reportForm.controls.account.value.accountId;
        Object.assign(reportData.params.otherparams, { accountId: accountName === reportConstants.ALL ? '*' : accountNo })
        return reportData;
    }

    /**
     * Maps the values related to Connected Banking Bank Accounts
     * @param reportData - Request Body
     * @returns report data
     */
    mapBankAccount(reportData: any) {
        const accountName = this.reportForm.controls.bankAccount.value.accountName;
        const accountNo = this.reportForm.controls.bankAccount.value.bankAccountNo;
        reportData.templateId === 'template_allTransferCB'
        ? Object.assign(reportData.params.otherparams, {
            bankAccountNumber:
                accountName === reportConstants.ALL ? '*' : accountNo
            })
        : Object.assign(reportData.params.otherparams, {
            bankAccountNo: this.reportForm.controls.bankAccount.value
                .bankAccountNo
            });
        // Object.assign(reportData.params.otherparams, { bankAccountNo: accountName === reportConstants.ALL ? '*' : accountNo })
        return reportData;
    }

    /**
     * Maps the status for the respective report
     * @param reportData - Request Body
     * @returns reportData
     */
    mapStatus(reportData: any) {
        Object.assign(reportData.params.otherparams, { status: this.selectedStatus })
        return reportData;
    }

    /**
     * Maps the data for report generation of Digital Escrows
     * and Connected Banking Accounts
     * @param reportData - Request Body 
     * @returns mapped reportData
     */
    mapAccountsReportData(reportData: any) {

        if (reportData.templateId !== "template_allAccountsCB") {
            if (this.typeOfEscrowAccount !== reportConstants.ALL)
                Object.assign(reportData.params.otherparams, { isAutoTransfer: true })
        }

        if (this.reportForm.controls?.bank?.value !== reportConstants.ALL) {
            Object.assign(reportData.params.otherparams, { bank: this.reportForm.controls.bank.value.toLowerCase() })
        }

        if (this.reportForm.controls.bankAccount?.value?.bankAccountNo) {
            Object.assign(reportData.params.otherparams, { hardEscrowAccountNumber: this.reportForm.controls.bankAccount.value.bankAccountNo })
        }

        return reportData;
    }


    clearVlaues() {
        this.reportForm.reset();
        this.selectedStatus = [];
        this.selectedMerchant = undefined;
        this.selectedTypeOfAccount = this.TYPE_OF_ACCOUNT.escrowAccounts;
        // this.selectedBank String
        this.formErrors = [];
        this.selectedReport = '';
        this.escrowAccounts = [];
        this.bankAccounts = [];
        this.selectedAccount = undefined;
        this.selectedBankAccount = undefined;
        this.connBankingWithDigiEscrow = false;
        this.connectedBanking = false;
        this.cdr.detectChanges();
    }

    getEscrowOnHardAccount() {
        this.escrowAccounts = [];
        this.accountService.getAccounts(null, -1, {
            hardEscrowAccountNumber: [this.reportForm.controls.bankAccount.value.bankAccountNo]
        }).subscribe((resp: AccountsResponseModel) => {
            if (resp?.result?.length > 0) {
                this.escrowAccounts = [this.allConstantForEscrow, ...resp.result];
            }
        })
    }

    updateAccountSection(selection: string) {
        this.typeOfEscrowAccount = selection;
        this.cdr.detectChanges();
    }

    findInvalidControls(form: FormGroup) {
        const controls = form.controls;
        console.log('CONTROLS ', controls);
        for (const name in controls) {
            const control = controls[name];

            if (control.invalid) {
                if (control.hasError('required')) {
                    this.formErrors.push(`Please enter a valid ${name}`);
                } else if (control.hasError('Error')) {
                    this.formErrors.push(control.getError('Error'));
                }
            }
        }
        this.cdr.detectChanges();
    }


    toLocalTime(date: string) {
        const isoDate = new Date(date);
        const updatedDate = isoDate.toLocaleString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return updatedDate;
    }

    onDateChange(dates: { startDate: any, endDate: any }) {
        this.startDate = dates.startDate;
        this.endDate = dates.endDate;
        this.cdr.detectChanges();
    }

    onError(error: string) {
        if (error) {
            this.formErrors = [];
            this.formErrors.push(error);
            this.cdr.detectChanges();
        }
    }

    downloadReport(reportId: string, reportType: string) {
        this.reportService.downloadReport(reportId, reportType);

    }

    showToast(
        header: ToastMessageData,
        body: ToastMessageData,
        options: ToastMessageOptions = {}
    ) {
        const defaultOptions = {
            autohide: true,
            delay: 9000
        };
        this.toastService.show(header, body, { ...defaultOptions, ...options });
    }


    updateStatus(status: string, event: any) {
        if (event.target.checked) {
            // If checkbox is checked, add the version to the array
            this.selectedStatus.push(status);
        } else {
            // If checkbox is unchecked, remove the version from the array
            this.selectedStatus = this.selectedStatus.filter(s => s !== status);
        }

        this.cdr.detectChanges();
    }


    /**
     * Custom validator for different types of report,
     * It validates the fields required for a specific report
     * @param formField Form Field that needs to be validated
     * @param val value of the form field
     * @returns Boolean : Indicating the validation has passed or not
     */
    customValidator(formField: string, val: FormGroup): Boolean {

        const reportType = this.selectedReport;
        const accountSelectionType = this.selectedTypeOfAccount;

        switch (reportType) {

            case 'Payee':
                return false;

            case 'Accounts':

                switch (accountSelectionType) {


                    case accountTypes.escrowAccounts:
                        if (formField === 'bank' && (!val.value || val.value === undefined || val.value === null)) {
                            return true;
                        }
                        break;

                    case accountTypes.bankAccounts:
                        if (formField === 'bank' && (!val.value || val.value === undefined || val.value === null)) {
                            return true;
                        }
                        break;

                    case accountTypes.escrowOnBankAccount:
                        if ((formField === 'bank' || formField === 'bankAccount') && (!val.value || val.value === undefined || val.value === null)) {
                            return true;
                        }

                    default:
                        return false;
                }
                break;

            default: // For reports = Deposit , Transfer, Statement
                switch (accountSelectionType) {

                    case accountTypes.escrowAccounts:
                        if ((formField === 'bank' || formField === 'escrow') && (!val.value || val.value === undefined || val.value === null)) {
                            return true;
                        }
                        break;

                    case accountTypes.bankAccounts:
                        if ((formField === 'bank' || formField === 'bankAccount') && (!val.value || val.value === undefined || val.value === null)) {
                            return true;
                        }
                        break;

                    case accountTypes.escrowOnBankAccount:
                        if ((formField === 'bank' || formField === 'escrow' || formField === 'bankAccount') && (!val.value || val.value === undefined || val.value === null)) {
                            return true;
                        }

                    default:
                        return false;
                }

        }
        return false;
    }


    mapDigitalEscrowStatementData(startDate: Date | null, endDate: Date | null) {
        let reportData = { dateFrom: startDate, dateTo: endDate }
        Object.assign(reportData, { accountId: this.reportForm.controls.account.value.accountId || '' })
        if (this.isAdmin) Object.assign(reportData, { merchantId: this.merchantId })
        this.reportService.generateDigitalEscrowStatement(reportData).subscribe(
            (resp: any) => {
                console.log(resp);
                if (resp?.message === 'Success') {
                    this.showToast("Success", "Report Generation in Progress", {
                        headerClasses: 'bg-success text-white'
                    });
                    console.log("Report generation in process");
                } else {
                    this.showToast("Error", "Please try again ", {
                        headerClasses: 'bg-danger text-white'
                    });
                }

            }
        )

        this.closeModal();
        this.clearVlaues();
        this.ngOnInit();
    }

}
