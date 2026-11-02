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

describe('Profile', () => {
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

    it('Profile tab basic details should be populated', async()=>{
      await element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[10]/a')).click()
      
      //await browser.sleep(5000);
      await browser.wait(ec.textToBePresentInElement(element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-profile-overview/sbpro-dashboard-head/div/div/div/h1/span')),'Business Profile'),5000)
      expect(await element(by.id('business-name')).getAttribute("value")).to.not.equal("")
      expect(await element(by.id('business-type-input')).getAttribute("value")).to.not.equal("")
      expect(await element(by.xpath('//*[@id="gstNo"]')).getAttribute("value")).to.not.equal("")
      expect(await element(by.xpath('//*[@id="companyPan"]')).getAttribute("value")).to.not.equal("")
      expect(await element(by.xpath('//*[@id="firstName"] ')).getAttribute("value")).to.not.equal("")
      expect(await element(by.xpath('//*[@id="lastName"]')).getAttribute("value")).to.not.equal("")
      //expect(await element(by.xpath('//*[@id="authorizedPersonForm"]')).getAttribute("value")).to.not.equal("")
    })

    it('Documents tab basic details should be populated', async()=>{
      await element(by.xpath('//*[@id="tabs"]/div/div[1]/ul/li[2]/a')).click();
      // await browser.sleep(2000);
      
      await browser.wait(ec.textToBePresentInElement(element(by.xpath('//*[@id="tabs"]/div/div[2]/div/div/sbpro-profile-document/div/div/div/div/h4')),'Business Documents'),5000)
      expect(await element(by.xpath('//*[@id="tabs"]/div/div[2]/div/div/sbpro-profile-document/div/div/div/div/form/div[2]/div/span/a')).getText()).to.not.equal("")
      expect(await element(by.xpath('//*[@id="tabs"]/div/div[2]/div/div/sbpro-profile-document/div/div/div/div/form/div[3]/div/span/a')).getText()).to.not.equal("")
      expect(await element(by.xpath('//*[@id="tabs"]/div/div[2]/div/div/sbpro-profile-document/div/div/div/div/form/div[4]/div/span/a')).getText()).to.not.equal("")
      expect(await element(by.xpath('//*[@id="tabs"]/div/div[2]/div/div/sbpro-profile-document/div/div/div/div/form/div[5]/div/span/a')).getText()).to.not.equal("")
      expect(await element(by.xpath('//*[@id="tabs"]/div/div[2]/div/div/sbpro-profile-document/div/div/div/div/form/div[6]/div/span/a')).getText()).to.not.equal("")
      //expect(await element(by.xpath('//*[@id="tabs"]/div/div[2]/div/div/sbpro-profile-document/div/div/div/div/form/div[7]/div/span/a')).getText()).to.not.equal("")
    })

    it('Bank Details tab basic details should be populated', async ()=>{
      await element(by.xpath('//*[@id="tabs"]/div/div[1]/ul/li[3]/a')).click();
      //await browser.sleep(2000);
      await browser.wait(ec.textToBePresentInElement(element(by.xpath('//*[@id="tabs"]/div/div[2]/div/div/sbpro-profile-bank-details/div/div[2]/form/div/h4')),'Bank Details'),5000)
      expect(await element(by.xpath('//*[@id="accno"]')).getAttribute("value")).to.not.equal("")
      expect(await element(by.xpath('//*[@id="bankname"]')).getAttribute("value")).to.not.equal("")
      expect(await element(by.xpath('//*[@id="ifsc"]')).getAttribute("value")).to.not.equal("")
    })  
});
