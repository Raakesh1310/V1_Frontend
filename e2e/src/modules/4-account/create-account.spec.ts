import chai, { expect } from 'chai';
import { browser, by, element, ExpectedConditions as ec } from 'protractor';
import { environment } from '../../../environmentTest';
import chaiHttp from 'chai-http';
import path from 'path';

chai.use(chaiHttp);
chai.use(require('chai-match'));

let route = environment.baseRoute;

describe('Create Deal', () => {
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
      by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[2]')
    );
    await browser.wait(ec.elementToBeClickable(nav), 5000);
    await nav.click();
    let subNav = element(
      by.xpath(
        '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[2]/nav/sbpro-side-nav-item[2]'
      )
    );
    await browser.wait(ec.elementToBeClickable(subNav), 5000);
    await subNav.click();

    let infobox = element(
      by.xpath('/html/body/ngb-modal-window/div/div/div[1]')
    );
    await browser.wait(
      ec.textToBePresentInElement(infobox, 'Information Message')
    );

    let proceed = element(
      by.xpath('/html/body/ngb-modal-window/div/div/div[3]/button[1]')
    );
    await browser.wait(ec.elementToBeClickable(proceed));
    await proceed.click();

    await browser.wait(ec.urlIs(route + '/portal/account/form'));
  });

  it('form validation', async () => {
    let accountName = element(by.xpath('//*[@id="frm-cntrl-name"]'));
    await accountName.sendKeys('test-account');
    let purpose = element(by.xpath('//*[@id="frm-cntrl-purpose"]'));
    await purpose.sendKeys('testing');
    let email = element(by.xpath('//*[@id="frm-cntrl-email"]'));
    await email.sendKeys(environment.user1LoginId);
    let validity = element(by.xpath('//*[@id="frm-cntrl-validity"]'));
    await validity.sendKeys('12');
    let calendar = element(by.xpath('//*[@id="frm-cntrl-start-date"]'));
    await calendar.click();
    let month = element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-accounts-form-page/div/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-account-description-form/div/div/form/div[5]/ngb-datepicker/div[1]/ngb-datepicker-navigation/ngb-datepicker-navigation-select/select[2]/option[6]'
      )
    );
    await browser.wait(ec.elementToBeClickable(month), 5000);
    await month.click();
    let date = element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-accounts-form-page/div/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-account-description-form/div/div/form/div[5]/ngb-datepicker/div[2]/div/ngb-datepicker-month-view/div[4]/div[2]/div'
      )
    );
    await browser.wait(ec.elementToBeClickable(date), 5000);
    await date.click();
    let next = element(by.cssContainingText('#input', 'Next'));
    await next.click();

    let payee1 = element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-accounts-form-page/div/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-account-payee-form/form/div[2]/div[1]/div/ng-select/div/div/div[2]/input'
      )
    );
    await payee1.click();
    await payee1.sendKeys('');
    let payeeOption1 = element.all(by.css('.ng-option')).first();
    await browser.wait(ec.visibilityOf(payeeOption1), 2000);
    await payeeOption1.click();

    let share1 = element(by.css('#frm-cntrl-email'));
    await share1.sendKeys('24');
    let add = element(by.cssContainingText('#input', 'ADD'));
    await add.click();

    let payee2 = element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-accounts-form-page/div/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-account-payee-form/form/div[2]/div[1]/div/ng-select/div/div/div[2]/input'
      )
    );
    await payee2.click();
    await payee2.sendKeys('');
    let payeeOption2 = element.all(by.css('.ng-option')).first();
    await browser.wait(ec.visibilityOf(payeeOption2), 2000);
    await payeeOption2.click();

    let share2 = element(by.css('#frm-cntrl-email'));
    await share2.sendKeys('24');
    await add.click();
    await next.click();

    let drpdwn = element(by.xpath('//*[@id="frm-cntrl-email"]'));
    await browser.wait(ec.elementToBeClickable(drpdwn));
    await drpdwn.click();

    let docType = element(by.xpath('//*[@id="frm-cntrl-email"]/option[3]'));
    await browser.wait(ec.elementToBeClickable(docType));
    await docType.click();
    let upload = element(by.css('#ndocs'));
    let absolutePath = path.resolve(environment.testFile);
    await upload.sendKeys(absolutePath);

    browser.sleep(6000);

    await browser.wait(
      ec.textToBePresentInElement(
        element(
          by.xpath(
            '//*[@id="layoutSidenav_content"]/main/sbpro-accounts-form-page/div/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-account-document-form/div/div/table/tbody/tr/td[1]'
          )
        ),
        '1'
      )
    );

    let activate = element(by.buttonText('Activate'));
    await browser.wait(ec.elementToBeClickable(activate));
    await activate.click();

    // let payeetab = element(
    //   by.xpath(
    //     '//*[@id="layoutSidenav_content"]/main/sbpro-accounts-form-page/div/div/sbpro-card-navigation/div/div[1]/ul/li[2]'
    //   )
    // );
    // await payeetab.click();

    // let del = element(by.buttonText('Delete'));
    // await browser.wait(ec.elementToBeClickable(del));
    // await del.click();

    // let docTab = element(
    //   by.xpath(
    //     '//*[@id="layoutSidenav_content"]/main/sbpro-accounts-form-page/div/div/sbpro-card-navigation/div/div[1]/ul/li[3]'
    //   )
    // );
    // await browser.wait(ec.elementToBeClickable(docTab));
    // await docTab.click();
  });
});
