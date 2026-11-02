// import chai, { expect } from 'chai';
// import chaiHttp from 'chai-http';

// import {
//   browser,
//   by,
//   element,
//   ExpectedConditions as ec,
//   ElementFinder
// } from 'protractor';
// const faker = require('faker');
// chai.use(chaiHttp);
// chai.use(require('chai-match'));

// import { environment } from '../../../../environmentTest';

// let route = environment.baseRoute;

// let dealId = '';

// describe('list page', () => {
//   it('login', async () => {
//     await browser.wait(browser.get(route + '/auth/login'), 3000);

//     let emailAddressInput = element(by.id('inputEmailAddress'));
//     let passwordInput = element(by.id('inputPassword'));
//     let submitBtn = element(by.xpath('//*[@id="input"]'));

//     emailAddressInput.sendKeys(environment.adminLoginId);
//     passwordInput.sendKeys(environment.adminLoginPassword);
//     submitBtn.click();

//     await browser.wait(ec.urlIs(route + '/dashboard'), 3000);
//   });

//   it('navigate to deal list page', async () => {
//     let sideNav = element(
//       by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[3]/a')
//     );
//     sideNav.click();
//     await browser.wait(ec.urlIs(route + '/super-admin/deal'), 2000);
//   });

//   it('virtual account and IFSC check', async () => {
//     let list = element(by.css('tbody'));

//     await list.all(by.css('tr')).then(async rows => {
//       rows.forEach(row => {
//         row.all(by.css('td')).then(async (data: ElementFinder) => {
//           expect(await data[1].getText()).to.match(/^PPAY\d{10}$/);
//           expect(await data[2].getText()).to.be.eq(environment.ifsc);
//         });
//       });
//     });
//   });

//   it('search and status check', async () => {
//     let list = await element.all(
//       by.xpath(
//         '/html/body/app-root/sbpro-deal-page/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-all-deals-page/div/div/div/div/sbpro-deal-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr'
//       )
//     );

//     let searchInput = element(
//       by.xpath(
//         '//*[@id="wildSearch"]'
//       )
//     );

//     let searchButton = element(
//       by.xpath(
//         '//*[@id="layoutSidenav_content"]/main/sbpro-all-deals-page/div/div/div/div/sbpro-deal-list/sbpro-card/div/div[2]/div[1]/form/div[1]/button[1]'
//       )
//     );

//     let statusDropdown = element(
//       by.xpath(
//         '//*[@id="statusList"]'
//       )
//     );

//     let lastindex = list.length;
//     let accountId = await element(
//       by.xpath(
//         '//*[@id="layoutSidenav_content"]/main/sbpro-all-deals-page/div/div/div/div/sbpro-deal-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr[1]/td[2]/span'
//       )
//     ).getText();
//     let status = await element(
//       by.xpath(
//         '//*[@id="layoutSidenav_content"]/main/sbpro-all-deals-page/div/div/div/div/sbpro-deal-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr[1]/td[7]/span'
//       )
//     ).getText();

//     // search test
//     await searchInput.sendKeys(accountId);
//     await searchButton.click();

//     let accountResult = await element(
//       by.xpath(
//         `/html/body/app-root/sbpro-deal-page/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-all-deals-page/div/div/div/div/sbpro-deal-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr/td[2]/span`
//       )
//     ).getText();
//     expect(accountResult).to.be.eq(accountId);

//     // status test
//     await statusDropdown.click();
//     element(by.cssContainingText('#statusList > option', status)).click();
//     await searchButton.click();

//     let statusResult = await element(
//       by.xpath(
//         `/html/body/app-root/sbpro-deal-page/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-all-deals-page/div/div/div/div/sbpro-deal-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr/td[7]/span`
//       )
//     ).getText();
//     expect(statusResult).to.be.eq(status);
//   });
// });

// describe('detail page checks', () => {
//   it('go to deal detail page', async () => {
//     let clear = element(
//       by.xpath(
//         '//*[@id="layoutSidenav_content"]/main/sbpro-all-deals-page/div/div/div/div/sbpro-deal-list/sbpro-card/div/div[2]/div[1]/form/div[1]/button[2]'
//       )
//     );
//     await clear.click();

//     let deal = element(
//       by.xpath(
//         '//*[@id="layoutSidenav_content"]/main/sbpro-all-deals-page/div/div/div/div/sbpro-deal-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr[1]/td[1]/a/span'
//       )
//     );
//     dealId = await deal.getText();
//     await deal.click();

//     await browser.wait(ec.urlIs(route + `/portal/deal/${dealId}`), 2000);
//   });

//   it('check basic detail', async () => {
//     let tab = element(
//       by.xpath(
//         '/html/body/app-root/sbpro-deal-page/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-deal-detail-admin-page/div/sbpro-card-navigation/div/div[1]/ul/li[1]/a'
//       )
//     );
//     await tab.click();

//     let detailDealId = await element(
//       by.xpath(
//         '/html/body/app-root/sbpro-deal-page/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-deal-detail-admin-page/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-deal-basic-detail/div/div[1]/div[1]/div/span/b'
//       )
//     ).getText();

//     expect(detailDealId).to.be.eq(dealId);
//   });

//   it('check party detail', async () => {
//     let tab = element(
//       by.xpath(
//         '/html/body/app-root/sbpro-deal-page/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-deal-detail-admin-page/div/sbpro-card-navigation/div/div[1]/ul/li[2]/a'
//       )
//     );
//     await tab.click();

//     let detail = element(
//       by.xpath(
//         '/html/body/app-root/sbpro-deal-page/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-deal-detail-admin-page/div/sbpro-card-navigation/div/div[1]/ul/li[2]/a'
//       )
//     );
//     await browser.wait(ec.presenceOf(detail), 2000);
//   });

//   it('check property detail', async () => {
//     let tab = element(
//       by.xpath(
//         '/html/body/app-root/sbpro-deal-page/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-deal-detail-admin-page/div/sbpro-card-navigation/div/div[1]/ul/li[3]/a'
//       )
//     );
//     await tab.click();

//     let detail = element(
//       by.xpath(
//         '/html/body/app-root/sbpro-deal-page/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-deal-detail-admin-page/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-deal-property-detail/div/form/div[1]/span/b'
//       )
//     );
//     await browser.wait(ec.presenceOf(detail), 2000);
//   });

//   it('check deal detail', async () => {
//     let tab = element(
//       by.xpath(
//         '/html/body/app-root/sbpro-deal-page/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-deal-detail-admin-page/div/sbpro-card-navigation/div/div[1]/ul/li[4]/a'
//       )
//     );
//     await browser.wait(ec.elementToBeClickable(tab), 5000);
//     await tab.click();

//     let detail = element(
//       by.xpath(
//         '/html/body/app-root/sbpro-deal-page/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-deal-detail-admin-page/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-deal-form/div/form[1]/div/span/b'
//       )
//     );
//     await browser.wait(ec.presenceOf(detail), 2000);
//   });
// });
