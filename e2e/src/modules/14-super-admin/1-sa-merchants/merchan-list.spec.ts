import { expect } from 'chai';
import { environment } from '../../../../environmentTest';
import {
  browser,
  by,
  element,
  ElementFinder,
  ExpectedConditions as ec,
  logging
} from 'protractor';

describe('Merchants', () => {
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

  it('navigate', async () => {
    let nav = element(
      by.xpath(
        '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[1]/a'
      )
    );
    await browser.wait(ec.elementToBeClickable(nav), 5000);
    await nav.click();
    await browser.wait(
      ec.urlIs(environment.baseRoute + '/super-admin/merchant')
    );
  });

  it('no data available check', async () => {
    await element(by.buttonText('Clear')).click();

    await element(by.xpath('//*[@id="wildSearch"]')).sendKeys(
      'non-existing-merchant'
    );
    await element(by.buttonText('Search')).click();

    await browser.wait(
      ec.textToBePresentInElement(
        element(
          by.xpath(
            '/html/body/app-root/sbpro-merchant-page/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-merchant-list-page/div/div/div/div/sbpro-merchant-table/sbpro-card/div/div[2]/div[2]/div'
          )
        ),
        'No Data available'
      )
    );
    await browser.refresh();
  });

  it('add payee check', async () => {
    let link = element(
      by.css(
        '#layoutSidenav_content > main > sbpro-merchant-list-page > div > div > div > div > sbpro-merchant-table > sbpro-card > div > div.card-body.card-body-height-fixed.flex-container.align-self-stretch > div.table-responsive.pp-table-container.align-self-stretch.flex-grow-1.flex-stretch-1.table-striped > table > tbody > tr:nth-child(1) > td:nth-child(2) > a'
      )
    );
    await browser.wait(ec.elementToBeClickable(link));
    await link.click();
    let tab = element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-merchant-detail-admin-container/div/div/sbpro-card-navigation/div/div[1]/ul/li[6]'
      )
    );
    await browser.wait(ec.elementToBeClickable(tab));
    await tab.click();
    let addPayee = element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-merchant-detail-admin-container/div/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-payee-list/form/div[1]/div[2]/button[3]'
      )
    );
    await browser.wait(ec.elementToBeClickable(addPayee));
    await addPayee.click();
    let name = element(
      by.xpath(
        '/html/body/ngb-modal-window/div/div/sbpro-add-payee/sbpro-card/div/div[2]/form/div[1]/div[1]/div/label'
      )
    );
    await browser.wait(ec.presenceOf(name));
  });

  it('validate document links', async () => {
    await browser.get(`${environment.baseRoute}/super-admin/merchant`);
    await element(by.xpath('//*[@id="wildSearch"]')).sendKeys(
      environment.user1LoginId
    );
    await element(by.buttonText('Search')).click();
    let link = element(
      by.css(
        '#layoutSidenav_content > main > sbpro-merchant-list-page > div > div > div > div > sbpro-merchant-table > sbpro-card > div > div.card-body.card-body-height-fixed.flex-container.align-self-stretch > div.table-responsive.pp-table-container.align-self-stretch.flex-grow-1.flex-stretch-1.table-striped > table > tbody > tr:nth-child(1) > td:nth-child(2) > a'
      )
    );
    await browser.wait(ec.elementToBeClickable(link));
    await link.click();
    let tab = element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-merchant-detail-admin-container/div/div/sbpro-card-navigation/div/div[1]/ul/li[3]'
      )
    );
    await browser.wait(ec.elementToBeClickable(tab));
    await tab.click();

    let doc1 = element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-merchant-detail-admin-container/div/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-profile-document/div/div/div/div/form/div[2]/div/span/a'
      )
    );
    let doc2 = element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-merchant-detail-admin-container/div/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-profile-document/div/div/div/div/form/div[3]/div/span/a'
      )
    );
    let doc3 = element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-merchant-detail-admin-container/div/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-profile-document/div/div/div/div/form/div[4]/div/span/a'
      )
    );
    let doc4 = element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-merchant-detail-admin-container/div/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-profile-document/div/div/div/div/form/div[5]/div/span/a'
      )
    );
    let doc5 = element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-merchant-detail-admin-container/div/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-profile-document/div/div/div/div/form/div[6]/div/span/a'
      )
    );

    await browser.wait(ec.elementToBeClickable(doc1));
    await browser.wait(ec.elementToBeClickable(doc2));
    await browser.wait(ec.elementToBeClickable(doc3));
    await browser.wait(ec.elementToBeClickable(doc4));
    await browser.wait(ec.elementToBeClickable(doc5));
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
