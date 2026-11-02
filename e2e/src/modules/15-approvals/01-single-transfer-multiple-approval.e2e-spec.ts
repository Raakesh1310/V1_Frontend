import { expect } from 'chai';
import {
  browser,
  by,
  element,
  ExpectedConditions as ec
} from 'protractor';
import { environment } from '../../../environmentTest';

describe('Single Transfer, Multiple Approvals', () => {


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

  it('create transfer', async () => {
    for (let i = 0; i < 4; i++) {
      await element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[3]/a')).click(); // top-level
      //await element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[5]/nav/sbpro-side-nav-item[1]/a')).click();


      let dropDown = element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[3]/nav/sbpro-side-nav-item[1]/a'));
      await dropDown.click(); // click on single transfer

      // selecting account....
      let accountDrop = element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transfer-overview/div/div/div/sbpro-card/div/div[2]/sbpro-transfer-new-request/form/div[1]/ng-select/div/div/div[2]/input'));
      accountDrop.sendKeys('Aniket Jaiswal');
      element.all(by.className('ng-option')).each(
        function(ele, index) {
          ele?.getText().then(value => {
            let accountNumber = value.substring(value.indexOf('PPAY'), value.length);
            if (accountNumber === 'PPAY9073356206') {
              ele?.click();
            }
          });
        });

      browser.sleep(500);
      // selecting payee....
      let payeeDrop = element(by.xpath('//*[@id="payee"]/div/div/div[2]/input'));
      payeeDrop.sendKeys('Stan Lee');
      element.all(by.className('ng-option')).each(
        function(ele, index) {
          ele?.getText().then(value => {
            if (value.startsWith('Stan Lee')) {
              ele?.click();
            }
          });
        });


      // selecting amount....
      let amount = element(by.xpath('//*[@id="amountcontrol"]'));
      await amount.sendKeys('100');


      // selecting T&C...
      element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transfer-overview/div/div/div/sbpro-card/div/div[2]/sbpro-transfer-new-request/form/div[8]/div[1]/input')).click();


      // selecting transfer button...
      let transfer = element(by.xpath('//*[@id="input"]'));
      transfer.click();

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

  it('login as merchant authorizer', async () => {
    browser.get(`${environment.baseRoute}/auth/login`);
    let emailAddressInput = element(by.id('inputEmailAddress'));
    let passwordInput = element(by.id('inputPassword'));
    let submitBtn = element(by.id('input'));
    let otp = element(by.id('inputOTP'));

    await browser.sleep(2000);
    await emailAddressInput.sendKeys(environment.authLoginId);
    await passwordInput.sendKeys(environment.authLoginPassword);
    await submitBtn.click();
    await otp.sendKeys('0000');
    await submitBtn.click();
    await browser.wait(ec.urlContains('approvals'));
    expect(await browser.getCurrentUrl()).to.equal(
      `${environment.baseRoute}/portal/approvals`
    );
  });


  it('Approved by Merchant Authorizer Only', async () => {
    await(element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-approval-overview/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-single-transfer-approval/div/div[1]/table/tbody/tr/td[7]/input'))).click();
    let statusSelectionTag = element(by.xpath('//*[@id="statusList"]'));
    statusSelectionTag.click();
    let status = element(by.xpath('//*[@id="statusList"]/option[2]'));
    status.click();
    let approve = element(by.xpath('/html/body/ngb-modal-window/div/div/div/div[3]/button[2]'));
    approve.click();

    expect(await browser.getCurrentUrl()).to.equal(
      `${environment.baseRoute}/portal/approvals`
    );
    //await browser.sleep(2000);
  });

  it('login as account authorizer', async () => {
    browser.get(`${environment.baseRoute}/auth/login`);
    let emailAddressInput = element(by.id('inputEmailAddress'));
    let passwordInput = element(by.id('inputPassword'));
    let submitBtn = element(by.id('input'));
    let otp = element(by.id('inputOTP'));

    await browser.sleep(2000);
    await emailAddressInput.sendKeys(environment.accountAuthId);
    await passwordInput.sendKeys(environment.accountAuthPass);
    await submitBtn.click();
    await otp.sendKeys('0000');
    await submitBtn.click();
    await browser.wait(ec.urlContains('approvals'));
    expect(await browser.getCurrentUrl()).to.equal(
      `${environment.baseRoute}/portal/approvals`
    );
  });

  it('Approved by Account Authorizer Only', async () => {
    await(element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-approval-overview/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-single-transfer-approval/div/div[1]/table/tbody/tr/td[7]/input'))).click();
    let statusSelectionTag = element(by.xpath('//*[@id="statusList"]'));
    statusSelectionTag.click();
    let status = element(by.xpath('//*[@id="statusList"]/option[2]'));
    status.click();
    let approve = element(by.xpath('/html/body/ngb-modal-window/div/div/div/div[3]/button[2]'));
    approve.click();
    expect(await browser.getCurrentUrl()).to.equal(
      `${environment.baseRoute}/portal/approvals`
    );
   // await browser.sleep(2000);
  });


  it('Approved by Merchant Authoriser, Rejected by Account Authoriser', async () => {

    // login as merchant authorizer....
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


    // Merchant approve transfer.....
    await(element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-approval-overview/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-single-transfer-approval/div/div[1]/table/tbody/tr/td[7]/input'))).click();
    let statusSelectionTag = element(by.xpath('//*[@id="statusList"]'));
    statusSelectionTag.click();
    let status = element(by.xpath('//*[@id="statusList"]/option[2]'));
    status.click();
    let approve = element(by.xpath('/html/body/ngb-modal-window/div/div/div/div[3]/button[2]'));
    approve.click();



    // login  as Account Authorizer....
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
    await submitBtn.click();


    // Reject by account authorizer....
    await(element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-approval-overview/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-single-transfer-approval/div/div[1]/table/tbody/tr/td[7]/input'))).click();
    let statusSelectionTag1 = element(by.xpath('//*[@id="statusList"]'));
    statusSelectionTag1.click();
    let status1 = element(by.xpath('//*[@id="statusList"]/option[4]'));
    status1.click();
    let rejectReason = element(by.xpath('//*[@id="rejection"]'));
    rejectReason.sendKeys('abc');
    let reject1 = element(by.xpath('/html/body/ngb-modal-window/div/div/div/div[3]/button[2]'));
    reject1.click();

    // result check...
    expect(await browser.getCurrentUrl()).to.equal(
      `${environment.baseRoute}/portal/approvals`
    );

  });


  it('Approved by Merchant Authoriser, Approve by Account Authoriser, Reject By Admin', async () => {

    // login as merchant authorizer....
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


    // Merchant approve transfer.....
    await(element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-approval-overview/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-single-transfer-approval/div/div[1]/table/tbody/tr/td[7]/input'))).click();
    let statusSelectionTag = element(by.xpath('//*[@id="statusList"]'));
    statusSelectionTag.click();
    let status = element(by.xpath('//*[@id="statusList"]/option[2]'));
    status.click();
    let approve = element(by.xpath('/html/body/ngb-modal-window/div/div/div/div[3]/button[2]'));
    approve.click();



    // login  as Account Authorizer....
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
    await(element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-approval-overview/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-single-transfer-approval/div/div[1]/table/tbody/tr/td[7]/input'))).click();
    let statusSelectionTag1 = element(by.xpath('//*[@id="statusList"]'));
    statusSelectionTag1.click();
    let status1 = element(by.xpath('//*[@id="statusList"]/option[2]'));
    status1.click();
    let approve1 = element(by.xpath('/html/body/ngb-modal-window/div/div/div/div[3]/button[2]'));
    approve1.click();


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

    // admin reject transfer...
    let moveToAdmin = await element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[2]/a'));
    moveToAdmin.click();
    await(element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-approval-overview/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-single-transfer-approval/div/div[1]/table/tbody/tr/td[8]/input'))).click();
    let statusSelectionTag2 = element(by.xpath('//*[@id="statusList"]'));
    statusSelectionTag2.click();
    let status2 = element(by.xpath('//*[@id="statusList"]/option[4]'));
    status2.click();
    let rejectReason = element(by.xpath('//*[@id="rejection"]'));
    rejectReason.sendKeys('abc');
    let reject1 = element(by.xpath('/html/body/ngb-modal-window/div/div/div/div[3]/button[2]'));
    reject1.click();



    // result check...
    expect(await browser.getCurrentUrl()).to.equal(
      `${environment.baseRoute}/super-admin/approvals`
    );

  });


  it('Approved by Merchant Authoriser, Approve by Account Authoriser, Approved By Admin', async () => {

    // login as merchant authorizer....
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


    // Merchant approve transfer.....
    await(element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-approval-overview/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-single-transfer-approval/div/div[1]/table/tbody/tr/td[7]/input'))).click();
    let statusSelectionTag = element(by.xpath('//*[@id="statusList"]'));
    statusSelectionTag.click();
    let status = element(by.xpath('//*[@id="statusList"]/option[2]'));
    status.click();
    let approve = element(by.xpath('/html/body/ngb-modal-window/div/div/div/div[3]/button[2]'));
    approve.click();



    // login  as Account Authorizer....
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
    await(element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-approval-overview/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-single-transfer-approval/div/div[1]/table/tbody/tr/td[7]/input'))).click();
    let statusSelectionTag1 = element(by.xpath('//*[@id="statusList"]'));
    statusSelectionTag1.click();
    let status1 = element(by.xpath('//*[@id="statusList"]/option[2]'));
    status1.click();
    let approve1 = element(by.xpath('/html/body/ngb-modal-window/div/div/div/div[3]/button[2]'));
    approve1.click();


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

    // admin approve transfer...
    let moveToAdmin = await element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[2]/a'));
    moveToAdmin.click();
    await(element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-approval-overview/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-single-transfer-approval/div/div[1]/table/tbody/tr/td[8]/input'))).click();
    let statusSelectionTag2 = element(by.xpath('//*[@id="statusList"]'));
    statusSelectionTag2.click();
    let status2 = element(by.xpath('//*[@id="statusList"]/option[2]'));
    status2.click();
    //let rejectReason = element(by.xpath('//*[@id="rejection"]')).sendKeys('abc');
    //let reject1 = element(by.xpath('/html/body/ngb-modal-window/div/div/div/div[3]/button[2]')).click();



    // result check...
    expect(await browser.getCurrentUrl()).to.equal(
      `${environment.baseRoute}/super-admin/approvals`
    );

  });

});
