// import chai, { expect } from 'chai';
// import chaiHttp from 'chai-http';

// import {
//   browser,
//   by,
//   element,
//   ElementFinder,
//   ExpectedConditions as ec
// } from 'protractor';
// chai.use(chaiHttp);
// chai.use(require('chai-match'));

// import { environment } from '../../../environmentTest';
// let route = environment.baseRoute;

// describe('list detail page', () => {
//   it('login', async () => {
//     browser.wait(browser.get(route + '/auth/login'), 2000);

//     let emailAddressInput = element(by.id('inputEmailAddress'));
//     let passwordInput = element(by.id('inputPassword'));
//     let submitBtn = element(by.xpath('//*[@id="input"]'));

//     emailAddressInput.sendKeys(environment.user2LoginId);
//     passwordInput.sendKeys(environment.user2LoginPassword);
//     submitBtn.click();

//     browser.wait(ec.urlIs(route + '/dashboard'));
//   });

//   it('navigate to deal list page', async () => {
//     let nav = element(
//       by.xpath(
//         '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[3]/a'
//       )
//     );
//     let subNav = element(
//       by.xpath(
//         '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[3]/nav/sbpro-side-nav-item[1]/a'
//       )
//     );

//     nav.click();
//     subNav.click();

//     browser.wait(ec.urlIs(route + '/portal/deal'));
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
//     let list = element.all(
//       by.xpath(
//         '/html/body/app-root/sbpro-deal-page/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-deal-list-page/div/div/div/div/sbpro-deal-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr'
//       )
//     );

//     let searchInput = element(
//       by.xpath(
//         '/html/body/app-root/sbpro-deal-page/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-deal-list-page/div/div/div/div/sbpro-deal-list/sbpro-card/div/div[2]/div[1]/form/div/div[1]/input'
//       )
//     );

//     let searchButton = element(
//       by.xpath(
//         '/html/body/app-root/sbpro-deal-page/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-deal-list-page/div/div/div/div/sbpro-deal-list/sbpro-card/div/div[2]/div[1]/form/div/div[5]/button[1]'
//       )
//     );

//     let statusDropdown = element(
//       by.xpath(
//         `/html/body/app-root/sbpro-deal-page/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-deal-list-page/div/div/div/div/sbpro-deal-list/sbpro-card/div/div[2]/div[1]/form/div/div[4]/select`
//       )
//     );

//     let lastindex = (await list).length;

//     let accountId = await element(
//       by.xpath(
//         `/html/body/app-root/sbpro-deal-page/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-deal-list-page/div/div/div/div/sbpro-deal-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr[${lastindex}]/td[2]/span`
//       )
//     ).getText();
//     let status = await element(
//       by.xpath(
//         `/html/body/app-root/sbpro-deal-page/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-deal-list-page/div/div/div/div/sbpro-deal-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr[${lastindex}]/td[8]/span`
//       )
//     ).getText();

//     // search test
//     await searchInput.sendKeys(accountId);
//     await searchButton.click();

//     let accountResult = await element(
//       by.xpath(
//         `/html/body/app-root/sbpro-deal-page/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-deal-list-page/div/div/div/div/sbpro-deal-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr[1]/td[2]/span`
//       )
//     ).getText();

//     expect(accountResult).to.be.eq(accountId);

//     // status test
//     await statusDropdown.click();
//     element(by.cssContainingText('#statusList > option', status)).click();
//     await searchButton.click();

//     let statusResult = await element(
//       by.xpath(
//         `/html/body/app-root/sbpro-deal-page/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-deal-list-page/div/div/div/div/sbpro-deal-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr[1]/td[8]/span`
//       )
//     ).getText();

//     expect(statusResult).to.be.eq(status);
//   });
// });
