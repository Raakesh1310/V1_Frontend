import { expect } from 'chai';
import {
  browser,
  by,
  element,
  ElementFinder,
  ExpectedConditions as ec,
  logging
} from 'protractor';

import { environment } from '../../../../environmentTest';

describe('Account Lists', () => {
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
    emailAddressInput.sendKeys(environment.adminLoginId);
    passwordInput.sendKeys(environment.adminLoginPassword);
    submitBtn.click();
    browser.wait(ec.urlIs(`${environment.baseRoute}/dashboard`));
  });

  let itemCount: number;

  it('Check only 10 items are in 1 page', async () => {
    await browser.get(`${environment.baseRoute}/super-admin/account`);
    const rows = element(by.tagName('tbody')).all(by.tagName('tr'));
    itemCount = (await rows).length;
    expect((await rows).length).to.be.greaterThan(0);
    expect((await rows).length).to.be.lessThan(11);
  });

  it('Search by account name', async () => {
    await element(by.buttonText('Clear')).click();
    /**
     * Pick name of the last item
     */
    let name = await element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-all-accounts-page/div/div/sbpro-card/div/sbpro-all-accounts/div[2]/table/tbody/tr[1]/td[1]/ngb-highlight'
      )
    ).getText();

    await element(by.xpath('//*[@id="search-box"]')).sendKeys(name);
    await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-all-accounts-page/div/div/sbpro-card/div/sbpro-all-accounts/div[1]/form/div[1]/button[1]')).click();

    expect(
      await element(
        by.xpath(
          '//*[@id="layoutSidenav_content"]/main/sbpro-all-accounts-page/div/div/sbpro-card/div/sbpro-all-accounts/div[2]/table/tbody/tr[1]/td[1]/ngb-highlight'
        )
      ).getText()
    ).to.be.equal(name);
  });

  it('Search by account id', async () => {
    await element(by.buttonText('Clear')).click();
    /**
     * Pick account id of the last item
     */
    let accountId = await element(
      by.xpath(
        `//*[@id="layoutSidenav_content"]/main/sbpro-all-accounts-page/div/div/sbpro-card/div/sbpro-all-accounts/div[2]/table/tbody/tr[${itemCount}]/td[2]/a/ngb-highlight`
      )
    ).getText();

    await element(by.xpath('//*[@id="search-box"]')).sendKeys(accountId);
    await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-all-accounts-page/div/div/sbpro-card/div/sbpro-all-accounts/div[1]/form/div[1]/button[1]')).click();

    expect(
      await element(
        by.xpath(
          '//*[@id="layoutSidenav_content"]/main/sbpro-all-accounts-page/div/div/sbpro-card/div/sbpro-all-accounts/div[2]/table/tbody/tr[1]/td[2]/a/ngb-highlight'
        )
      ).getText()
    ).to.be.equal(accountId);
  });

  it('Search by email', async () => {
    await element(by.buttonText('Clear')).click();

    /**
     * Pick email of the last item
     */
    let email = await element(
      by.xpath(
        `//*[@id="layoutSidenav_content"]/main/sbpro-all-accounts-page/div/div/sbpro-card/div/sbpro-all-accounts/div[2]/table/tbody/tr[${itemCount}]/td[5]/ngb-highlight`
      )
    ).getText();

    await element(by.xpath('//*[@id="search-box"]')).sendKeys(email);
    await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-all-accounts-page/div/div/sbpro-card/div/sbpro-all-accounts/div[1]/form/div[1]/button[1]')).click();

    expect(
      await element(
        by.xpath(
          '//*[@id="layoutSidenav_content"]/main/sbpro-all-accounts-page/div/div/sbpro-card/div/sbpro-all-accounts/div[2]/table/tbody/tr[1]/td[5]/ngb-highlight'
        )
      ).getText()
    ).to.be.equal(email);
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
