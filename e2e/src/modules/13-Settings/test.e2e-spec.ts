import { expect } from 'chai';
import {
  browser,
  by,
  element,
  logging,
  ExpectedConditions as ec,
  ElementFinder
} from 'protractor';
import {environment} from '../../../environmentTest'

describe('Settings', () => {
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
      await browser.wait(ec.urlContains('dashboard'),5000)
      expect(await browser.getCurrentUrl()).to.equal(
        `${environment.baseRoute}/dashboard`
      );
    });

    it('Password Reset tab details should load', async() =>{
      await element(by.xpath('//*[@id="sidenavAccordion"]/div[2]/div/span')).click();
      //await browser.sleep(2000);
      await browser.wait(ec.textToBePresentInElement(element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-profile-overview/sbpro-dashboard-head/div/div/div/h1/span')),'Profile settings'),5000)
      expect(await browser.isElementPresent(element(by.xpath('//*[@id="currentPassword"]')))).to.equal(true);
      expect(await browser.isElementPresent(element(by.xpath('//*[@id="newPassword"]')))).to.equal(true);
      expect(await browser.isElementPresent(element(by.xpath('//*[@id="confirmPassword"]')))).to.equal(true);

    })
    it('2 Factor Authentication tab details should load', async() =>{
      await element(by.xpath('//*[@id="tabs"]/div/div[1]/ul/li[2]/a')).click();
      //await browser.sleep(3000);
      await browser.wait(ec.textToBePresentInElement(element(by.xpath('//*[@id="tabs"]/div/div[2]/div/div/sbpro-g-auth/div/div/div/div[2]/div/button')),'Enable 2-Factor Authentication'),5000)
      //expect(await browser.isElementPresent(element(by.xpath('//*[@id="tabs"]/div/div[2]/div/div/sbpro-g-auth/div/div/div/div[2]/div/button')))).to.equal(true)
    })
    // it('API Credentials tab details should load', async() =>{
    //   await element(by.xpath('//*[@id="tabs"]/div/div[1]/ul/li[3]/a')).click();
    //   console.log('api credentials clicked')
    //   await browser.sleep(2000);
    //   console.log('browser wait complete ')
    //   expect(await browser.isElementPresent(element(by.js('document.querySelector("#tabs > div > div.card-body > div > div > sbpro-api-credentials > div > div > div > div > div > button")')))).to.equal(true)
    // })
    it('Notifications tab details should load', async() =>{
      await element(by.xpath('//*[@id="tabs"]/div/div[1]/ul/li[4]/a')).click();
      //await browser.sleep(3000);
      await browser.wait(ec.textToBePresentInElement(element(by.xpath('//*[@id="tabs"]/div/div[2]/div/div/sbpro-notification-settings/h4')),'Notification Settings'),5000)
      expect(await element(by.xpath('//*[@id="tabs"]/div/div[2]/div/div/sbpro-notification-settings/table/div[1]/div[2]/span')).getText()).to.not.equal("")
      expect(await element(by.xpath('//*[@id="tabs"]/div/div[2]/div/div/sbpro-notification-settings/table/div[2]/div[2]/span')).getText()).to.not.equal("")

    })
});
