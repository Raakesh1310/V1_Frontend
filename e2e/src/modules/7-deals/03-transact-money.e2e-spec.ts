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

// describe('Transact Money', () => {
//   it('login tenant', async () => {
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

//   it('get account number', async () => {
//     await browser.wait(ec.urlIs(route + '/portal/deal'), 5000);
//     let accountNumber = element(
//       by.xpath(
//         '//*[@id="layoutSidenav_content"]/main/sbpro-deal-list-page/div/div/div/div/sbpro-deal-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr[1]/td[2]'
//       )
//     );
//     await browser.wait(ec.presenceOf(accountNumber), 5000);
//     accountId = await accountNumber.getText();
//   });

//   it('0 balance for refund check', async () => {
//     let actionButton = element(
//       by.xpath(
//         '//*[@id="layoutSidenav_content"]/main/sbpro-deal-list-page/div/div/div/div/sbpro-deal-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr[1]/td[9]/button'
//       )
//     );
//     await browser.wait(ec.elementToBeClickable(actionButton), 5000);
//     await actionButton.click();

//     let error = element(
//       by.xpath(
//         '//*[@id="layoutSidenav_content"]/main/sbpro-deal-list-page/div/div/div/div/sbpro-deal-list/sbpro-card/div/div[2]/div[2]/div'
//       )
//     );
//     await browser.wait(
//       ec.textToBePresentInElement(
//         error,
//         'Payment cannot be initiated as deal balance is less than security deposit.'
//       )
//     );
//   });

//   it('Transact money in virtual account', async () => {
//     // await browser.waitForAngularEnabled(false);
//     let resp = await chai
//       .request(environment.apihost)
//       .post('/api/v1/icici-va/push')
//       .set('secretkey', environment.ICICI_SECRET)
//       .send({
//         date: '24-30-20',
//         merchantCode: 'MR029490',
//         paymentMode: 'N',
//         remitterAccNumber: '98375989589838',
//         remitterIFSCCode: 'ICIC00339858',
//         remitterName: 'Avinash Singh',
//         senderInformation: 'NA',
//         txnAmount: environment.securityAmount / 2,
//         utrNumber: accountId,
//         virtualAccNumber: accountId
//       });
//     expect(resp.status).to.be.eq(200);
//   });

//   it('insufficient balance for refund check', async () => {
//     let actionButton = element(
//       by.xpath(
//         '//*[@id="layoutSidenav_content"]/main/sbpro-deal-list-page/div/div/div/div/sbpro-deal-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr[1]/td[9]/button'
//       )
//     );
//     await browser.wait(ec.elementToBeClickable(actionButton), 5000);
//     await actionButton.click();

//     let error = element(
//       by.xpath(
//         '//*[@id="layoutSidenav_content"]/main/sbpro-deal-list-page/div/div/div/div/sbpro-deal-list/sbpro-card/div/div[2]/div[2]/div'
//       )
//     );
//     await browser.wait(
//       ec.textToBePresentInElement(
//         error,
//         'Payment cannot be initiated as deal balance is less than security deposit.'
//       )
//     );
//   });

//   it('Transact money in virtual account', async () => {
//     // await browser.waitForAngularEnabled(false);
//     let resp = await chai
//       .request(environment.apihost)
//       .post('/api/v1/icici-va/push')
//       .set('secretkey', environment.ICICI_SECRET)
//       .send({
//         date: '24-30-20',
//         merchantCode: 'MR029490',
//         paymentMode: 'N',
//         remitterAccNumber: '98375989589838',
//         remitterIFSCCode: 'ICIC00339858',
//         remitterName: 'Avinash Singh',
//         senderInformation: 'NA',
//         txnAmount: environment.securityAmount / 2,
//         utrNumber: accountId + accountId,
//         virtualAccNumber: accountId
//       });
//     expect(resp.status).to.be.eq(200);
//   });

//   it('validate amount', async () => {
//     browser.refresh();
//     await browser.wait(ec.urlIs(route + '/portal/deal'), 5000);
//     let amount = element(
//       by.xpath(
//         '//*[@id="layoutSidenav_content"]/main/sbpro-deal-list-page/div/div/div/div/sbpro-deal-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr[1]/td[7]'
//       )
//     );
//     await browser.wait(ec.presenceOf(amount), 5000);
//     await browser.wait(
//       ec.textToBePresentInElement(amount, environment.securityAmount.toString())
//     );
//   });

//   it('validate tenant passbook', async () => {
//     let nav = element(
//       by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[6]')
//     );
//     await browser.wait(ec.elementToBeClickable(nav));
//     await nav.click();

//     let subnav = element(
//       by.xpath(
//         '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[6]/nav/sbpro-side-nav-item[1]'
//       )
//     );
//     await browser.wait(ec.elementToBeClickable(subnav));
//     await subnav.click();

//     let transferAccount = element(
//       by.xpath(
//         '//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr[1]/td[2]'
//       )
//     );
//     await browser.wait(ec.textToBePresentInElement(transferAccount, accountId));

//     let transferAmount = element(
//       by.xpath(
//         '//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr[1]/td[3]'
//       )
//     );
//     await browser.wait(
//       ec.textToBePresentInElement(
//         transferAmount,
//         (environment.securityAmount / 2).toString()
//       )
//     );
//   });

//   it('validate lanlord passbook', async () => {
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

//     // navigate
//     let nav = element(
//       by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[6]')
//     );
//     await browser.wait(ec.elementToBeClickable(nav));
//     await nav.click();

//     let subnav = element(
//       by.xpath(
//         '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[6]/nav/sbpro-side-nav-item[1]'
//       )
//     );
//     await browser.wait(ec.elementToBeClickable(subnav));
//     await subnav.click();

//     let transferAccount = element(
//       by.xpath(
//         '//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr[1]/td[2]'
//       )
//     );
//     await browser.wait(ec.textToBePresentInElement(transferAccount, accountId));

//     let transferAmount = element(
//       by.xpath(
//         '//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr[1]/td[3]'
//       )
//     );
//     await browser.wait(
//       ec.textToBePresentInElement(
//         transferAmount,
//         (environment.securityAmount / 2).toString()
//       )
//     );
//   });
// });
