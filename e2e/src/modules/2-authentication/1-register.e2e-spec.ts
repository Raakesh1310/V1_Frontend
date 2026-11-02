// import { expect } from 'chai';
// import {
//   browser,
//   by,
//   element,
//   ElementFinder,
//   ExpectedConditions as ec,
//   logging
// } from 'protractor';
// import { AppPage } from '../../helpers/app.po';

// describe('Authentication: Register', () => {
//   let page: AppPage;
//   let emailAddressInput!: ElementFinder;
//   let passwordInput!: ElementFinder;
//   let submitButton!: ElementFinder;
//   let form!: ElementFinder;

//   beforeEach(() => {
//     page = new AppPage();

//     emailAddressInput = element(by.id('inputEmailAddress'));
//     passwordInput = element(by.id('inputPassword'));
//     submitButton = element(by.tagName('button'));
//     form = element(by.tagName('form'));
//   });

//   it('Check for the form elements', async () => {
//     page.navigateTo('/auth/register');
//     expect(await browser.getTitle()).to.be.eq('Register - Castler');

//     await browser.wait(ec.visibilityOf(emailAddressInput), 5000);
//     await browser.wait(ec.visibilityOf(passwordInput), 5000);
//     await browser.wait(ec.visibilityOf(submitButton), 5000);
//     await browser.wait(ec.visibilityOf(form), 5000);
//   });

//   it('Submit blank form', async () => {
//     await emailAddressInput.click();
//     await passwordInput.click();

//     await submitButton.click();

//     expect(await form.getText()).to.have.string('Email required');
//   });
//   afterEach(async () => {
//     const logs = await browser
//       .manage()
//       .logs()
//       .get(logging.Type.BROWSER);
//     expect(logs).not.to.include({
//       level: logging.Level.SEVERE
//     } as logging.Entry);
//   });
// });
