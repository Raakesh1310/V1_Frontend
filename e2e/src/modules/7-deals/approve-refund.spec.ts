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
// let accountId = '';

// describe('Approve Refund', () => {
//   it('login', async () => {
//     // login
//     await browser.wait(browser.get(route + '/auth/login'), 2000);
//     let emailAddressInput = element(by.id('inputEmailAddress'));
//     let passwordInput = element(by.id('inputPassword'));
//     let submitBtn = element(by.xpath('//*[@id="input"]'));
//     await browser.wait(ec.presenceOf(emailAddressInput));
//     await emailAddressInput.sendKeys(environment.user1LoginId);
//     await browser.wait(ec.presenceOf(passwordInput));
//     await passwordInput.sendKeys(environment.user1LoginPassword);
//     await browser.wait(ec.presenceOf(submitBtn));
//     await submitBtn.click();
//     await browser.wait(ec.urlIs(route + '/dashboard'));
//   });

//   it('navigate', async () => {
//     let nav = element(
//       by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[3]')
//     );
//     await browser.wait(ec.elementToBeClickable(nav));
//     await nav.click();
//     let subNav = element(
//       by.xpath(
//         '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[3]/nav/sbpro-side-nav-item[1]/a'
//       )
//     );

//     await browser.wait(ec.elementToBeClickable(subNav));
//     await subNav.click();
//   });

//   it('validate list', async () => {
//     await browser.wait(ec.urlIs(route + '/portal/deal'));
//     accountId = await element(
//       by.xpath(
//         '//*[@id="layoutSidenav_content"]/main/sbpro-deal-list-page/div/div/div/div/sbpro-deal-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr[1]/td[2]'
//       )
//     ).getText();
//     let status = element(
//       by.xpath(
//         '//*[@id="layoutSidenav_content"]/main/sbpro-deal-list-page/div/div/div/div/sbpro-deal-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr[1]/td[8]'
//       )
//     );
//     await browser.wait(ec.presenceOf(status));
//     await browser.wait(
//       ec.textToBePresentInElement(status, 'Refund approval pending'),
//       5000
//     );
//   });

//   it('approve refund', async () => {
//     let actionButton = element(
//       by.xpath(
//         '//*[@id="layoutSidenav_content"]/main/sbpro-deal-list-page/div/div/div/div/sbpro-deal-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr[1]/td[9]/button'
//       )
//     );
//     await browser.wait(ec.elementToBeClickable(actionButton));
//     await actionButton.click();

//     let approveElem = element(
//       by.xpath(
//         '/html/body/ngb-modal-window/div/div/sbpro-payment-details/sbpro-card/div/div[3]/span[1]/button[1]'
//       )
//     );
//     await browser.wait(ec.elementToBeClickable(approveElem));
//     await approveElem.click();
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
//     await browser.wait(ec.presenceOf(otp));
//     await browser.wait(ec.elementToBeClickable(verify));
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
//       ec.textToBePresentInElement(statusElem, 'Payment initiated')
//     );
//   });

//   it('validate transfer entry on landlord', async () => {
//     let nav = element(
//       by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[6]')
//     );
//     await browser.wait(ec.elementToBeClickable(nav));
//     await nav.click();

//     let subNav = element(
//       by.xpath(
//         '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[6]/nav/sbpro-side-nav-item[2]'
//       )
//     );
//     await browser.wait(ec.elementToBeClickable(subNav));
//     await subNav.click();

//     let accountIdElem = element(
//       by.xpath(
//         '//*[@id="layoutSidenav_content"]/main/sbpro-passbook-overview/div/div/div/sbpro-passbook-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr[1]/td[4]'
//       )
//     );
//     await browser.wait(ec.textToBePresentInElement(accountIdElem, accountId));

//     let status = element(
//       by.xpath(
//         '//*[@id="layoutSidenav_content"]/main/sbpro-passbook-overview/div/div/div/sbpro-passbook-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr[1]/td[9]'
//       )
//     );
//     await browser.wait(
//       ec.textToBePresentInElement(status, 'Pending for Authorization')
//     );
//   });

//   it('validate transfer entry on tenant', async () => {
//     // login
//     await browser.wait(browser.get(route + '/auth/login'), 2000);
//     let emailAddressInput = element(by.id('inputEmailAddress'));
//     let passwordInput = element(by.id('inputPassword'));
//     let submitBtn = element(by.xpath('//*[@id="input"]'));
//     await browser.wait(ec.presenceOf(emailAddressInput));
//     await emailAddressInput.sendKeys(environment.user1LoginId);
//     await browser.wait(ec.presenceOf(passwordInput));
//     await passwordInput.sendKeys(environment.user1LoginPassword);
//     await browser.wait(ec.presenceOf(submitBtn));
//     await submitBtn.click();
//     await browser.wait(ec.urlIs(route + '/dashboard'));

//     let nav = element(
//       by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[6]')
//     );
//     await browser.wait(ec.elementToBeClickable(nav));
//     await nav.click();

//     let subNav = element(
//       by.xpath(
//         '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[6]/nav/sbpro-side-nav-item[2]'
//       )
//     );
//     await browser.wait(ec.elementToBeClickable(subNav));
//     await subNav.click();

//     let accountIdElem = element(
//       by.xpath(
//         '//*[@id="layoutSidenav_content"]/main/sbpro-passbook-overview/div/div/div/sbpro-passbook-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr[1]/td[4]'
//       )
//     );
//     await browser.wait(ec.textToBePresentInElement(accountIdElem, accountId));

//     let status = element(
//       by.xpath(
//         '//*[@id="layoutSidenav_content"]/main/sbpro-passbook-overview/div/div/div/sbpro-passbook-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr[1]/td[9]'
//       )
//     );
//     await browser.wait(
//       ec.textToBePresentInElement(status, 'Pending for Authorization')
//     );
//   });
// });
