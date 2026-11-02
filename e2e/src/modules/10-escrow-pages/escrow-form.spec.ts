import chai, { expect } from 'chai';
import {
  browser,
  by,
  element,
  ElementFinder,
  ExpectedConditions as ec,
  utils,
  WebElement
} from 'protractor';
import { environment } from '../../../environmentTest';
import chaiHttp from 'chai-http';
import { assert } from 'console';

chai.use(chaiHttp);
chai.use(require('chai-match'));

let template = new Date().toString();

let route = environment.baseRoute;

describe('Escrow Pages', () => {
  it('login', async () => {
    await browser.wait(browser.get(route + '/auth/login'));
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
      by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[9]')
    );
    await browser.wait(ec.elementToBeClickable(nav), 5000);
    await nav.click();
    let subNav = element(
      by.xpath(
        '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[9]/nav/sbpro-side-nav-item[1]'
      )
    );
    await browser.wait(ec.elementToBeClickable(subNav));
    await subNav.click();
    await browser.wait(ec.urlIs(route + '/portal/escrow-page'));
    browser.sleep(10000);
  });

  it('open link', async () => {
    let link = await element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-escrow-pages-list/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr[1]/td[4]'
      )
    ).getText();
    await browser.get(link);
    await browser.wait(ec.urlIs(link));
  });

  it('fill form', async () => {
    let next = element(
      by.xpath(
        '/html/body/app-root/sbpro-escrow-pages-live/sbpro-preview/sbpro-card[1]/div/div/div[2]/div[4]/sbpro-card/div/div[5]/sbpro-app-button/button'
      )
    );
    let name = element(by.xpath('//*[@id="Customer Name"]'));
    await browser.wait(ec.presenceOf(name));
    await name.sendKeys('Hello world');
    let email = element(by.xpath('//*[@id="Email Address"]'));
    await browser.wait(ec.presenceOf(email));
    await email.sendKeys(environment.user1LoginId);
    let mobile = element(by.xpath('//*[@id="Mobile"]'));
    await browser.wait(ec.presenceOf(mobile));
    await mobile.sendKeys(environment.mobile);

    await browser.wait(ec.elementToBeClickable(next));
    await next.click();

    let submit = element(
      by.xpath(
        '/html/body/app-root/sbpro-escrow-pages-live/sbpro-preview/sbpro-card[1]/div/div/div[2]/div[4]/sbpro-card/div/div[7]/bbutton'
      )
    );
    await browser.wait(ec.elementToBeClickable(submit));
    await submit.click();

    let print = element(by.xpath('//*[@id="nprint"]'));
    await browser.wait(ec.elementToBeClickable(print));
  });

  it('login', async () => {
    await browser.wait(browser.get(route + '/auth/login'));
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
      by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[9]')
    );
    await browser.wait(ec.elementToBeClickable(nav), 5000);
    await nav.click();
    let subNav = element(
      by.xpath(
        '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[9]/nav/sbpro-side-nav-item[1]'
      )
    );
    await browser.wait(ec.elementToBeClickable(subNav));
    await subNav.click();
    await browser.wait(ec.urlIs(route + '/portal/escrow-page'));
    browser.sleep(10000);
  });

  it('validate customer detail', async () => {
    let detailLink = element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-escrow-pages-list/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr[1]/td[1]'
      )
    );
    await browser.wait(ec.elementToBeClickable(detailLink));
    await detailLink.click();

    let name = element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-escrow-pages-customer-details/div/div/div/div/sbpro-escrow-page-customer-data/sbpro-card/div/div[2]/div[1]/table/tbody/tr/td[2]/span'
      )
    );
    await browser.wait(ec.textToBePresentInElement(name, 'Hello world'));
  });
});
