import { expect } from 'chai';
import {
  browser,
  by,
  element,
  ElementArrayFinder,
  ElementFinder,
  ExpectedConditions as ec,
  logging
} from 'protractor';
import { protractor } from 'protractor/built/ptor';
import { environment } from '../../../../environmentTest';

describe('Super Admin: List Mail', () => {

  beforeEach(() => {
    let ec = protractor.ExpectedConditions;
  });

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

  it('check mail details', async () => {
    let viewButton!: ElementFinder;
    let navMailOption!: ElementFinder;
    let navListMailOption!: ElementFinder;
    let closeButton!: ElementFinder;

    viewButton = element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-mail-list-page/div/div/div/div/sbpro-mail-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr[1]/td[3]/button'));
    navMailOption = element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[13]/a'));
    navListMailOption = element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[13]/nav/sbpro-side-nav-item[1]/a'));
    closeButton = element(by.xpath('/html/body/ngb-modal-window/div/div/sbpro-mail-detail/sbpro-card/div/div[1]/button'));

    //Click on List Mail Option
    await browser.wait(ec.visibilityOf(navMailOption), 500);
    //await navMailOption.click();
    await browser.wait(ec.visibilityOf(navListMailOption), 500);
    await navListMailOption.click();

    //View the modal
    await viewButton.click();

    //Check Modal elements are there
    let emailRecipient: ElementFinder;
    let emailSubject: ElementFinder;
    let emailBody: ElementFinder;
    let emailDate: ElementFinder;
    let emailSender: ElementFinder;

    emailRecipient = element(by.xpath('/html/body/ngb-modal-window/div/div/sbpro-mail-detail/sbpro-card/div/div[2]/form/div[2]/span'));
    emailSubject = element(by.xpath('//*[@id="subject"]'));
    emailBody = element(by.xpath('//*[@id="body"]'));
    emailDate = element(by.xpath('//*[@id="sentOn"]'));
    emailSender = element(by.xpath('//*[@id="sentBy"]/span'))

    await browser.wait(ec.visibilityOf(emailRecipient), 2000);
    expect(await emailRecipient.getText()).to.be.a('string');
    expect(await emailSubject.getText()).to.be.a('string');
    expect(await emailBody.getText()).to.be.a('string');
    expect(await emailDate.getText()).to.be.a('string');
    expect(await emailSender.getText()).to.be.a('string');

    //Close Modal
    await closeButton.click();

  });

  it('checks table data', async () => {
    let navMailOption!: ElementFinder;
    let navListMailOption!: ElementFinder;
    let mailListTable!: ElementFinder;

   // navMailOption = element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[10]/a'));
    navListMailOption = element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[11]/nav/sbpro-side-nav-item[1]/a'));
    mailListTable = element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-mail-list-page/div/div/div/div/sbpro-mail-list/sbpro-card/div/div[2]/div[2]/table'));

    //Expect Mails Table to load
    await browser.wait(ec.visibilityOf(mailListTable), 2000);
    expect(mailListTable.isPresent());

    //Go through table   
    let header = mailListTable.all(by.css('tr th'));
    let headerText1 = await header.get(0).getText();
    let headerText2 = await header.get(1).getText();
    let headerText3 = await header.get(2).getText();

    expect(headerText1).to.have.string('Date');
    expect(headerText2).to.have.string('Subject');
    expect(headerText3).to.have.string('Message');

    let tableBodyElems = mailListTable.all(by.css('tr td'));
    (await tableBodyElems).forEach(async(row, index) => {
      if (index % 3 === 2){
        await row.isElementPresent('.btn');
      }
      else{
        let tableBodyText = await row.getText();
        expect(tableBodyText).to.be.a('string');
      }
    });
  });

});