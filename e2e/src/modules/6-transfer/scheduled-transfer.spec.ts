import chai, { expect } from 'chai';
import { browser, by, element, ExpectedConditions as ec } from 'protractor';
import { environment } from '../../../environmentTest';
import chaiHttp from 'chai-http';

chai.use(chaiHttp);
chai.use(require('chai-match'));

let route = environment.baseRoute;

describe('Scheduled Transfer', () => {
  it('login', async () => {
    await browser.wait(browser.get(route + '/auth/login'), 2000);
    let emailAddressInput = element(by.id('inputEmailAddress'));
    let passwordInput = element(by.id('inputPassword'));
    let submitBtn = element(by.xpath('//*[@id="input"]'));
    await browser.wait(ec.presenceOf(emailAddressInput), 5000);
    await emailAddressInput.sendKeys(environment.user1LoginId);
    await browser.wait(ec.presenceOf(passwordInput), 5000);
    await passwordInput.sendKeys(environment.user1LoginPassword);
    await browser.wait(ec.presenceOf(submitBtn), 5000);
    await submitBtn.click();
    await browser.wait(ec.urlIs(route + '/dashboard'), 5000);
  });

  it('navigate', async () => {
    let nav = element(
      by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[4]')
    );
    await browser.wait(ec.elementToBeClickable(nav), 5000);
    await nav.click();
    let subNav = element(
      by.xpath(
        '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[4]/nav/sbpro-side-nav-item[1]'
      )
    );
    await browser.wait(ec.elementToBeClickable(subNav), 5000);
    await subNav.click();
    await browser.wait(ec.urlIs(route + '/portal/transfer'));
  });

  /**
   * add basic detail
   */
  it('invalid "repeat for"', async () => {
    // select account
    let account = element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-transfer-overview/div/div/div/sbpro-card/div/div[2]/sbpro-transfer-new-request/form/div[1]/ng-select/div/div/div[2]/input'
      )
    );
    await browser.wait(ec.visibilityOf(account));

    await account.click();
    await account.sendKeys(environment.transferAccountName);
    let accountOption = element.all(by.css('.ng-option')).first();
    await browser.wait(ec.visibilityOf(accountOption), 2000);
    await accountOption.click();

    // select payee
    let payee = element(by.xpath('//*[@id="payee"]/div/div/div[2]/input'));
    await browser.wait(ec.visibilityOf(payee));
    await payee.click();
    await payee.sendKeys(environment.transferPayeeName);
    let payeeOption = element.all(by.css('.ng-option')).first();
    await browser.wait(ec.visibilityOf(payeeOption), 2000);
    await payeeOption.click();

    // set amount
    let amount = element(by.id('amountcontrol'));
    await browser.wait(ec.presenceOf(amount));
    await amount.sendKeys(2);

    // set purpose
    let purpose = element(by.id('purpose'));
    await browser.wait(ec.presenceOf(purpose));
    await purpose.sendKeys('test');

    // set reccurring
    let slider = element(
      by.xpath(
        '/html/body/app-root/sbpro-transfer/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-transfer-overview/div/div/div/sbpro-card/div/div[2]/sbpro-transfer-new-request/form/div[5]/label[2]'
      )
    );
    await browser.wait(ec.elementToBeClickable(slider));
    await slider.click();

    let submitButton = element(by.xpath('//*[@id="input"]'));
    await browser.wait(ec.elementToBeClickable(submitButton));

    let frequency = element(by.xpath('//*[@id="frm-cntrl-account"]/option[2]'));
    await browser.wait(ec.presenceOf(frequency));
    await frequency.click();

    let repeat = element(by.xpath('//*[@id="recurrence"]'));
    await browser.wait(ec.presenceOf(repeat));
    await repeat.sendKeys(-1);

    await submitButton.click();
    let error = element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-transfer-overview/div/div/div/sbpro-card/div/div[2]/sbpro-transfer-new-request/div/sbpro-alert/div'
      )
    );
    await browser.wait(
      ec.textToBePresentInElement(
        error,
        'Please set a frequency greater than zero.'
      )
    );
  });

  it('init recurring transfer', async () => {
    let repeat = element(by.xpath('//*[@id="recurrence"]'));
    await browser.wait(ec.presenceOf(repeat));
    await repeat.clear();
    await repeat.sendKeys(4);

    let submitButton = element(by.xpath('//*[@id="input"]'));
    await browser.wait(ec.elementToBeClickable(submitButton));
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

  it('redirection validation', async () => {
    await browser.wait(ec.urlIs(route + '/portal/transfer/scheduled'));
  });
});
