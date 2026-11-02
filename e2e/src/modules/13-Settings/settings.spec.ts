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
    await emailAddressInput.sendKeys(environment.user1LoginId);
    await passwordInput.sendKeys(environment.user1LoginPassword);
    await submitButton.click();
    await browser.wait(ec.urlContains('dashboard'), 5000);
    expect(await browser.getCurrentUrl()).to.equal(
      `${environment.baseRoute}/dashboard`
    );
  });

  it('Password Reset tab details should load', async () => {
    await element(
      by.xpath('//*[@id="sidenavAccordion"]/div[2]/div/span')
    ).click();
    //await browser.sleep(2000);
    await browser.wait(
      ec.textToBePresentInElement(
        element(
          by.xpath(
            '//*[@id="layoutSidenav_content"]/main/sbpro-profile-overview/sbpro-dashboard-head/div/div/div/h1/span'
          )
        ),
        'Profile settings'
      ),
      5000
    );
    expect(
      await browser.isElementPresent(
        element(by.xpath('//*[@id="currentPassword"]'))
      )
    ).to.equal(true);
    expect(
      await browser.isElementPresent(
        element(by.xpath('//*[@id="newPassword"]'))
      )
    ).to.equal(true);
    expect(
      await browser.isElementPresent(
        element(by.xpath('//*[@id="confirmPassword"]'))
      )
    ).to.equal(true);
    await element(by.xpath('//*[@id="currentPassword"]')).sendKeys(
      environment.user1LoginId
    );
    await element(by.xpath('//*[@id="newPassword"]')).sendKeys('Hello@123');
    await element(by.xpath('//*[@id="confirmPassword"]')).sendKeys('Hello@123');
    await element(
      by.xpath(
        '//*[@id="tabs"]/div/div[2]/div/div/sbpro-profile-password-reset/div/form/button'
      )
    ).click();

    await browser.wait(
      ec.presenceOf(
        element(
          by.xpath(
            '/html/body/ngb-modal-window/div/div/sbpro-otp-modal/sbpro-card/div/div[3]/button'
          )
        )
      )
    );

    await element(
      by.xpath(
        '/html/body/ngb-modal-window/div/div/sbpro-otp-modal/sbpro-card/div/div[1]/button/i-feather'
      )
    ).click();
  });
  it('2 Factor Authentication tab details should load', async () => {
    let tab = element(by.xpath('//*[@id="tabs"]/div/div[1]/ul/li[2]/a'));
    await tab.click();
    let gen = element(
      by.css(
        '#tabs > div > div.card-body > div > div > sbpro-g-auth > div > div > div > div:nth-child(2) > div > button'
      )
    );
    await browser.wait(ec.elementToBeClickable(gen));
    await gen.click();
    await browser.wait(
      ec.presenceOf(
        element(
          by.xpath(
            '//*[@id="tabs"]/div/div[2]/div/div/sbpro-g-auth/div/div/div/div[2]/div/img'
          )
        )
      )
    );
  });
  it('API Credentials tab details should load', async () => {
    let tab = element(by.xpath('//*[@id="tabs"]/div/div[1]/ul/li[3]/a'));
    await tab.click();

    let create = element(
      by.css(
        '#tabs > div > div.card-body > div > div > sbpro-api-credentials > div > div > div > div > div > button'
      )
    );
    await browser.wait(ec.elementToBeClickable(create));
    await create.click();
    let delngen = element(
      by.css(
        '#tabs > div > div.card-body > div > div > sbpro-api-credentials > div > div > div > div > div > button:nth-child(7)'
      )
    );
    await browser.wait(ec.elementToBeClickable(delngen));
    await delngen.click();

    let apiKey = element(
      by.css(
        '#tabs > div > div.card-body > div > div > sbpro-api-credentials > div > div > div > div > div > p:nth-child(1)'
      )
    );
    await browser.wait(ec.presenceOf(apiKey));

    let del = element(
      by.css(
        '#tabs > div > div.card-body > div > div > sbpro-api-credentials > div > div > div > div > div > button:nth-child(6)'
      )
    );
    await browser.wait(ec.elementToBeClickable(del));
    await del.click();

    let noApi = element(
      by.css(
        '#tabs > div > div.card-body > div > div > sbpro-api-credentials > div > div > div > div > div > p'
      )
    );
    await browser.wait(ec.textToBePresentInElement(noApi, 'No Api Key Found'));

    // await element(
    //   by.xpath(
    //     '/html/body/app-root/sbpro-profile/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-profile-overview/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-api-credentials/div/div/div/div/div/button'
    //   )
    // ).click();
    // browser.sleep(5000);
    // let apiKey = element(
    //   by.xpath(
    //     '//*[@id="tabs"]/div/div[2]/div/div/sbpro-api-credentials/div/div/div/div/div/p[1]'
    //   )
    // );
    // await browser.wait(ec.presenceOf(apiKey));
  });
});
