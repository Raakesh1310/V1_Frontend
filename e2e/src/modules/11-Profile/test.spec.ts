import { expect } from 'chai';
import {
  browser,
  by,
  element,
  logging,
  ExpectedConditions as ec,
  ElementFinder
} from 'protractor';
import { environment } from '../../../environmentTest';

describe('Login-DashBoard-Profile-Settings', () => {
  let emailAddressInput!: ElementFinder;
  let passwordInput!: ElementFinder;
  let submitButton!: ElementFinder;

  it('Login should Work Fine', async () => {
    await browser.get(`${environment.baseRoute}/auth/login`);
    emailAddressInput = element(by.id('inputEmailAddress'));
    passwordInput = element(by.id('inputPassword'));
    submitButton = element(by.id('input'));
    await emailAddressInput.sendKeys(environment.InactiveUserLoginId);
    await passwordInput.sendKeys(environment.InactiveUserLoginPassword);
    await submitButton.click();
    await browser.wait(ec.urlIs(`${environment.baseRoute}/dashboard`));
  });

  it('before KYC', async () => {
    let msg = element(
      by.xpath(
        '//*[@id="layoutSidenav_content"]/main/sbpro-dashboard-overview/div/div[2]/sbpro-alert/div/u'
      )
    );
    await browser.wait(ec.elementToBeClickable(msg));

    await element(
      by.xpath(
        '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[2]/a'
      )
    ).click();
    await element(
      by.xpath(
        '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[2]/nav/sbpro-side-nav-item[1]/a'
      )
    ).click();
    await browser.wait(
      ec.textToBePresentInElement(
        element(
          by.xpath(
            '//*[@id="layoutSidenav_content"]/main/sbpro-profile-overview/sbpro-dashboard-head/div/div/div/h1/span'
          )
        ),
        'Business Profile'
      )
    );

    await element(
      by.xpath(
        '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[2]/nav/sbpro-side-nav-item[2]/a'
      )
    ).click();
    await browser.wait(
      ec.textToBePresentInElement(
        element(
          by.xpath(
            '//*[@id="layoutSidenav_content"]/main/sbpro-profile-overview/sbpro-dashboard-head/div/div/div/h1/span'
          )
        ),
        'Business Profile'
      )
    );

    await element(
      by.xpath(
        '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[3]/a'
      )
    ).click();
    await browser.wait(
      ec.textToBePresentInElement(
        element(
          by.xpath(
            '//*[@id="layoutSidenav_content"]/main/sbpro-profile-overview/sbpro-dashboard-head/div/div/div/h1/span'
          )
        ),
        'Business Profile'
      )
    );

    await element(
      by.xpath(
        '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[5]/a'
      )
    ).click();
    await element(
      by.xpath(
        '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[5]/nav/sbpro-side-nav-item[1]/a'
      )
    ).click();
    await browser.wait(
      ec.textToBePresentInElement(
        element(
          by.xpath(
            '//*[@id="layoutSidenav_content"]/main/sbpro-profile-overview/sbpro-dashboard-head/div/div/div/h1/span'
          )
        ),
        'Business Profile'
      )
    );

    await element(
      by.xpath(
        '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[5]/nav/sbpro-side-nav-item[2]/a'
      )
    ).click();
    await browser.wait(
      ec.textToBePresentInElement(
        element(
          by.xpath(
            '//*[@id="layoutSidenav_content"]/main/sbpro-profile-overview/sbpro-dashboard-head/div/div/div/h1/span'
          )
        ),
        'Business Profile'
      )
    );

    await element(
      by.xpath(
        '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[7]/a'
      )
    ).click();
    await browser.wait(
      ec.textToBePresentInElement(
        element(
          by.xpath(
            '//*[@id="layoutSidenav_content"]/main/sbpro-profile-overview/sbpro-dashboard-head/div/div/div/h1/span'
          )
        ),
        'Business Profile'
      )
    );

    await element(
      by.xpath(
        '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[8]/a'
      )
    ).click();
    await element(
      by.xpath(
        '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[8]/nav/sbpro-side-nav-item[1]/a'
      )
    ).click();
    await browser.wait(
      ec.textToBePresentInElement(
        element(
          by.xpath(
            '//*[@id="layoutSidenav_content"]/main/sbpro-profile-overview/sbpro-dashboard-head/div/div/div/h1/span'
          )
        ),
        'Business Profile'
      )
    );

    await element(
      by.xpath(
        '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[8]/nav/sbpro-side-nav-item[2]/a'
      )
    ).click();
    await browser.wait(
      ec.textToBePresentInElement(
        element(
          by.xpath(
            '//*[@id="layoutSidenav_content"]/main/sbpro-profile-overview/sbpro-dashboard-head/div/div/div/h1/span'
          )
        ),
        'Business Profile'
      )
    );
  });
});
