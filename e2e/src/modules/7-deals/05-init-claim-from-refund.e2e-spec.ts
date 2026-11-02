// import chai, { expect } from 'chai';
// import {
//   browser,
//   by,
//   element,
//   ElementFinder,
//   ExpectedConditions as ec
// } from 'protractor';
// import { environment } from '../../../environmentTest';
// import { MailClient } from '../../helpers/mail.po';

// import chaiHttp from 'chai-http';

// chai.use(chaiHttp);
// chai.use(require('chai-match'));

// let route = environment.baseRoute;
// let mClient: MailClient;

// describe('Init Claim from refund', () => {
//   it('login', async () => {
//     // login
//     await browser.wait(browser.get(route + '/auth/login'), 2000);
//     let emailAddressInput = element(by.id('inputEmailAddress'));
//     let passwordInput = element(by.id('inputPassword'));
//     let submitBtn = element(by.xpath('//*[@id="input"]'));
//     await browser.wait(ec.presenceOf(emailAddressInput), 5000);
//     await emailAddressInput.sendKeys(environment.user1LoginId);
//     await browser.wait(ec.presenceOf(passwordInput), 5000);
//     await passwordInput.sendKeys(environment.user1LoginPassword);
//     await browser.wait(ec.presenceOf(submitBtn), 5000);
//     await submitBtn.click();
//     await browser.wait(ec.urlIs(route + '/dashboard'), 5000);
//   });

//   it('navigate', async () => {
//     let nav = element(
//       by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[3]')
//     );
//     await browser.wait(ec.elementToBeClickable(nav), 5000);
//     await nav.click();
//     let subNav = element(
//       by.xpath(
//         '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[3]/nav/sbpro-side-nav-item[1]/a'
//       )
//     );

//     await browser.wait(ec.elementToBeClickable(subNav), 5000);
//     await subNav.click();
//   });

//   it('initiate claim', async () => {
//     let actionButton = element(
//       by.xpath(
//         '//*[@id="layoutSidenav_content"]/main/sbpro-deal-list-page/div/div/div/div/sbpro-deal-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr[1]/td[9]/button'
//       )
//     );
//     await browser.wait(ec.elementToBeClickable(actionButton), 5000);
//     await actionButton.click();

//     let claimButton = element(
//       by.xpath(
//         '/html/body/ngb-modal-window/div/div/sbpro-payment-details/sbpro-card/div/div[3]/span[1]/button[3]'
//       )
//     );
//     await browser.wait(ec.elementToBeClickable(claimButton));
//     await claimButton.click();

//     let reason = element(
//       by.xpath(
//         '/html/body/ngb-modal-window[2]/div/div/sbpro-card/div/div[2]/form/div[2]/input'
//       )
//     );
//     await browser.wait(ec.presenceOf(reason));
//     await reason.sendKeys('testing');

//     let amount = element(
//       by.xpath(
//         '/html/body/ngb-modal-window[2]/div/div/sbpro-card/div/div[2]/form/div[1]/input'
//       )
//     );
//     await browser.wait(ec.presenceOf(amount));
//     await amount.sendKeys(environment.securityAmount * 2);

//     let next = element(
//       by.xpath(
//         '/html/body/ngb-modal-window[2]/div/div/sbpro-card/div/div[3]/button'
//       )
//     );
//     await browser.wait(ec.elementToBeClickable(next));
//     await next.click();

//     let error = element(
//       by.xpath(
//         '/html/body/ngb-modal-window[2]/div/div/sbpro-card/div/div[2]/div[1]/sbpro-alert/div'
//       )
//     );
//     await browser.isElementPresent(error);

//     await amount.clear();
//     await amount.sendKeys(environment.claimAmount);
//     await next.click();
//   });

//   it('otp verification', async () => {
//     let verify = element(
//       by.xpath(
//         '/html/body/ngb-modal-window/div/div/sbpro-otp-modal/sbpro-card/div/div[3]/button'
//       )
//     );
//     let otp = element(
//       by.xpath(
//         '/html/body/ngb-modal-window/div/div/sbpro-otp-modal/sbpro-card/div/div[2]/div/input'
//       )
//     );
//     await browser.wait(ec.presenceOf(otp), 5000);
//     await browser.wait(ec.elementToBeClickable(verify), 5000);
//     await otp.sendKeys('1191');
//     await verify.click();
//   });

//   it('verify claim status on landlord', async () => {
//     await browser.wait(ec.urlIs(route + '/portal/deal'));
//     let status = element(
//       by.xpath(
//         '//*[@id="layoutSidenav_content"]/main/sbpro-deal-list-page/div/div/div/div/sbpro-deal-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr[1]/td[8]'
//       )
//     );
//     await browser.wait(
//       ec.textToBePresentInElement(status, 'Claim approval pending')
//     );
//   });

//   it('verify claim status on tenant', async () => {
//     await browser.wait(browser.get(route + '/auth/login'), 2000);
//     let emailAddressInput = element(by.id('inputEmailAddress'));
//     let passwordInput = element(by.id('inputPassword'));
//     let submitBtn = element(by.xpath('//*[@id="input"]'));
//     await browser.wait(ec.presenceOf(emailAddressInput));
//     await emailAddressInput.sendKeys(environment.user2LoginId);
//     await browser.wait(ec.presenceOf(passwordInput));
//     await passwordInput.sendKeys(environment.user2LoginPassword);
//     await browser.wait(ec.presenceOf(submitBtn));
//     await submitBtn.click();
//     await browser.wait(ec.urlIs(route + '/dashboard'));

//     let nav = element(
//       by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[3]')
//     );
//     await browser.wait(ec.elementToBeClickable(nav), 5000);
//     await nav.click();
//     let subNav = element(
//       by.xpath(
//         '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[3]/nav/sbpro-side-nav-item[1]/a'
//       )
//     );

//     await browser.wait(ec.elementToBeClickable(subNav), 5000);
//     await subNav.click();

//     await browser.wait(ec.urlIs(route + '/portal/deal'));
//     let status = element(
//       by.xpath(
//         '//*[@id="layoutSidenav_content"]/main/sbpro-deal-list-page/div/div/div/div/sbpro-deal-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr[1]/td[8]'
//       )
//     );
//     await browser.wait(
//       ec.textToBePresentInElement(status, 'Claim approval pending')
//     );
//   });

//   // it('check for claim approval mail for tenant', async () => {
//   //   mClient = new MailClient();
//   //   await mClient.connectMail();
//   //   //Wait for some time to mail to deliver
//   //   const emailDate = await mClient.getLastEmailDate();
//   //   await mClient.connectMail();

//   //   //Check for new mail, should be different from last mail
//   //   const lastEmailDate = typeof emailDate === 'string' ? emailDate : '';
//   //   const newEmail = await mClient.checkNewEmail(lastEmailDate);
//   //   const newEmailData =
//   //     typeof newEmail === 'object'
//   //       ? (newEmail as newEmailData)
//   //       : { emailSubject: '', emailBody: '' };

//   //   console.log(newEmail);

//   //   // expect(newEmailData.emailSubject).to.have.string(
//   //   //   environment.sendMailSubject
//   //   // );
//   // });
// });
