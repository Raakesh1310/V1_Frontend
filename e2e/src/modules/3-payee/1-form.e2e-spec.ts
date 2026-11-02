import { expect } from 'chai';
import { environment } from '../../../environmentTest';
import {
  browser,
  by,
  element,
  ElementFinder,
  protractor,
  ExpectedConditions as ec,
  ExpectedConditions,
  logging
} from 'protractor';
import faker from 'faker';
import path from 'path';
import { MailClient } from '../../helpers/mail.po';
import { newEmailData } from '../../interfaces/newEmailData.interface';
import fs from 'fs';


describe('Payee', () => {
  let mClient: MailClient;

  it('login first', async () => {
    let emailAddressInput!: ElementFinder;
    let submitBtn!: ElementFinder;
    let passwordInput!: ElementFinder;
    browser.get(`${environment.baseRoute}/auth/login`);
    browser
      .manage()
      .window()
      .maximize();
    emailAddressInput = element(by.id('inputEmailAddress'));
    passwordInput = element(by.id('inputPassword'));
    submitBtn = element(by.buttonText('Login'));
    browser.wait(ec.visibilityOf(emailAddressInput), 5000);
    browser.wait(ec.visibilityOf(passwordInput), 5000);
    emailAddressInput.sendKeys(environment.user1LoginId);
    passwordInput.sendKeys(environment.user1LoginPassword);
    submitBtn.click();
    browser.wait(ec.urlIs(`${environment.baseRoute}/dashboard`));
  });

  let ifsc!: ElementFinder;
  let cheque!: ElementFinder;
  let email!: ElementFinder;
  let bankName!: ElementFinder;
  let accountHolder!: ElementFinder;
  let accountNumber!: ElementFinder;
  let mobileNumber!: ElementFinder;
  let bankBranch!: ElementFinder;
  let form!: ElementFinder;
  let submitButton!: ElementFinder;
  let otp!: ElementFinder;

  beforeEach(() => {
    browser.get(`${environment.baseRoute}/portal/payee/form`);
    browser.sleep(2000);
    email = element(by.id('frm-cntrl-email'));
    ifsc = element(by.id('frm-cntrl-ifsc'));
    accountHolder = element(by.id('frm-cntrl-accountHolder'));
    accountNumber = element(by.id('frm-cntrl-acc-number'));
    mobileNumber = element(by.id('frm-cntrl-mob-number'));
    cheque = element(by.xpath('//*[@id="frm-cntrl-cheque"]/div/input'));
    bankName = element(by.id('frm-cntrl-bankName'));
    bankBranch = element(by.id('frm-cntrl-bankAddress'));
    otp = element(
      by.xpath(
        '/html/body/ngb-modal-window/div/div/sbpro-otp-modal/sbpro-card/div/div[2]/div/input'
      )
    );
    submitButton = element(by.buttonText('Add Payee'));
    form = element(by.tagName('form'));
  });

  it('Check for the form elements', async () => {
    /**
     * Navigate to default url
     */

    /**
     * Wait for the input element
     * if those elements are present in the page
     */
    await browser.wait(ec.visibilityOf(email), 5000);
    await browser.wait(ec.visibilityOf(ifsc), 5000);
    await browser.wait(ec.visibilityOf(accountHolder), 5000);
    await browser.wait(ec.visibilityOf(accountNumber), 5000);
    await browser.wait(ec.visibilityOf(mobileNumber), 5000);
    // await browser.wait(ec.visibilityOf(cheque), 5000);

    await browser.wait(ec.visibilityOf(bankName), 5000);
    await browser.wait(ec.visibilityOf(submitButton), 5000);
    await browser.wait(ec.visibilityOf(form), 5000);
  });

  it('Submit blank form', async () => {
    await accountHolder.click();
    await email.click();
    await mobileNumber.click();
    await accountNumber.click();
    await ifsc.click();
    await bankName.click();
    await bankBranch.click();
    await submitButton.click();

    /**
     * class 'text-danger' is also used for mandatory inputs symbol '*'
     * so checking only alternate elements for error messages
     */

    await element.all(by.className('text-danger')).then(async errors => {
      expect(await errors[1].getText()).to.be.equal(
        "Account holder's name is required."
      );
      expect(await errors[3].getText()).to.be.equal('Email is required.');
      expect(await errors[5].getText()).to.be.equal(
        'Mobile number is required.'
      );
      expect(await errors[7].getText()).to.be.equal(
        'Account number is required.'
      );
      expect(await errors[9].getText()).to.be.equal('IFSC is required.');
      expect(await errors[11].getText()).to.be.equal('Bank name is required.');
      expect(await errors[13].getText()).to.be.equal(
        '*'
      );
    });
  });

  it('Add Single Payee', async () => {
    const payeeName = faker.name.findName();
    const payeeEmail = faker.internet.email();
    const payeeMobile = faker.phone.phoneNumberFormat().replace(/-/g, '');
    const payeeAccountNumber = faker.finance.account();
    const payeeIfsc = 'PUNB0663600';
    let payeeBankName = 'Punjab National Bank';
    const cancelledCheque = path.resolve(
      `e2e/src/modules/3-payee/Book1.xlsx`
    );
    //Connect Mail client if otp forwarded testing is true
    if (environment.isOtpForwarded) {
      mClient = new MailClient();
      await mClient.connectMail();
    }

    await accountHolder.sendKeys(payeeName);
    await email.sendKeys(payeeEmail);
    await mobileNumber.sendKeys(payeeMobile);
    await accountNumber.sendKeys(payeeAccountNumber);
    await ifsc.sendKeys(payeeIfsc);
    await browser.findElement(by.xpath('//html')).click();
    await cheque.sendKeys(cancelledCheque);
    //Get Last Email Count
    const emailCount = environment.isOtpForwarded ?  await mClient.getEmailCount() : '';
    await submitButton.click();
    
    if (environment.isOtpForwarded){
      //Wait for some time for OTP and mail to deliver
      browser.sleep(30000);
      await browser.wait(ec.visibilityOf(otp), 5000);

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
      await otp.sendKeys(otpValNum);
    }
    else{
      await browser.wait(ec.visibilityOf(otp), 5000);
      await otp.sendKeys(faker.random.number());
    }
    
    await element(by.buttonText('Verify')).click();
    await browser.wait(ec.urlIs(`${environment.baseRoute}/portal/payee`), 5000);

    let payeeTable = element(by.css('tbody'));
    await payeeTable.all(by.css('tr')).then(async rows => {
      rows[0].all(by.css('td')).then(async (data: any) => {
        expect(await data[0].getText()).to.be.equal(payeeName);
        expect(await data[1].getText()).to.be.equal(payeeIfsc);
        expect(await data[2].getText()).to.be.equal(payeeAccountNumber);
        expect(await data[3].getText()).to.be.equal(payeeBankName);
      });
     });
  });


  //Add Multiple Payees
   it('Add Multiple Payee', async () => {
     const multipleClick = element(by.xpath('//*[@id="layoutSidenav_content"]/main/router-outlet/div/sbpro-card-navigation/div/div[1]/ul/li[2]/a'))
     multipleClick.click();
     const multiplePayee = path.resolve(
     `e2e/src/modules/3-payee/Book1.xlsx`
         );
    if (environment.isOtpForwarded) {
      mClient = new MailClient();
      await mClient.connectMail();
    }
    const emailCount = environment.isOtpForwarded ?  await mClient.getEmailCount() : '';
    await browser.sleep(2000);
    //let input = element(by.cssContainingText('.card-body.flex-display.justify-content-center.ng-star-inserted','Upload File'));
    let input = element(by.xpath('//*[@id="layoutSidenav_content"]/main/router-outlet/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-multiple-payees/div/input'));
    //await input.click();
    await input.sendKeys(multiplePayee);
    // let ifscError = element(by.xpath('//*[@id="layoutSidenav_content"]/main/router-outlet/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-multiple-payees/div/div[2]/table/tbody/tr[1]/td[9]/ngb-highlight'));
    // expect(await ifscError.getText()).to.be.equal('Invalid IFSC format');
    let table = element(by.css('thead'));
    await table.all(by.css('tr')).then(async rows => {
      rows[0].all(by.css('th')).then(async (data: any) => {
      expect(await data[0].getText()).to.be.equal('Excel row no');
      expect(await data[1].getText()).to.be.equal('Payee name');
      expect(await data[2].getText()).to.be.equal('Email iD');
      expect(await data[3].getText()).to.be.equal('Mobile');
      expect(await data[4].getText()).to.be.equal('Bank Account No.');
      expect(await data[5].getText()).to.be.equal('Bank IFSC');
      expect(await data[6].getText()).to.be.equal('Bank Name');
      expect(await data[7].getText()).to.be.equal('Bank Branch');
      expect(await data[8].getText()).to.be.equal('Remarks');
    });
  });
  let table1 = element(by.css('tbody'));
  await table1.all(by.css('tr')).then(async rows =>{
    rows[0].all(by.css('td')).then(async (data:any) =>{
      expect(await data[0].getText()).to.be.equal('2');
      expect(await data[1].getText()).to.be.equal('AJ');
      expect(await data[2].getText()).to.be.equal('test01@test.com');
      expect(await data[3].getText()).to.be.equal('8419036342');
      expect(await data[4].getText()).to.be.equal('39238765009');
      expect(await data[5].getText()).to.be.equal('SBIN04');
      expect(await data[6].getText()).to.be.equal('United Bank of India');
      expect(await data[7].getText()).to.be.equal('cewvew');
      expect(await data[8].getText()).to.be.equal('Invalid IFSC format');
    });
  });
///Getting ERRORS
  await table1.all(by.css('tr')).then(async rows =>{
  rows[0].all(by.css('td')).then(async (data:any) =>{
    expect(await data[8].getText()).to.be.equal('Invalid IFSC format');
    });
  rows[1].all(by.css('td')).then(async (data:any) =>{
     expect(await data[8].getText()).to.be.equal('Invalid email format');
     });
  rows[2].all(by.css('td')).then(async (data:any) =>{
     expect(await data[8].getText()).to.be.equal('Invalid mobile format');
     });
  rows[3].all(by.css('td')).then(async (data:any) =>{
     expect(await data[8].getText()).to.be.equal('Error in Payee Name');
     });
  rows[4].all(by.css('td')).then(async (data:any) =>{
     expect(await data[8].getText()).to.be.equal('Error in Account Number');
     });
  rows[5].all(by.css('td')).then(async (data:any) =>{
     expect(await data[8].getText()).to.be.equal('Error in bank Name');
     });
  rows[6].all(by.css('td')).then(async (data:any) =>{
     expect(await data[8].getText()).to.be.equal('Branch Name is Empty');
     });
  });
  let addPayee = element(by.xpath('//*[@id="layoutSidenav_content"]/main/router-outlet/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-multiple-payees/div/sbpro-card/div/div/div[1]/button'));
  addPayee.click();
  // browser.sleep(20000);
  // // let otp = element(by.xpath('/html/body/ngb-modal-window/div/div/sbpro-otp-modal/sbpro-card/div/div[2]/div/input'));
  // // await browser.wait(ec.visibilityOf(otp), 5000);
  // browser.sleep(20000);
    if (environment.isOtpForwarded){
      //Wait for some time for OTP and mail to deliver
      browser.sleep(30000);
      await browser.wait(ec.visibilityOf(otp), 5000);

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
      await otp.sendKeys(otpValNum);
    }
    else{
      await browser.wait(ec.visibilityOf(otp), 5000);
      await otp.sendKeys(faker.random.number());
    }
    await element(by.buttonText('Verify')).click();
    await browser.get(`${environment.baseRoute}/portal/payee/form`);
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
