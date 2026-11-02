import { expect } from 'chai';
import {
  browser,
  by,
  element,
  logging,
  ExpectedConditions as ec,
  ElementFinder,
  WebElement
} from 'protractor';
import fs from 'fs';
import path from 'path';
import faker  from 'faker';
import { environment } from '../../../environmentTest'
import { MailClient } from '../../helpers/mail.po';
import { newEmailData } from '../../interfaces/newEmailData.interface';


describe('manage Teams', () => {


        let mClient: MailClient;
        let emailAddressInput!: ElementFinder;
        let passwordInput!: ElementFinder;
        let submitButton!: ElementFinder;
        it('Login should Work Fine', async () => {
          await browser.get(`${environment.baseRoute}/auth/login`);
          emailAddressInput = element(by.id('inputEmailAddress'));
          passwordInput = element(by.id('inputPassword'));
          submitButton = element(by.id('input'));
          await emailAddressInput.sendKeys(environment.user2LoginId);
          await passwordInput.sendKeys(environment.user2LoginPassword);
          await submitButton.click();
          await browser.wait(ec.urlContains('dashboard'),5000)
          expect(await browser.getCurrentUrl()).to.equal(
            `${environment.baseRoute}/dashboard`
          );
        });
      
        it('all fields should load properly as expected', async ()=>{
            await element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[9]/a')).click()
            expect(await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-manage-team-overview/div/sbpro-card/div/div[1]')).getText()).to.equal('Manage Team')
            expect(await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-manage-team-overview/div/sbpro-card/div/div[1]')).getText()).to.equal('Manage Team')
            expect(await browser.isElementPresent(element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-manage-team-overview/div/sbpro-card/div/div[2]/sbpro-manage-team/div/div[1]/button')))).to.equal(true)
            expect(await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-manage-team-overview/div/sbpro-card/div/div[2]/sbpro-manage-team/div/div[1]/button')).getText()).to.equal('Invite New Member')
            expect(await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-manage-team-overview/div/sbpro-card/div/div[2]/sbpro-manage-team/div/div[2]/h4')).getText()).to.equal('Team Members')

        })

        it('there should be at least one team member in the team', async ()=>{
            
            const rowCount = await element.all(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-manage-team-overview/div/sbpro-card/div/div[2]/sbpro-manage-team/div/div[2]/div/table/tbody/tr')).count()
            expect(rowCount).to.greaterThan(0)
        })

        it('Invite new member and resend should work', async()=>{
            await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-manage-team-overview/div/sbpro-card/div/div[2]/sbpro-manage-team/div/div[1]/button')).click()
            //browser.sleep(2000)
            await browser.wait(ec.textToBePresentInElement(element(by.xpath('/html/body/ngb-modal-window/div/div/div[1]/h4')),'Invite New Member'),5000)
            let firstName = element(by.xpath('//*[@id="inputFName"]'));
            let lastName = element(by.xpath('//*[@id="inputLName"]'));
            let phone = element(by.xpath('//*[@id="inputPhone"]'));
            let email = element(by.xpath('//*[@id="inputEmailAddress"]'));
            let role = element(by.xpath('//*[@id="role"]'));
            let demo_email = 'rtra6@gmail.com'
            expect(await browser.isElementPresent(firstName))
            expect(await browser.isElementPresent(lastName))
            expect(await browser.isElementPresent(phone))
            expect(await browser.isElementPresent(email)).to.equal(true)
            expect(await browser.isElementPresent(role))
            firstName.sendKeys(faker.name.firstName())
            lastName.sendKeys(faker.name.lastName())
            email.sendKeys(demo_email)
            phone.sendKeys(faker.phone.phoneNumber())
            await role.click();
            await browser.wait(ec.visibilityOf(element(by.tagName('option'))),5000)
            let options = await element.all(by.tagName('option'))
            await options[2].click()
            await browser.sleep(2000);
            await element(by.buttonText('Invite')).click()
            await browser.sleep(4000)

            mClient = new MailClient();
            await mClient.connectMail();
            const emailCount = await mClient.getEmailCount();
            const newEmail = (emailCount) 
            ? await mClient.getEmail(typeof emailCount === 'number' && environment.isMailOrderReverse ? emailCount as number : 1)
            : '';
          const newEmailData = typeof newEmail === 'object' 
            ? newEmail as newEmailData 
            : {emailSubject: '', emailBody: ''};

            //let emailInfo  = await mClient.getEmailBody(newEmailData.emailBody);
              //console.log(emailInfo);
              //console.log('EmailBody ='+ newEmailData.emailBody);
              let getEmail = newEmailData.emailBody;
              console.log(getEmail);
              let getEmailLogin = await mClient.getEmailUser(newEmailData.emailBody);
              //console.log(getEmailLogin);
              let getEmailPassword = await mClient.getEmailPassword(getEmail);
              //console.log(getEmailPassword);
              await browser.get(`https://myescrow-uat.ncome.in/auth/login`);
              expect(browser.isElementPresent(element(by.xpath('//*[@id="input"]'))))
              emailAddressInput = element(by.id('inputEmailAddress'));
              passwordInput = element(by.id('inputPassword'));
              submitButton = element(by.id('input'));
              await emailAddressInput.sendKeys(getEmailLogin? getEmailLogin:" ");
              await passwordInput.sendKeys(getEmailPassword?getEmailPassword:" ");
              await submitButton.click();
              await browser.wait(ec.urlContains('dashboard'),5000)
              expect(await browser.getCurrentUrl()).to.equal(
                `${environment.baseRoute}/dashboard`
              );
              expect( await browser.isElementPresent(element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[2]/a')))).to.equal(true);
              expect( await browser.isElementPresent(element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[3]/a')))).to.equal(true);
              expect( await browser.isElementPresent(element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[4]/a')))).not.to.be.equal(true);



            // let invites = element.all(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-manage-team-overview/div/sbpro-card/div/div[2]/sbpro-manage-team/div/div[1]/div/div/div/div/table/tbody/tr'))
            // let invitesCount = await invites.count();
            // expect(invitesCount).to.greaterThan(0);
            // expect(await element(by.xpath(`//*[@id="layoutSidenav_content"]/main/sbpro-manage-team-overview/div/sbpro-card/div/div[2]/sbpro-manage-team/div/div[1]/div/div/div/div/table/tbody/tr[${invitesCount}]/td[2]`)).getText()).to.equal(demo_email)
            // await element(by.xpath(`//*[@id="layoutSidenav_content"]/main/sbpro-manage-team-overview/div/sbpro-card/div/div[2]/sbpro-manage-team/div/div[1]/div/div/div/div/table/tbody/tr[${invitesCount}]/td[4]/button[1]`)).click()
            // expect(await element(by.xpath('//*[@id="inputEmailAddress"]')).getText()).to.equal(demo_email)
            // expect(await browser.isElementPresent(element(by.xpath('/html/body/ngb-modal-window/div/div/div[3]/button[1]')))).to.equal(true)
            // await element(by.xpath('/html/body/ngb-modal-window/div/div/div[3]/button[1]')).click()
        })

        it('Invite new member as ADMIN and resend should work ', async()=>{
          await browser.get(`${environment.baseRoute}/auth/login`);
          emailAddressInput = element(by.id('inputEmailAddress'));
          passwordInput = element(by.id('inputPassword'));
          submitButton = element(by.id('input'));
          await emailAddressInput.sendKeys(environment.user2LoginId);
          await passwordInput.sendKeys(environment.user2LoginPassword);
          await submitButton.click();
          await element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[7]/a')).click()
          await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-manage-team-overview/div/sbpro-card/div/div[2]/sbpro-manage-team/div/div[1]/button')).click()
          //browser.sleep(2000)
          await browser.wait(ec.textToBePresentInElement(element(by.xpath('/html/body/ngb-modal-window/div/div/div[1]/h4')),'Invite New Member'),5000)
          let firstName = element(by.xpath('//*[@id="inputFName"]'));
          let lastName = element(by.xpath('//*[@id="inputLName"]'));
          let phone = element(by.xpath('//*[@id="inputPhone"]'));
          let email = element(by.xpath('//*[@id="inputEmailAddress"]'));
          let role = element(by.xpath('//*[@id="role"]'));
          let demo_email = 'rtra2a@gmail.com'

          expect(await browser.isElementPresent(firstName))
          expect(await browser.isElementPresent(lastName))
          expect(await browser.isElementPresent(phone))
          expect(await browser.isElementPresent(email)).to.equal(true)
          expect(await browser.isElementPresent(role))
          firstName.sendKeys(faker.name.firstName())
          lastName.sendKeys(faker.name.lastName())
          email.sendKeys(demo_email)
          phone.sendKeys(faker.phone.phoneNumber())
          await role.click();
          await browser.wait(ec.visibilityOf(element(by.tagName('option'))),5000)
          let options = await element.all(by.tagName('option'))
          await options[1].click()
          await browser.sleep(2000);
          await element(by.buttonText('Invite')).click()
          await browser.sleep(4000)

          mClient = new MailClient();
          await mClient.connectMail();
          const emailCount = await mClient.getEmailCount();
          const newEmail = (emailCount) 
          ? await mClient.getEmail(typeof emailCount === 'number' && environment.isMailOrderReverse ? emailCount as number : 1)
          : '';
        const newEmailData = typeof newEmail === 'object' 
          ? newEmail as newEmailData 
          : {emailSubject: '', emailBody: ''};

          //let emailInfo  = await mClient.getEmailBody(newEmailData.emailBody);
            //console.log(emailInfo);
            //console.log('EmailBody ='+ newEmailData.emailBody);
            let getEmail = newEmailData.emailBody;
            console.log(getEmail);
            let getEmailLogin = await mClient.getEmailUser(newEmailData.emailBody);
            //console.log(getEmailLogin);
            let getEmailPassword = await mClient.getEmailPassword(getEmail);
            //console.log(getEmailPassword);
            await browser.get(`https://myescrow-uat.ncome.in/auth/login`);
            expect(browser.isElementPresent(element(by.xpath('//*[@id="input"]'))))
            emailAddressInput = element(by.id('inputEmailAddress'));
            passwordInput = element(by.id('inputPassword'));
            submitButton = element(by.id('input'));
            await emailAddressInput.sendKeys(getEmailLogin? getEmailLogin:" ");
            await passwordInput.sendKeys(getEmailPassword?getEmailPassword:" ");
            await submitButton.click();
            await browser.wait(ec.urlContains('dashboard'),5000)
            expect(await browser.getCurrentUrl()).to.equal(
              `${environment.baseRoute}/dashboard`
            );
            expect( await browser.isElementPresent(element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[2]/a')))).to.equal(true);
            expect( await browser.isElementPresent(element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[3]/a')))).to.equal(true);
            expect( await browser.isElementPresent(element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[4]/a')))).to.equal(true);
            expect( await browser.isElementPresent(element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[5]/a')))).to.equal(true);
            expect( await browser.isElementPresent(element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[6]/a')))).to.equal(true);
            expect( await browser.isElementPresent(element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[7]/a')))).to.equal(true);

      })
})

