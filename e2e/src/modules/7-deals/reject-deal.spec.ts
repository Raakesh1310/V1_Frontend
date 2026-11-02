// import chai, { expect } from 'chai';
// import {
//   browser,
//   by,
//   element,
//   ElementFinder,
//   ExpectedConditions as ec
// } from 'protractor';
// import { environment } from '../../../environmentTest';
// import chaiHttp from 'chai-http';

// chai.use(chaiHttp);
// chai.use(require('chai-match'));

// let route = environment.baseRoute;

// describe('Reject Deal', () => {
//   it('login', async () => {
//     // login
//     await browser.wait(browser.get(route + '/auth/login'), 2000);
//     let emailAddressInput = element(by.id('inputEmailAddress'));
//     let passwordInput = element(by.id('inputPassword'));
//     let submitBtn = element(by.xpath('//*[@id="input"]'));
//     await browser.wait(ec.presenceOf(emailAddressInput), 5000);
//     await emailAddressInput.sendKeys(environment.user2LoginId);
//     await browser.wait(ec.presenceOf(passwordInput), 5000);
//     await passwordInput.sendKeys(environment.user2LoginPassword);
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

//   it('validate list', async () => {
//     await browser.wait(ec.urlIs(route + '/portal/deal'), 5000);
//     let status = element(
//       by.xpath(
//         '//*[@id="layoutSidenav_content"]/main/sbpro-deal-list-page/div/div/div/div/sbpro-deal-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr[1]/td[8]'
//       )
//     );
//     await browser.wait(ec.presenceOf(status), 5000);
//     await browser.wait(
//       ec.textToBePresentInElement(status, 'Pending for approval'),
//       5000
//     );
//   });

//   it('reject deal', async () => {
//     let accountIdElem: ElementFinder;
//     accountIdElem = element(
//       by.xpath(
//         '//*[@id="layoutSidenav_content"]/main/sbpro-deal-list-page/div/div/div/div/sbpro-deal-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr[1]/td[2]'
//       )
//     );
//     await browser.wait(ec.presenceOf(accountIdElem), 5000);
//     let accountId = await accountIdElem.getText();

//     let actionButton = element(
//       by.xpath(
//         '//*[@id="layoutSidenav_content"]/main/sbpro-deal-list-page/div/div/div/div/sbpro-deal-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr[1]/td[9]/button'
//       )
//     );
//     await browser.wait(ec.elementToBeClickable(actionButton), 5000);
//     await actionButton.click();

//     accountIdElem = element(
//       by.xpath(
//         '/html/body/ngb-modal-window/div/div/sbpro-card/div/div[2]/div[1]/table/tr[2]/td'
//       )
//     );
//     await browser.wait(
//       ec.textToBePresentInElement(accountIdElem, accountId),
//       5000
//     );

//     let rejectElem = element(
//       by.xpath(
//         '/html/body/ngb-modal-window/div/div/sbpro-card/div/div[3]/span[1]/span/button[1]'
//       )
//     );
//     await browser.wait(ec.elementToBeClickable(rejectElem), 5000);
//     await rejectElem.click();
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

//   it('status validation', async () => {
//     let statusElem = element(
//       by.xpath(
//         '//*[@id="layoutSidenav_content"]/main/sbpro-deal-list-page/div/div/div/div/sbpro-deal-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr[1]/td[8]'
//       )
//     );
//     await browser.wait(
//       ec.textToBePresentInElement(statusElem, 'Inactive'),
//       5000
//     );
//   });

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

//   it('validate no edit button', async () => {
//     let button = element(
//       by.xpath(
//         '//*[@id="layoutSidenav_content"]/main/sbpro-deal-list-page/div/div/div/div/sbpro-deal-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr[1]/td[9]/button'
//       )
//     );
//     expect(await button.isPresent()).to.be.false;
//   });
// });
