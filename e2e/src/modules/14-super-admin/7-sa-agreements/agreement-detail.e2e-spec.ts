import { expect } from 'chai';
import { browser, by, element, ExpectedConditions as ec } from 'protractor';
import { environment } from '../../../../environmentTest';
let route = environment.baseRoute;
let documentId = '';

describe('Agreement detail page test', () => {
  it('login', async () => {
    await browser.wait(browser.get(route + '/auth/login'), 5000);

    let emailAddressInput = element(by.id('inputEmailAddress'));
    let passwordInput = element(by.id('inputPassword'));
    let submitBtn = element(by.xpath('//*[@id="input"]'));

    await emailAddressInput.sendKeys(environment.adminLoginId);
    await passwordInput.sendKeys(environment.adminLoginPassword);
    await submitBtn.click();

    await browser.wait(ec.urlIs(route + '/dashboard'), 5000);
  });

  it('navigate to agreement list', async () => {
    let nav = element(
      by.xpath(
        '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[12]/a'
      )
    );
    await browser.wait(ec.elementToBeClickable(nav), 5000);
    await nav.click();

    let subNav = element(
      by.xpath(
        '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[12]/nav/sbpro-side-nav-item[1]/a'
      )
    );
    await browser.wait(ec.elementToBeClickable(subNav), 5000);
    await subNav.click();

    await browser.wait(ec.urlIs(route + '/portal/document/order'), 5000);
  });

  it('navigate to agreement detail page', async () => {
    let agreement = element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-list-document-container/div/div/sbpro-card/div/div[2]/sbpro-list-document/form/div[3]/table/tbody/tr[1]/td[2]/a/ngb-highlight'
      )
    );
    await browser.wait(ec.elementToBeClickable(agreement), 5000);
    documentId = await agreement.getText();
    await agreement.click();

    await browser.wait(
      ec.urlIs(route + `/portal/document/order/${documentId}`)
    );
  });

  it('validate detail page', async () => {
    let docId = element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-doqfy-order/div/div/sbpro-doqfy-order-component/sbpro-card/div/div[2]/div[2]/div[1]/div/span'
      )
    );
    await browser.wait(ec.presenceOf(docId), 5000);
    expect(await docId.getText()).to.be.equals(documentId);

    let status = element(
      by.xpath(
        '//*[@id="input"]'
      )
    );
    await browser.wait(ec.elementToBeClickable(status), 5000);
    let download = element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-doqfy-order/div/div/sbpro-doqfy-order-component/sbpro-card/div/div[2]/div[1]/div[2]/div/a'
      )
    );
    await browser.wait(ec.elementToBeClickable(download), 5000);
    let report = element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-doqfy-order/div/div/sbpro-doqfy-order-component/sbpro-card/div/div[2]/div[3]/div[2]/div/button'
      )
    );
    await browser.wait(ec.elementToBeClickable(report), 5000);
  });
});
