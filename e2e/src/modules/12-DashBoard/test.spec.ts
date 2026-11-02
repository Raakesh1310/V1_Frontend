import { expect } from 'chai';
import {
  browser,
  by,
  element,
  logging,
  ExpectedConditions as ec,
  ElementFinder
} from 'protractor';
import { isContext } from 'vm';
import { environment } from '../../../environmentTest';

describe('DashBoard', () => {
  let emailAddressInput!: ElementFinder;
  let passwordInput!: ElementFinder;
  let submitButton!: ElementFinder;

  it('Login should Work Fine', async () => {
    await browser.get(`${environment.baseRoute}/auth/login`);
    emailAddressInput = element(by.id('inputEmailAddress'));
    passwordInput = element(by.id('inputPassword'));
    submitButton = element(by.id('input'));

    await emailAddressInput.sendKeys(environment.user1LoginId);
    await passwordInput.sendKeys(environment.user1LoginPassword);
    await submitButton.click();
    await browser.wait(ec.urlIs(`${environment.baseRoute}/dashboard`));
  });

  it('logo should be present', async () => {
    let logo = element(by.xpath('//*[@id="navbarDropdownUserImage"]/img'));
    await browser.wait(ec.presenceOf(logo));
  });

  it('merchant dropdown', async () => {
    let drpdwn = element(
      by.xpath(
        '/html/body/app-root/sbpro-dashboard/sbpro-layout-dashboard/span/sb-top-nav/nav/ul/sbpro-top-nav-merchant/li'
      )
    );
    await browser.wait(ec.elementToBeClickable(drpdwn));
    await drpdwn.click();

    let list = element.all(
      by.xpath(
        '/html/body/app-root/sbpro-dashboard/sbpro-layout-dashboard/span/sb-top-nav/nav/ul/sbpro-top-nav-merchant/li/div/div/a'
      )
    );
    expect((await list).length).to.be.eq(2);

    let merchant = element(
      by.xpath(
        '/html/body/app-root/sbpro-dashboard/sbpro-layout-dashboard/span/sb-top-nav/nav/ul/sbpro-top-nav-merchant/li/div/div/a[2]'
      )
    );
    await merchant.click();

    let tick = element(
      by.xpath(
        '/html/body/app-root/sbpro-dashboard/sbpro-layout-dashboard/span/sb-top-nav/nav/ul/sbpro-top-nav-merchant/li/div/div/a[2]/span/i-feather'
      )
    );
    await browser.wait(ec.presenceOf(tick));
  });
});
