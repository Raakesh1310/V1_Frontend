import chai, { expect } from 'chai';
import {
  browser,
  by,
  element,
  ElementFinder,
  ExpectedConditions as ec
} from 'protractor';
import { environment } from '../../../environmentTest';
import chaiHttp from 'chai-http';

chai.use(chaiHttp);
chai.use(require('chai-match'));

let route = environment.baseRoute;

describe('Transaction user', () => {
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
      by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[6]')
    );
    await browser.wait(ec.elementToBeClickable(nav), 5000);
    await nav.click();
    let subNav = element(
      by.xpath(
        '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[6]/nav/sbpro-side-nav-item[1]'
      )
    );
    await browser.wait(ec.elementToBeClickable(subNav));
    await subNav.click();
    await browser.wait(ec.urlIs(route + '/portal/transaction'));
  });

  it('validate list', async () => {
    let list = element(by.css('tbody'));

    await list.all(by.css('tr')).then(async rows => {
      rows.forEach(row => {
        row.all(by.css('td')).then(async (data: ElementFinder) => {
          expect(await data[0].getText()).to.match(/^TX\d{10}$/);
        });
      });
    });
  });

  it('validate search', async () => {
    let list = await element.all(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr'
      )
    );
    let searchInput = element(by.xpath('//*[@id="search-box"]'));
    let search = element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/form/div/div[4]/button[1]'
      )
    );
    let lastindex = list.length;
    let paymentId = element(
      by.xpath(
        `//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr[${lastindex}]/td[1]    `
      )
    );

    await browser.wait(ec.presenceOf(searchInput));
    await browser.wait(ec.presenceOf(search));
    await browser.wait(ec.presenceOf(paymentId));
    let input = await paymentId.getText();
    searchInput.sendKeys(input);
    await search.click();

    let rtResult = element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr[1]/td[1]'
      )
    );
    await browser.wait(ec.textToBePresentInElement(rtResult, input));
    let clear = element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/form/div/div[4]/button[2]'
      )
    );
    await browser.wait(ec.elementToBeClickable(clear));
    await clear.click();
  });

  it('validate detail page', async () => {
    let detailLink = element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr[1]/td[1]'
      )
    );
    await browser.wait(ec.elementToBeClickable(detailLink));
    let paymentId = await detailLink.getText();
    await detailLink.click();
    await browser.wait(ec.urlIs(route + `/portal/transaction/${paymentId}`));

    let resultPaymentId = element(
      by.xpath('//*[@id="print-section"]/form/div/div[1]/div[1]/p')
    );
    await browser.wait(ec.textToBePresentInElement(resultPaymentId, paymentId));

    let report = element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-transaction-details-page/div/div/div/sbpro-transaction-details/sbpro-card/div/div[3]/button[2]'
      )
    );
    await browser.wait(ec.elementToBeClickable(report));
  });
});
