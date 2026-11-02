import { expect } from 'chai';
import {
  browser,
  by,
  element,
  ExpectedConditions as ec
} from 'protractor';
import { environment } from '../../../environmentTest';
import path from 'path';

describe('Bulk Transfer Approvals', () => {

  it('login', async () => {
    browser.get(`${environment.baseRoute}/auth/login`);
    let emailAddressInput = element(by.id('inputEmailAddress'));
    let passwordInput = element(by.id('inputPassword'));
    let submitBtn = element(by.id('input'));
    let otp = element(by.id('inputOTP'));

    await browser.sleep(2000);
    await emailAddressInput.sendKeys(environment.user1LoginId);
    await passwordInput.sendKeys(environment.user1LoginPassword);
    await submitBtn.click();
    await browser.sleep(1000);
    await otp.sendKeys('0000');
    await submitBtn.click();
    await browser.wait(ec.urlContains('dashboard'));
    expect(await browser.getCurrentUrl()).to.equal(
      `${environment.baseRoute}/dashboard`
    );
  });

  it('Bulk Transfer', async () => {
    for (let i = 0; i < 3; i++) {

      // create transfer click...
      await element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[3]')).click();
      await browser.sleep(1000);

      // bulk transfer click....
      let dropDown = element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[3]/nav/sbpro-side-nav-item[2]/a'));
      await dropDown.click();

      await browser.sleep(2000);
      // selecting account....
      let accountDrop = element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-bulk-transfer-overview/div/div/div/sbpro-card/div/div[2]/sbpro-bulk-transfer/div/div[1]/div[1]/ng-select/div/div/div[2]/input'));
      await accountDrop.sendKeys('Aniket Jaiswal');
      element.all(by.className('ng-option')).each(
        function(ele, index) {
          ele?.getText().then(value => {
            let accountNumber = value.substring(value.indexOf('PPAY'), value.length);
            //console.log('VALUE ', accountNumber);
            if (accountNumber === 'PPAY9073356206') {
              ele?.click();
            }
          });
        });

      // Batch name input...
      let batchNameBox = element(by.xpath('//*[@id="batchWidth"]/input'));
      await batchNameBox.sendKeys('Testing e2e');


      // File Selection....
      const uploadFile = path.resolve(`e2e/src/modules/15-approvals/Bulk_Transfer_Format_Success.xlsx`);
      let upload = element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-bulk-transfer-overview/div/div/div/sbpro-card/div/div[2]/sbpro-bulk-transfer/div/sbpro-card/div/div/input'));
      await upload.sendKeys(uploadFile);

      await browser.sleep(1000);
      let createTransfer = element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-bulk-transfer-overview/div/div/div/sbpro-card/div/div[2]/sbpro-bulk-transfer/div/div[1]/div[3]/div/button'));
      await createTransfer.click();

      let otp = element(by.xpath('/html/body/ngb-modal-window/div/div/sbpro-otp-modal/sbpro-card/div/div[2]/div/input'));
      otp.sendKeys('0000');


      let makeTransfer = element(by.xpath('/html/body/ngb-modal-window/div/div/sbpro-otp-modal/sbpro-card/div/div[3]/button'));
      makeTransfer.click();

      await browser.sleep(2000);
    }

    expect(await browser.getCurrentUrl()).to.equal(
      `${environment.baseRoute}/portal/passbook`
    );

  });

  //Login as Merchant Authorizer....
  it('login as merchant authorizer', async () => {
    browser.get(`${environment.baseRoute}/auth/login`);
    let emailAddressInput = element(by.id('inputEmailAddress'));
    let passwordInput = element(by.id('inputPassword'));
    let otp = element(by.id('inputOTP'));
    let submitBtn = element(by.id('input'));

    await browser.sleep(2000);
    await emailAddressInput.sendKeys(environment.authLoginId);
    await passwordInput.sendKeys(environment.authLoginPassword);
    await submitBtn.click();
    await browser.sleep(1000);
    await otp.sendKeys('0000');
    await submitBtn.click();
    await browser.wait(ec.urlContains('approvals'));
    expect(await browser.getCurrentUrl()).to.equal(
      `${environment.baseRoute}/portal/approvals`
    );
  });

  it('Bulk Transfer: Approved by Merchant Authoriser, Rejected by Account Authoriser', async () => {


    // login as merchant authorizer.....
    browser.get(`${environment.baseRoute}/auth/login`);
    let emailAddressInput = element(by.id('inputEmailAddress'));
    let passwordInput = element(by.id('inputPassword'));
    let otp = element(by.id('inputOTP'));
    let submitBtn = element(by.id('input'));

    await browser.sleep(2000);
    await emailAddressInput.sendKeys(environment.authLoginId);
    await passwordInput.sendKeys(environment.authLoginPassword);
    await submitBtn.click();
    await browser.sleep(1000);
    await otp.sendKeys('0000');
    await submitBtn.click();


    // approve by merchant....
    await element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[1]/a')).click();
    let bulkTransferTab = element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-approval-overview/div/sbpro-card-navigation/div/div[1]/ul/li[2]/a'));
    bulkTransferTab.click();
    await browser.sleep(1000);
    let selectedBulkTransfer = element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-approval-overview/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-bulk-transfer-approval/div/div[1]/table/tbody/tr[1]/td[6]/input'));
    selectedBulkTransfer.click();
    await browser.sleep(1000);
    let statusSelectionTag = await element(by.xpath('//*[@id="statusList"]'));
    statusSelectionTag.click();
    let status = element(by.xpath('//*[@id="statusList"]/option[2]'));
    status.click();
    let approve = element(by.xpath('/html/body/ngb-modal-window/div/div/div/div[3]/button[2]'));
    approve.click();


    // login as account authorizer....
    browser.get(`${environment.baseRoute}/auth/login`);
    let emailAddressInput1 = element(by.id('inputEmailAddress'));
    let passwordInput1 = element(by.id('inputPassword'));
    let submitBtn1 = element(by.id('input'));
    let otp1 = element(by.id('inputOTP'));
    await browser.sleep(2000);
    await emailAddressInput1.sendKeys(environment.accountAuthId);
    await passwordInput1.sendKeys(environment.accountAuthPass);
    await submitBtn1.click();
    await browser.sleep(1000);
    await otp1.sendKeys('0000');
    await submitBtn1.click();


    // Reject by account authorizer....
    await element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[1]/a')).click();
    let bulkTransferTab1 = element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-approval-overview/div/sbpro-card-navigation/div/div[1]/ul/li[2]/a'));
    bulkTransferTab.click();
    await browser.sleep(1000);
    let selectedBulkTransfer1 = element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-approval-overview/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-bulk-transfer-approval/div/div[1]/table/tbody/tr[1]/td[6]/input'));
    selectedBulkTransfer1.click();
    await browser.sleep(1000);
    let statusSelectionTag1 = await element(by.xpath('//*[@id="statusList"]'));
    statusSelectionTag1.click();
    let status1 = element(by.xpath('//*[@id="statusList"]/option[4]'));
    status1.click();
    let desc = element(by.xpath('//*[@id="rejection"]'));
    desc.sendKeys('abc');
    let reject = element(by.xpath('/html/body/ngb-modal-window/div/div/div/div[3]/button[2]'));
    reject.click();


    // result check...
    expect(await browser.getCurrentUrl()).to.equal(
      `${environment.baseRoute}/portal/approvals`
    );
  });


  it('Bulk Transfer: Approved by Merchant Authoriser, Approve by Account Authoriser, Reject By Admin', async () => {

    // login as merchant authorizer.....
    browser.get(`${environment.baseRoute}/auth/login`);
    let emailAddressInput = element(by.id('inputEmailAddress'));
    let passwordInput = element(by.id('inputPassword'));
    let otp = element(by.id('inputOTP'));
    let submitBtn = element(by.id('input'));

    await browser.sleep(2000);
    await emailAddressInput.sendKeys(environment.authLoginId);
    await passwordInput.sendKeys(environment.authLoginPassword);
    await submitBtn.click();
    await browser.sleep(1000);
    await otp.sendKeys('0000');
    await submitBtn.click();


    // approve by merchant....
    await element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[1]/a')).click();
    let bulkTransferTab = element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-approval-overview/div/sbpro-card-navigation/div/div[1]/ul/li[2]/a'));
    bulkTransferTab.click();
    await browser.sleep(1000);
    let selectedBulkTransfer = element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-approval-overview/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-bulk-transfer-approval/div/div[1]/table/tbody/tr[1]/td[6]/input'));
    selectedBulkTransfer.click();
    await browser.sleep(1000);
    let statusSelectionTag = await element(by.xpath('//*[@id="statusList"]'));
    statusSelectionTag.click();
    let status = element(by.xpath('//*[@id="statusList"]/option[2]'));
    status.click();
    let approve = element(by.xpath('/html/body/ngb-modal-window/div/div/div/div[3]/button[2]'));
    approve.click();


    // login as account authorizer....
    browser.get(`${environment.baseRoute}/auth/login`);
    let emailAddressInput1 = element(by.id('inputEmailAddress'));
    let passwordInput1 = element(by.id('inputPassword'));
    let submitBtn1 = element(by.id('input'));
    let otp1 = element(by.id('inputOTP'));
    await browser.sleep(2000);
    await emailAddressInput1.sendKeys(environment.accountAuthId);
    await passwordInput1.sendKeys(environment.accountAuthPass);
    await submitBtn1.click();
    await browser.sleep(1000);
    await otp1.sendKeys('0000');
    await submitBtn1.click();


    // Approve by account authorizer....
    await element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[1]/a')).click();
    let bulkTransferTab1 = element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-approval-overview/div/sbpro-card-navigation/div/div[1]/ul/li[2]/a'));
    bulkTransferTab1.click();
    await browser.sleep(1000);
    let selectedBulkTransfer1 = element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-approval-overview/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-bulk-transfer-approval/div/div[1]/table/tbody/tr[1]/td[6]/input'));
    selectedBulkTransfer1.click();
    await browser.sleep(1000);
    let statusSelectionTag1 = await element(by.xpath('//*[@id="statusList"]'));
    statusSelectionTag1.click();
    let status1 = element(by.xpath('//*[@id="statusList"]/option[2]'));
    status1.click();
    let accountApprove = element(by.xpath('/html/body/ngb-modal-window/div/div/div/div[3]/button[2]'));
    accountApprove.click();


    // login as admin....
    browser.get(`${environment.baseRoute}/auth/login`);
    let emailAddressInputAdmin = element(by.id('inputEmailAddress'));
    let passwordInputAdmin = element(by.id('inputPassword'));
    let submitBtnAdmin = element(by.id('input'));
    let otpAdmin = element(by.id('inputOTP'));
    await browser.sleep(2000);
    await emailAddressInputAdmin.sendKeys(environment.adminLoginIdApproval);
    await passwordInputAdmin.sendKeys(environment.adminLoginPassApproval);
    await submitBtnAdmin.click();
    await browser.sleep(1000);
    await otpAdmin.sendKeys('0000');
    await submitBtnAdmin.click();


    // Reject by Admin....
    await element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[2]/a')).click();
    let bulkTransferTabAdmin = element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-approval-overview/div/sbpro-card-navigation/div/div[1]/ul/li[2]'));
    bulkTransferTabAdmin.click();
    await browser.sleep(2000);
    let selectedBulkTransferAdmin = element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-approval-overview/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-bulk-transfer-approval/div/div[1]/table/tbody/tr[1]/td[7]/input'));
    selectedBulkTransferAdmin.click();
    await browser.sleep(1000);
    let statusSelectionTagAdmin = await element(by.xpath('//*[@id="statusList"]'));
    statusSelectionTagAdmin.click();
    let statusAdmin = element(by.xpath('//*[@id="statusList"]/option[4]'));
    statusAdmin.click();
    let desc = element(by.xpath('//*[@id="rejection"]'));
    desc.sendKeys('abc');
    let reject = element(by.xpath('/html/body/ngb-modal-window/div/div/div/div[3]/button[2]'));
    reject.click();

    // result check...
    expect(await browser.getCurrentUrl()).to.equal(
      `${environment.baseRoute}/super-admin/approvals`
    );


  });


  it('Bulk Transfer: Approved by Merchant Authoriser, Approve by Account Authoriser, Approve By Admin', async () => {

      // login as merchant authorizer.....
    browser.get(`${environment.baseRoute}/auth/login`);
    let emailAddressInput = element(by.id('inputEmailAddress'));
    let passwordInput = element(by.id('inputPassword'));
    let otp = element(by.id('inputOTP'));
    let submitBtn = element(by.id('input'));

    await browser.sleep(2000);
    await emailAddressInput.sendKeys(environment.authLoginId);
    await passwordInput.sendKeys(environment.authLoginPassword);
    await submitBtn.click();
    await browser.sleep(1000);
    await otp.sendKeys('0000');
    await submitBtn.click();


    // approve by merchant....
    await element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[1]/a')).click();
    let bulkTransferTab = element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-approval-overview/div/sbpro-card-navigation/div/div[1]/ul/li[2]/a'));
    bulkTransferTab.click();
    await browser.sleep(1000);
    let selectedBulkTransfer = element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-approval-overview/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-bulk-transfer-approval/div/div[1]/table/tbody/tr[1]/td[6]/input'));
    selectedBulkTransfer.click();
    await browser.sleep(1000);
    let statusSelectionTag = await element(by.xpath('//*[@id="statusList"]'));
    statusSelectionTag.click();
    let status = element(by.xpath('//*[@id="statusList"]/option[2]'));
    status.click();
    let approve = element(by.xpath('/html/body/ngb-modal-window/div/div/div/div[3]/button[2]'));
    approve.click();


    // login as account authorizer....
    browser.get(`${environment.baseRoute}/auth/login`);
    let emailAddressInput1 = element(by.id('inputEmailAddress'));
    let passwordInput1 = element(by.id('inputPassword'));
    let submitBtn1 = element(by.id('input'));
    let otp1 = element(by.id('inputOTP'));
    await browser.sleep(2000);
    await emailAddressInput1.sendKeys(environment.accountAuthId);
    await passwordInput1.sendKeys(environment.accountAuthPass);
    await submitBtn1.click();
    await browser.sleep(1000);
    await otp1.sendKeys('0000');
    await submitBtn1.click();


    // Approve by account authorizer....
    await element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[1]/a')).click();
    let bulkTransferTab1 = element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-approval-overview/div/sbpro-card-navigation/div/div[1]/ul/li[2]/a'));
    bulkTransferTab1.click();
    await browser.sleep(1000);
    let selectedBulkTransfer1 = element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-approval-overview/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-bulk-transfer-approval/div/div[1]/table/tbody/tr[1]/td[6]/input'));
    selectedBulkTransfer1.click();
    await browser.sleep(1000);
    let statusSelectionTag1 = await element(by.xpath('//*[@id="statusList"]'));
    statusSelectionTag1.click();
    let status1 = element(by.xpath('//*[@id="statusList"]/option[2]'));
    status1.click();
    let accountApprove = element(by.xpath('/html/body/ngb-modal-window/div/div/div/div[3]/button[2]'));
    accountApprove.click();


    // login as admin....
    browser.get(`${environment.baseRoute}/auth/login`);
    let emailAddressInputAdmin = element(by.id('inputEmailAddress'));
    let passwordInputAdmin = element(by.id('inputPassword'));
    let submitBtnAdmin = element(by.id('input'));
    let otpAdmin = element(by.id('inputOTP'));
    await browser.sleep(2000);
    await emailAddressInputAdmin.sendKeys(environment.adminLoginIdApproval);
    await passwordInputAdmin.sendKeys(environment.adminLoginPassApproval);
    await submitBtnAdmin.click();
    await browser.sleep(1000);
    await otpAdmin.sendKeys('0000');
    await submitBtnAdmin.click();


    // Reject by Admin....
    await element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[2]/a')).click();
    let bulkTransferTabAdmin = element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-approval-overview/div/sbpro-card-navigation/div/div[1]/ul/li[2]'));
    bulkTransferTabAdmin.click();
    await browser.sleep(2000);
    let selectedBulkTransferAdmin = element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-approval-overview/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-bulk-transfer-approval/div/div[1]/table/tbody/tr[1]/td[7]/input'));
    selectedBulkTransferAdmin.click();
    await browser.sleep(1000);
    let statusSelectionTagAdmin = await element(by.xpath('//*[@id="statusList"]'));
    statusSelectionTagAdmin.click();
    let statusAdmin = element(by.xpath('//*[@id="statusList"]/option[2]'));
    statusAdmin.click();
    let approveAdmin = element(by.xpath('/html/body/ngb-modal-window/div/div/div/div[3]/button[2]'));
    approveAdmin.click();
    //let desc = element(by.xpath('//*[@id="rejection"]')).sendKeys('abc');
    //let reject = element(by.xpath('/html/body/ngb-modal-window/div/div/div/div[3]/button[2]')).click();

    // result check...
    expect(await browser.getCurrentUrl()).to.equal(
      `${environment.baseRoute}/super-admin/approvals`
    );

  });



  it('Bulk Transfer: Reject Some transfers, Approved by Merchant Authoriser', async () => {

    // login as merchant authorizer.....
    browser.get(`${environment.baseRoute}/auth/login`);
    let emailAddressInput = element(by.id('inputEmailAddress'));
    let passwordInput = element(by.id('inputPassword'));
    let otp = element(by.id('inputOTP'));
    let submitBtn = element(by.id('input'));

    await browser.sleep(2000);
    await emailAddressInput.sendKeys(environment.authLoginId);
    await passwordInput.sendKeys(environment.authLoginPassword);
    await submitBtn.click();
    await browser.sleep(1000);
    await otp.sendKeys('0000');
    await submitBtn.click();


    // approve by merchant....
    await element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[1]/a')).click();
    let bulkTransferTab = element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-approval-overview/div/sbpro-card-navigation/div/div[1]/ul/li[2]/a'));
    bulkTransferTab.click();
    await browser.sleep(1000);
    let selectedBulkTransfer = element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-approval-overview/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-bulk-transfer-approval/div/div[1]/table/tbody/tr[1]/td[6]/input'));
    selectedBulkTransfer.click();
    await browser.sleep(1000);
    let statusSelectionTag = await element(by.xpath('//*[@id="statusList"]'));
    statusSelectionTag.click();
    let status = element(by.xpath('//*[@id="statusList"]/option[2]'));
    status.click();
    let approve = element(by.xpath('/html/body/ngb-modal-window/div/div/div/div[3]/button[2]'));
    approve.click();

    // login as account authorizer....
    browser.get(`${environment.baseRoute}/auth/login`);
    let emailAddressInput1 = element(by.id('inputEmailAddress'));
    let passwordInput1 = element(by.id('inputPassword'));
    let submitBtn1 = element(by.id('input'));
    let otp1 = element(by.id('inputOTP'));
    await browser.sleep(2000);
    await emailAddressInput1.sendKeys(environment.accountAuthId);
    await passwordInput1.sendKeys(environment.accountAuthPass);
    await submitBtn1.click();
    await browser.sleep(1000);
    await otp1.sendKeys('0000');
    await submitBtn1.click();


    // Reject some by account authorizer....
    await element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[1]/a')).click();
    let bulkTransferTab1 = element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-approval-overview/div/sbpro-card-navigation/div/div[1]/ul/li[2]/a'));
    bulkTransferTab1.click();
    await browser.sleep(2000);
    let table = element(by.css('tbody'));
    await table.all(by.css('tr')).then(async rows =>{
      rows[0].all(by.css('td')).then(async (data:any) =>{
        await data[0].click();
        });
      });
    // let selectedBulkTransfer1 = element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-approval-overview/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-bulk-transfer-approval/div/div[1]/table/tbody/tr[1]/td[1]/ngb-highlight'));
    // selectedBulkTransfer1.click();
    await browser.sleep(2000);
    await table.all(by.css('tr')).then(async rows =>{
      rows[0].all(by.css('td')).then(async (data:any) =>{
        await data[5].click();
        });
      rows[1].all(by.css('td')).then(async (data:any) =>{
        await data[5].click();
        });
      });
    // let firstTransferReject = element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-bulk-approval-detail-overview/div/div/div/sbpro-bulk-approval-detail/sbpro-card/div/div[2]/div[1]/table/tbody/tr[1]/td[6]/input'));
    // firstTransferReject.click();
    //
    // let secondTransferReject = element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-bulk-approval-detail-overview/div/div/div/sbpro-bulk-approval-detail/sbpro-card/div/div[2]/div[1]/table/tbody/tr[2]/td[6]/input'));
    // secondTransferReject.click();
    await browser.sleep(5000);
    let rejectButton = element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-bulk-approval-detail-overview/div/div/div/sbpro-bulk-approval-detail/sbpro-card/div/div[2]/form/div/button[3]'));
    await rejectButton.click();
    await browser.sleep(2000);
    let rejectionMessage = await element(by.xpath('//*[@id="rejection"]'));
    rejectionMessage.sendKeys('abc');
    let rejectTransfer = await element(by.xpath('/html/body/ngb-modal-window/div/div/div/div[3]/button[2]'));
    rejectTransfer.click();

  });
});
