import { expect } from 'chai';
import {
  browser,
  by,
  element,
  logging,
  ExpectedConditions as ec,
  ElementFinder
} from 'protractor';
import faker from 'faker';
import path from 'path';
import { environment } from '../../../environmentTest';
import { MailClient } from '../../helpers/mail.po';
import { newEmailData } from '../../interfaces/newEmailData.interface';

describe('Authentication: Transfer', () => {
  let mClient: MailClient;

  let account!: ElementFinder;
  let payee!: ElementFinder;
  let amount!: ElementFinder;
  let purpose!: ElementFinder;
  let form!: ElementFinder;
  let slider!: ElementFinder;
  let submitButton!: ElementFinder;
  let al!: ElementFinder;

  it('login', async () => {
    browser.get(`${environment.baseRoute}/auth/login`);
    let emailAddressInput = element(by.id('inputEmailAddress'));
    let passwordInput = element(by.id('inputPassword'));
    let submitBtn = element(by.id('input'));

    await emailAddressInput.sendKeys(environment.user1LoginId);
    await passwordInput.sendKeys(environment.user1LoginPassword);
    await submitBtn.click();
    await browser.wait(ec.urlContains('dashboard'));
    expect(await browser.getCurrentUrl()).to.equal(
      `${environment.baseRoute}/dashboard`
    );
  });

  beforeEach(async () => {
    browser.get(`${environment.baseRoute}/portal/transfer`);
    account = element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-transfer-overview/div/div/div/sbpro-card/div/div[2]/sbpro-transfer-new-request/form/div[1]/ng-select/div/div/div[2]/input'
      )
    );
    payee = element(by.xpath('//*[@id="payee"]/div/div/div[2]/input'));
    amount = element(by.xpath('//*[@id="amountcontrol"]'));
    purpose = element(by.xpath('//*[@id="purpose"]'));
    al = element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-transfer-overview/div/div/div/sbpro-card/div/div[2]/sbpro-transfer-new-request/div/sbpro-alert/div'
      )
    );
    slider = element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-transfer-overview/div/div/div/sbpro-card/div/div[2]/sbpro-transfer-new-request/form/div[5]/label[2]/span'
      )
    );
    submitButton = element(by.xpath('//*[@id="input"]/span'));
    form = element(
      by.xpath(
        '/html/body/app-root/sbpro-transfer/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-transfer-overview/div/div/div/sbpro-card/div/div[2]/sbpro-transfer-new-request/form'
      )
    );
  });

  it('Check for the form elements', async () => {
    //Wait for the elements to be visible
    await browser.wait(ec.visibilityOf(account), 5000);
    await browser.wait(ec.visibilityOf(payee), 5000);
    await browser.wait(ec.visibilityOf(amount), 5000);
    await browser.wait(ec.visibilityOf(purpose), 5000);
    await browser.wait(ec.visibilityOf(submitButton), 5000);

    expect(account.isPresent());
  });

  it('Submit empty form', async () => {
    await browser.wait(ec.visibilityOf(submitButton), 5000);
    submitButton.click();
    expect(await al.getText()).to.have.string('Please select an Account.');
  });

  it('Single Transfer', async () => {
    let accountOption: ElementFinder,
      payeeOption: ElementFinder,
      otpModal: ElementFinder,
      otpModalText: ElementFinder,
      otpSubmit: ElementFinder;
    
    //Connect Mail client if otp forwarded testing is true
    if (environment.isOtpForwarded) {
      mClient = new MailClient();
      await mClient.connectMail();
    }

    //Make sure all elements are visible
    await browser.wait(ec.visibilityOf(account), 5000);
    await browser.wait(ec.visibilityOf(payee), 5000);
    await browser.wait(ec.visibilityOf(amount), 5000);
    await browser.wait(ec.visibilityOf(purpose), 5000);
    await browser.wait(ec.visibilityOf(submitButton), 5000);

    await account.click();
    await account.sendKeys(environment.transferAccountName);
    accountOption = element.all(by.css('.ng-option')).first();
    await browser.wait(ec.visibilityOf(accountOption), 2000);
    await accountOption.click();

    await payee.click();
    await payee.sendKeys(environment.transferPayeeName);
    payeeOption = element.all(by.css('.ng-option')).first();
    await browser.wait(ec.visibilityOf(payeeOption), 2000);
    await payeeOption.click();

    await amount.sendKeys(1);
    await purpose.sendKeys('test');
    //Get Last Email Count
    const emailCount = environment.isOtpForwarded ?  await mClient.getEmailCount() : '';
    await submitButton.click();

    otpModal = element(
      by.xpath(
        '/html/body/ngb-modal-window/div/div/sbpro-otp-modal/sbpro-card/div'
      )
    );
    otpModalText = element(
      by.xpath(
        '/html/body/ngb-modal-window/div/div/sbpro-otp-modal/sbpro-card/div/div[2]/div/input'
      )
    );
    otpSubmit = element(
      by.xpath(
        '/html/body/ngb-modal-window/div/div/sbpro-otp-modal/sbpro-card/div/div[3]/button'
      )
    );

    //Check if OTP Modal is loading
    if (environment.isOtpForwarded){
      //Wait for some time for OTP and mail to deliver
      browser.sleep(30000);
      await browser.wait(ec.visibilityOf(otpModal), 2000);

      await mClient.connectMail();
      const newEmailCount = await mClient.getEmailCount();
      const newEmail = (emailCount !== newEmailCount) 
        ? await mClient.getEmail(typeof newEmailCount === 'number' && environment.isMailOrderReverse ? newEmailCount as number : 1)
        : '';
      const newEmailData = typeof newEmail === 'object' 
        ? newEmail as newEmailData 
        : {emailSubject: '', emailBody: ''};
      let otpVal = await mClient.getEmailOtp(newEmailData.emailBody);
      let otpValNum = otpVal ? parseInt(otpVal) : faker.random.number();
      await otpModalText.sendKeys(otpValNum);
    }
    else{   
      await browser.wait(ec.visibilityOf(otpModal), 2000);
      otpModalText.sendKeys(faker.random.number());
    }
    await otpSubmit.click();

    //Browser should redirect to passbook
    await browser.wait(
      ec.urlIs(`${environment.baseRoute}/portal/passbook`),
      4000
    );
  });


  it('Bulk Transfer Fail', async () => {
    // let transfer = element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[3]/a'));
    // transfer.click();
    await browser.get(`${environment.baseRoute}/portal/transfer/bulk`);
    
    let account = element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-bulk-transfer-overview/div/div/div/sbpro-card/div/div[2]/sbpro-bulk-transfer/div/div[1]/div[1]/ng-select/div/div/div[2]/input'));
    account.click();
    //await browser.sleep(1000);
    let option = element.all(by.css('.ng-option.ng-option-marked.ng-star-inserted')).first();
    option.click();
    const uploadFile = path.resolve(
      `e2e/src/modules/6-transfer/Bulk_Transfer_Format_Success.xlsx`
          );
    let batchName = element(by.xpath('//*[@id="batchWidth"]/input'));
    batchName.sendKeys('Batch1');
    await browser.sleep(2000);
    let upload = element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-bulk-transfer-overview/div/div/div/sbpro-card/div/div[2]/sbpro-bulk-transfer/div/sbpro-card/div/div/input'));
    await upload.sendKeys(uploadFile);

    let table = element(by.css('thead'));
    await table.all(by.css('tr')).then(async rows => {
      rows[0].all(by.css('th')).then(async (data: any) => {
      expect(await data[0].getText()).to.be.equal('Excel row no');
      expect(await data[1].getText()).to.be.equal('Virtual A/c');
      expect(await data[2].getText()).to.be.equal('Amount');
      expect(await data[3].getText()).to.be.equal('Beneficiary Name');
      expect(await data[4].getText()).to.be.equal('Beneficiary A/c Number');
      expect(await data[5].getText()).to.be.equal('IFSC');
      expect(await data[6].getText()).to.be.equal('Bank Name');
      expect(await data[7].getText()).to.be.equal('Purpose');
      expect(await data[8].getText()).to.be.equal('Status');
    });
  });

  let table1 = element(by.css('tbody'));
  await table1.all(by.css('tr')).then(async rows => {
    rows[0].all(by.css('td')).then(async (data: any) => {
    expect(await data[0].getText()).to.be.equal('1');
    expect(await data[1].getText()).to.be.equal('PPAY5443394074');
    expect(await data[2].getText()).to.be.equal('₹5000.12');
    expect(await data[3].getText()).to.be.equal('AJ');
    expect(await data[4].getText()).to.be.equal('6836100000000');
    expect(await data[5].getText()).to.be.equal('SBIN0011513');
    expect(await data[6].getText()).to.be.equal('BOI');
    expect(await data[7].getText()).to.be.equal('Demo Testing');
  });
});
  await browser.sleep(2000);
  //let failedTransfer = element(by.cssContainingText('.small.font-weight-bold.mb-1','Failed (5)'))
  let failedTransfer = element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-bulk-transfer-overview/div/div/div/sbpro-card/div/div[2]/sbpro-bulk-transfer/div/div[3]/div[3]/div/div'));
  await browser.sleep(2000);
  failedTransfer.click();
  let table2 = element(by.css('tbody'));

  await table2.all(by.css('tr')).then(async rows =>{
    rows[0].all(by.css('td')).then(async (data:any) =>{
      expect(await data[8].getText()).to.be.equal('Error in Payee Name');
      });
    rows[1].all(by.css('td')).then(async (data:any) =>{
       expect(await data[8].getText()).to.be.equal('Error in Beneficiary Account Number');
       });
    rows[2].all(by.css('td')).then(async (data:any) =>{
       expect(await data[8].getText()).to.be.equal('Error in IFSC');
       });
    rows[3].all(by.css('td')).then(async (data:any) =>{
       expect(await data[8].getText()).to.be.equal('Error in Amount');
       });
    rows[4].all(by.css('td')).then(async (data:any) =>{
       expect(await data[8].getText()).to.be.equal('Error in Bank Name');
       });
    });
  });


  it('Bulk Transfer Success', async () => {
    // let transfer = element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[3]/a'));
    // transfer.click();
    await browser.get(`${environment.baseRoute}/portal/transfer/bulk`);
    
    let account = element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-bulk-transfer-overview/div/div/div/sbpro-card/div/div[2]/sbpro-bulk-transfer/div/div[1]/div[1]/ng-select/div/div/div[2]/input'));
    account.click();
    //await browser.sleep(1000);
    let option = element.all(by.css('.ng-option.ng-option-marked.ng-star-inserted')).first();
    option.click();
    const uploadFile = path.resolve(
      `e2e/src/modules/6-transfer/Bulk_Transfer_Format_Success_1.xlsx`
          );
    let batchName = element(by.xpath('//*[@id="batchWidth"]/input'));
    batchName.sendKeys('Batch1');
    await browser.sleep(2000);
    let upload = element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-bulk-transfer-overview/div/div/div/sbpro-card/div/div[2]/sbpro-bulk-transfer/div/sbpro-card/div/div/input'));
    await upload.sendKeys(uploadFile);

    let createTransfer = element(by.cssContainingText('.btn.mt-3.makeTransferButtonWidth.castlerButtonColor3','Create Transfer'));
    await createTransfer.click();

  //Connect Mail client if otp forwarded testing is true
    if (environment.isOtpForwarded) {
      mClient = new MailClient();
      await mClient.connectMail();
      }
  //Get Last Email Count
    const emailCount = environment.isOtpForwarded ?  await mClient.getEmailCount() : '';
    let otpModal = element(
      by.xpath(
        '/html/body/ngb-modal-window/div/div/sbpro-otp-modal/sbpro-card/div'
      )
    );
    let otpModalText = element(
      by.xpath(
        '/html/body/ngb-modal-window/div/div/sbpro-otp-modal/sbpro-card/div/div[2]/div/input'
      )
    );
    let otpSubmit = element(
      by.xpath(
        '/html/body/ngb-modal-window/div/div/sbpro-otp-modal/sbpro-card/div/div[3]/button'
      )
    );


  //Check if OTP Modal is loading
    if (environment.isOtpForwarded){
      //Wait for some time for OTP and mail to deliver
      browser.sleep(30000);
      await browser.wait(ec.visibilityOf(otpModal), 2000);

      await mClient.connectMail();
      const newEmailCount = await mClient.getEmailCount();
      const newEmail = (emailCount !== newEmailCount) 
        ? await mClient.getEmail(typeof newEmailCount === 'number' && environment.isMailOrderReverse ? newEmailCount as number : 1)
        : '';
      const newEmailData = typeof newEmail === 'object' 
        ? newEmail as newEmailData 
        : {emailSubject: '', emailBody: ''};
      let otpVal = await mClient.getEmailOtp(newEmailData.emailBody);
      let otpValNum = otpVal ? parseInt(otpVal) : faker.random.number();
      await otpModalText.sendKeys(otpValNum);
    }
    else{   
      await browser.wait(ec.visibilityOf(otpModal), 2000);
      otpModalText.sendKeys(faker.random.number());
    }
    await otpSubmit.click();

});

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser
      .manage()
      .logs()
      .get(logging.Type.BROWSER);
    expect(logs).not.to.include({
      level: logging.Level.SEVERE
    } as logging.Entry);
  });
});
