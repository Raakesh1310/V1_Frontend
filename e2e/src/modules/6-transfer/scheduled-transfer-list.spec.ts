import chai, { expect } from 'chai';
import { browser, by, element, ExpectedConditions as ec } from 'protractor';
import { environment } from '../../../environmentTest';
import chaiHttp from 'chai-http';

chai.use(chaiHttp);
chai.use(require('chai-match'));

let route = environment.baseRoute;

describe('Scheduled Transfer List', () => {
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
        '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[4]/nav/sbpro-side-nav-item[2]'
      )
    );
    await browser.wait(ec.elementToBeClickable(subNav), 5000);
    await subNav.click();
    await browser.wait(ec.urlIs(route + '/portal/transfer/scheduled'));
  });

  it('validate search', async () => {
    let list = await element.all(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-scheduled-transfer-container/div/div/div/sbpro-card/div/div[2]/sbpro-scheduled-transfer/div/div/table/tbody/tr'
      )
    );
    let searchInput = element(by.xpath('//*[@id="search-box"]'));
    let search = element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-scheduled-transfer-container/div/div/div/sbpro-card/div/div[2]/sbpro-scheduled-transfer/div/form/div/div[2]/button[1]'
      )
    );
    let lastindex = list.length;
    let rt = element(
      by.xpath(
        `//*[@id="layoutSidenav_content"]/main/sbpro-scheduled-transfer-container/div/div/div/sbpro-card/div/div[2]/sbpro-scheduled-transfer/div/div/table/tbody/tr[${lastindex}]/td[1]`
      )
    );

    await browser.wait(ec.presenceOf(searchInput));
    await browser.wait(ec.presenceOf(search));
    await browser.wait(ec.presenceOf(rt));
    let rtId = await rt.getText();
    searchInput.sendKeys(rtId);
    await search.click();

    let rtResult = element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-scheduled-transfer-container/div/div/div/sbpro-card/div/div[2]/sbpro-scheduled-transfer/div/div/table/tbody/tr[1]/td[1]'
      )
    );
    await browser.wait(ec.textToBePresentInElement(rtResult, rtId));

    let clear = element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-scheduled-transfer-container/div/div/div/sbpro-card/div/div[2]/sbpro-scheduled-transfer/div/form/div/div[2]/button[2]'
      )
    );
    await browser.wait(ec.elementToBeClickable(clear));
    await clear.click();
  });

  it('Validate list', async () => {
    let list = await element.all(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-scheduled-transfer-container/div/div/div/sbpro-card/div/div[2]/sbpro-scheduled-transfer/div/div/table/tbody/tr'
      )
    );

    list.forEach(async (row, i) => {
      let rtId = element(
        by.xpath(
          `//*[@id="layoutSidenav_content"]/main/sbpro-scheduled-transfer-container/div/div/div/sbpro-card/div/div[2]/sbpro-scheduled-transfer/div/div/table/tbody/tr[${i +
            1}]/td[1]`
        )
      );
      expect(await rtId.getText()).to.match(/^RT\d{9}$/);
      let accountId = element(
        by.xpath(
          `//*[@id="layoutSidenav_content"]/main/sbpro-scheduled-transfer-container/div/div/div/sbpro-card/div/div[2]/sbpro-scheduled-transfer/div/div/table/tbody/tr[${i +
            1}]/td[2]`
        )
      );
      expect(await accountId.getText()).to.match(/^PPAY\d{10}$/);
    });
  });
});
