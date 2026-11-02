import chai, { expect } from 'chai';
import {
  browser,
  by,
  element,
  ElementFinder,
  ExpectedConditions as ec,
  WebElement
} from 'protractor';
import { environment } from '../../../environmentTest';
import chaiHttp from 'chai-http';

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
        '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[9]/nav/sbpro-side-nav-item[2]'
      )
    );
    await browser.wait(ec.elementToBeClickable(subNav));
    await subNav.click();
    await browser.wait(ec.urlIs(route + '/portal/escrow-page/form'));
    browser.sleep(10000);
  });

  it('create escrow page', async () => {
    let next = element(
      by.xpath(
        '/html/body/app-root/sbpro-escrow-pages/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-escrow-pages-form/div/sbpro-create-form/sbpro-card/div/div/form/sbpro-app-button/button'
      )
    );
    await browser.wait(ec.elementToBeClickable(next));
    await next.click();

    let error = element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-escrow-pages-form/div/sbpro-create-form/sbpro-card/div/div/div/sbpro-alert/div'
      )
    );
    await browser.wait(ec.presenceOf(error));
    await browser.wait(
      ec.textToBePresentInElement(
        error,
        'Please provide a title for your page.'
      )
    );

    let name = element(by.xpath('//*[@id="title"]'));
    await browser.wait(ec.presenceOf(name));
    await name.sendKeys('test-deal');

    let account = element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-escrow-pages-form/div/sbpro-create-form/sbpro-card/div/div/form/div[2]/ng-select/div/div/div[2]/input'
      )
    );
    // await browser.wait(ec.elementToBeClickable(account));
    await account.click();
    await account.sendKeys(environment.transferAccountName);
    let accountOption = element.all(by.css('.ng-option')).first();
    await browser.wait(ec.visibilityOf(accountOption), 2000);
    await accountOption.click();

    await next.click();
  });

  it('property details', async () => {
    let next = element(by.xpath('//*[@id="input"]/span'));
    await browser.wait(ec.elementToBeClickable(next));
    await next.click();

    let error = element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-escrow-pages-form/div/sbpro-create-form/sbpro-card/div/div/div/sbpro-alert/div'
      )
    );
    await browser.wait(ec.presenceOf(error));
    await browser.wait(
      ec.textToBePresentInElement(error, 'Deal/Property Name is required')
    );

    let dealName = element(
      by.xpath(
        '//*[@id="cdk-drop-list-0"]/div[1]/sbpro-escrow-page-field-text/div/input'
      )
    );
    await browser.wait(ec.presenceOf(dealName));
    await dealName.sendKeys('test-deal');

    let desc = element(
      by.xpath(
        '//*[@id="cdk-drop-list-0"]/div[2]/sbpro-escrow-page-field-text/div/input'
      )
    );
    await browser.wait(ec.presenceOf(desc));
    await desc.sendKeys('test-deal-desc');

    await next.click();
  });

  it('empty field label', async () => {
    let addField = element(by.cssContainingText('button', '+ Add Field'));
    await browser.wait(ec.elementToBeClickable(addField));
    await addField.click();

    browser.sleep(5000);
    let label = element(by.css('#label'));
    await browser.wait(ec.presenceOf(label));
    await label.sendKeys('');

    let addBtn = element(
      by.cssContainingText(
        'body > ngb-modal-window > div > div > sbpro-escrow-page-field-edit-modal > sbpro-card > div > div.card-footer > button',
        'Add'
      )
    );
    await browser.wait(ec.elementToBeClickable(addBtn));
    await addBtn.click();
    browser.sleep(5000);

    let error = element(
      by.xpath(
        '/html/body/ngb-modal-window/div/div/sbpro-escrow-page-field-edit-modal/sbpro-card/div/div[2]/form/div[1]/sbpro-alert/div/span'
      )
    );
    await browser.wait(
      ec.textToBePresentInElement(error, 'Please prove a label.')
    );
    browser.sleep(5000);

    await browser.get(route + '/portal/escrow-page');
  });

  it('navigate', async () => {
    let nav = element(
      by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[9]')
    );
    await browser.wait(ec.elementToBeClickable(nav), 5000);
    await nav.click();
    let subNav = element(
      by.xpath(
        '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[9]/nav/sbpro-side-nav-item[2]'
      )
    );
    await browser.wait(ec.elementToBeClickable(subNav));
    await subNav.click();
    await browser.wait(ec.urlIs(route + '/portal/escrow-page/form'));
    browser.sleep(10000);
  });

  it('create escrow page', async () => {
    let next = element(
      by.xpath(
        '/html/body/app-root/sbpro-escrow-pages/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-escrow-pages-form/div/sbpro-create-form/sbpro-card/div/div/form/sbpro-app-button/button'
      )
    );
    await browser.wait(ec.elementToBeClickable(next));
    await next.click();

    let error = element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-escrow-pages-form/div/sbpro-create-form/sbpro-card/div/div/div/sbpro-alert/div'
      )
    );
    await browser.wait(ec.presenceOf(error));
    await browser.wait(
      ec.textToBePresentInElement(
        error,
        'Please provide a title for your page.'
      )
    );

    let name = element(by.xpath('//*[@id="title"]'));
    await browser.wait(ec.presenceOf(name));
    await name.sendKeys(template);

    let account = element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-escrow-pages-form/div/sbpro-create-form/sbpro-card/div/div/form/div[2]/ng-select/div/div/div[2]/input'
      )
    );
    // await browser.wait(ec.elementToBeClickable(account));
    await account.click();
    await account.sendKeys(environment.transferAccountName);
    let accountOption = element.all(by.css('.ng-option')).first();
    await browser.wait(ec.visibilityOf(accountOption), 2000);
    await accountOption.click();

    await next.click();
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
  });

  it('deal not created check', async () => {
    let templateName = element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-escrow-pages-list/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr[1]/td[1]'
      )
    );
    await browser.wait(ec.presenceOf(templateName));
    expect(await templateName.getText()).to.be.not.eq(template);
  });
});
