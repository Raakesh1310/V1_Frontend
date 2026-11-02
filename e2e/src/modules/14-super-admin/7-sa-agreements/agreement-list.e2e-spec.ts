import { expect } from 'chai';
import {
  browser,
  by,
  element,
  ExpectedConditions as ec,
  ElementFinder
} from 'protractor';
import { environment } from '../../../../environmentTest';
let route = environment.baseRoute;
let list = [];
let length = 0;
let agreementName = '';
let status = '';
describe('Agreement list test', () => {
  it('login', async () => {
    await browser.wait(browser.get(route + '/auth/login'), 2000);

    let emailAddressInput = element(by.id('inputEmailAddress'));
    let passwordInput = element(by.id('inputPassword'));
    let submitBtn = element(by.xpath('//*[@id="input"]'));

    emailAddressInput.sendKeys(environment.adminLoginId);
    passwordInput.sendKeys(environment.adminLoginPassword);
    submitBtn.click();

    await browser.wait(ec.urlIs(route + '/dashboard'), 5000);
  });

  it('navigate to agreement list', async () => {
    let nav = element(
      by.xpath(
        '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[10]/a'
      )
    );
    // await browser.wait(ec.elementToBeClickable(nav), 5000);
    // await nav.click();
    let subNav = element(
      by.xpath(
        '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[12]/nav/sbpro-side-nav-item[1]/a'
      )
    );
    //`await browser.wait(ec.elementToBeClickable(subNav));
    await subNav.click();

    await browser.wait(ec.urlIs(route + '/portal/document/order'));
  });

  it('validate agreement list', async () => {
    let list = element(by.css('tbody'));
    await list.all(by.css('tr')).then(async rows => {
      rows.forEach(row => {
        row.all(by.css('td')).then(async (data: any) => {
          expect(await data[1].getText()).to.match(/^DC\d{10}$/);
        });
      });
      length = rows.length;
    });
  });

  it('validate filters', async () => {
    agreementName = await element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-list-document-container/div/div/sbpro-card/div/div[2]/sbpro-list-document/form/div[3]/table/tbody/tr[1]/td[1]/span'
      )
    ).getText();
    status = await element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-list-document-container/div/div/sbpro-card/div/div[2]/sbpro-list-document/form/div[3]/table/tbody/tr[1]/td[6]/ngb-highlight'
      )
    ).getText();

    let searchInput = element(by.xpath('//*[@id="search-box"]'));
    let searchButton = element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-list-document-container/div/div/sbpro-card/div/div[2]/sbpro-list-document/form/div[1]/button[1]'
      )
    );
    let statusDropDown = element(
      by.cssContainingText('#statusList > option', status)
    );

    await searchInput.sendKeys(agreementName);
    await statusDropDown.click();
    await searchButton.click();

    let resultAgreement = await element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-list-document-container/div/div/sbpro-card/div/div[2]/sbpro-list-document/form/div[3]/table/tbody/tr[1]/td[1]/span'
        )
    ).getText();

    let resultStatus = await element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-list-document-container/div/div/sbpro-card/div/div[2]/sbpro-list-document/form/div[3]/table/tbody/tr[1]/td[6]/ngb-highlight'
      )
    ).getText();

    expect(resultAgreement).to.be.eq(agreementName);
    expect(resultStatus).to.be.eq(status);
  });
});
