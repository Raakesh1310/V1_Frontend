import { expect } from 'chai';
import {
  browser,
  by,
  element,
  ElementFinder,
  ExpectedConditions as ec,
  logging
} from 'protractor';

import { environment } from '../../../environmentTest';

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
    emailAddressInput.sendKeys(environment.user1LoginId);
    passwordInput.sendKeys(environment.user1LoginPassword);
    submitBtn.click();
    browser.wait(ec.urlIs(`${environment.baseRoute}/dashboard`));
  });

  let itemCount: number;

  it('Check only 10 items are in 1 page', async () => {
    await browser.get(`${environment.baseRoute}/portal/account`);
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
        '//*[@id="layoutSidenav_content"]/main/sbpro-account-overview-page/div/div/div/sbpro-accounts-table-default/sbpro-card/div/div[2]/form/div[3]/table/tbody/tr[1]/td[1]/ngb-highlight'
      )
    ).getText();

    await element(by.xpath('//*[@id="search-box"]')).sendKeys(name);
    await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-account-overview-page/div/div/div/sbpro-accounts-table-default/sbpro-card/div/div[2]/form/div[1]/button[1]')).click();

    expect(
      await element(
        by.xpath(
          '//*[@id="layoutSidenav_content"]/main/sbpro-account-overview-page/div/div/div/sbpro-accounts-table-default/sbpro-card/div/div[2]/form/div[3]/table/tbody/tr[1]/td[1]/ngb-highlight'
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
        '//*[@id="layoutSidenav_content"]/main/sbpro-account-overview-page/div/div/div/sbpro-accounts-table-default/sbpro-card/div/div[2]/form/div[3]/table/tbody/tr[1]/td[2]/ngb-highlight'
      )
    ).getText();

    await element(by.xpath('//*[@id="search-box"]')).sendKeys(accountId);
    await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-account-overview-page/div/div/div/sbpro-accounts-table-default/sbpro-card/div/div[2]/form/div[1]/button[1]')).click();

    expect(
      await element(
        by.xpath(
          '//*[@id="layoutSidenav_content"]/main/sbpro-account-overview-page/div/div/div/sbpro-accounts-table-default/sbpro-card/div/div[2]/form/div[3]/table/tbody/tr[1]/td[2]/ngb-highlight'
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
        '//*[@id="layoutSidenav_content"]/main/sbpro-account-overview-page/div/div/div/sbpro-accounts-table-default/sbpro-card/div/div[2]/form/div[3]/table/tbody/tr[1]/td[4]/ngb-highlight'
      )
    ).getText();

    await element(by.xpath('//*[@id="search-box"]')).sendKeys(email);
    await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-account-overview-page/div/div/div/sbpro-accounts-table-default/sbpro-card/div/div[2]/form/div[1]/button[1]')).click();

    expect(
      await element(
        by.xpath(
          '//*[@id="layoutSidenav_content"]/main/sbpro-account-overview-page/div/div/div/sbpro-accounts-table-default/sbpro-card/div/div[2]/form/div[3]/table/tbody/tr[1]/td[4]/ngb-highlight'
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
