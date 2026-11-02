import { expect } from 'chai';
import {
  browser,
  by,
  element,
  logging,
  ExpectedConditions as ec,
  ElementFinder
} from 'protractor';
import { environment } from '../../../environmentTest';

describe('Transfer init', () => {
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

  it('get elems', async () => {
    browser.get(`${environment.baseRoute}/portal/transfer`);
    account = element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-transfer-overview/div/div/div/sbpro-card/div/div[2]/sbpro-transfer-new-request/form/div[1]/ng-select/div/div/div[2]/input'
      )
    );
    payee = element(by.xpath('//*[@id="payee"]/div/div/div[2]/input'));
    amount = element(by.id('amountcontrol'));
    purpose = element(by.id('purpose'));
    al = element(
      by.xpath(
        '/html/body/app-root/sbpro-transfer/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-transfer-overview/div/div/div/sbpro-card/div/div[2]/sbpro-transfer-new-request/div/sbpro-alert/div'
      )
    );
    slider = element(
      by.xpath(
        '/html/body/app-root/sbpro-transfer/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-transfer-overview/div/div/div/sbpro-card/div/div[2]/sbpro-transfer-new-request/form/div[5]/label[2]'
      )
    );
    submitButton = element(by.xpath('//*[@id="input"]'));
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

  it('transfer validation', async () => {
    let accountOption: ElementFinder, payeeOption: ElementFinder;

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

    // send large amount than account
    await amount.sendKeys(2000000000000000000000);
    await purpose.sendKeys('test');

    await submitButton.click();

    let error = element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-transfer-overview/div/div/div/sbpro-card/div/div[2]/sbpro-transfer-new-request/div/sbpro-alert/div'
      )
    );
    await browser.wait(
      ec.textToBePresentInElement(
        error,
        "Amount cannot exceed account's balance."
      )
    );

    await amount.clear();
    await amount.sendKeys(2);
    await submitButton.click();
  });

  it('otp verification', async () => {
    let verify = element(
      by.xpath(
        '/html/body/ngb-modal-window/div/div/sbpro-otp-modal/sbpro-card/div/div[3]/button'
      )
    );
    let otp = element(
      by.xpath(
        '/html/body/ngb-modal-window/div/div/sbpro-otp-modal/sbpro-card/div/div[2]/div/input'
      )
    );
    await browser.wait(ec.presenceOf(otp), 5000);
    await browser.wait(ec.elementToBeClickable(verify), 5000);
    await otp.sendKeys('1191');
    await verify.click();
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
