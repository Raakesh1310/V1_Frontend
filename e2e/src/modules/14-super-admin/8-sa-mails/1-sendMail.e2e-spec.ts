import { expect } from 'chai';
import {
  browser,
  by,
  element,
  ElementFinder,
  ExpectedConditions as ec,
  logging
} from 'protractor';
import { MailClient } from '../../../helpers/mail.po';
import { protractor } from 'protractor/built/ptor';
import { newEmailData } from '../../../interfaces/newEmailData.interface';
import { environment } from '../../../../environmentTest';

describe('Super Admin: Send Mail', () => {

    let mClient: MailClient;

    //Login to Super Admin, beforeAll is not working
    it('super-admin login', async() => {
        //Login URL
        browser.get(environment.loginUrl);

        let emailAddressInput!: ElementFinder;
        let submitBtn!: ElementFinder;
        let passwordInput!: ElementFinder;
        let adminElement: ElementFinder;
        
        emailAddressInput = element(by.id('inputEmailAddress'));
        passwordInput = element(by.id('inputPassword'));
        adminElement = element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/div'));
        submitBtn = element(by.xpath('//*[@id="input"]'));

        await browser.wait(ec.visibilityOf(emailAddressInput), 2000);
        emailAddressInput.sendKeys(environment.adminLoginId);
        passwordInput.sendKeys(environment.adminLoginPassword);
        submitBtn.click();
        await browser.wait(ec.visibilityOf(adminElement), 2000);
        expect(await adminElement.getText()).to.have.string('ADMIN');
    });


    //Create a mail and test if it has been delivered
    it('create and send mail', async () => {
        let toEmailAddress: ElementFinder;
        let navMailOption: ElementFinder;
        let navSendMailOption: ElementFinder;
        let searchEmail: ElementFinder;
        let firstEmailElement: ElementFinder;
        let emailSubject: ElementFinder;
        let emailBody: ElementFinder;
        let sendButton: ElementFinder;

        mClient = new MailClient();
        await mClient.connectMail();

        navMailOption = element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[13]/a'));
        navSendMailOption = element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[13]/nav/sbpro-side-nav-item[2]/a'));

        await navMailOption.click();
        await browser.wait(ec.visibilityOf(navSendMailOption), 2000);
        await navSendMailOption.click();

        toEmailAddress = element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-mail-form-page/div/div/div/div/sbpro-mail-form/sbpro-card/div/div[2]/form/div[1]/ng-multiselect-dropdown/div/div[1]/span'));
        searchEmail = element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-mail-form-page/div/div/div/div/sbpro-mail-form/sbpro-card/div/div[2]/form/div[1]/ng-multiselect-dropdown/div/div[1]/span'));
        firstEmailElement = element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-mail-form-page/div/div/div/div/sbpro-mail-form/sbpro-card/div/div[2]/form/div[1]/ng-multiselect-dropdown/div/div[2]/ul[2]/li[1]/div'));
        emailSubject = element(by.xpath('//*[@id="subject"]'));
        emailBody = element(by.xpath('//*[@id="body"]'));
        sendButton = element(by.xpath('/html/body/app-root/sbpro-mail-page/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-mail-form-page/div/div/div/div/sbpro-mail-form/sbpro-card/div/div[2]/form/div[5]/sbpro-app-button/button/span'));

        await browser.wait(ec.visibilityOf(toEmailAddress), 2000);
        await toEmailAddress.click();
        await browser.wait(ec.visibilityOf(searchEmail), 1000);
        await searchEmail.sendKeys(environment.sendMailTestId);
        await firstEmailElement.click();
        await browser.wait(ec.visibilityOf(emailSubject), 500);
        await emailSubject.sendKeys(environment.sendMailSubject);
        await emailBody.sendKeys(environment.sendMailBody);

        //Get Last Email Date
        const emailCount = await mClient.getEmailCount();
        await sendButton.click();
        //Wait for some time to mail to deliver
        await browser.sleep(20000);
        await mClient.connectMail();

        //Check for new mail, should be different from last mail
        const newEmailCount = await mClient.getEmailCount();
        const newEmail = (emailCount !== newEmailCount) 
        ? await mClient.getEmail(typeof newEmailCount === 'number' && environment.isMailOrderReverse ? newEmailCount as number : 1)
        : '';
        const newEmailData = typeof newEmail === 'object' 
        ? newEmail as newEmailData 
        : {emailSubject: '', emailBody: ''};
        expect(newEmailData.emailSubject).to.have.string(environment.sendMailSubject);
        expect(newEmailData.emailBody).to.have.string(environment.sendMailBody);
    });
});