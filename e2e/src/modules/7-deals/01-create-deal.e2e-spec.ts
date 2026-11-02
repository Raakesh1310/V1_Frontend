// import chai, { expect } from 'chai';
// import { browser, by, element, ExpectedConditions as ec } from 'protractor';
// import { environment } from '../../../environmentTest';
// import chaiHttp from 'chai-http';
// import path from 'path';

// const faker = require('faker');

// chai.use(chaiHttp);
// chai.use(require('chai-match'));

// let route = environment.baseRoute;

// describe('Create Deal', () => {
//   it('login', async () => {
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
//         '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[3]/nav/sbpro-side-nav-item[2]/a'
//       )
//     );

//     await browser.wait(ec.elementToBeClickable(subNav), 5000);
//     await subNav.click();
//     await browser.wait(ec.urlIs(route + '/portal/deal/form'));
//   });

//   /**
//    * add basic detail
//    */
//   it('basic detail', async () => {
//     let role = element(
//       by.xpath(
//         '/html/body/app-root/sbpro-deal-page/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-deal-form-page/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-deal-basic-detail/div/form[2]/div/select/option[1]'
//       )
//     );
//     let next = element(
//       by.xpath(
//         '//*[@id="layoutSidenav_content"]/main/sbpro-deal-form-page/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-deal-basic-detail/div/div/button'
//       )
//     );
//     await browser.wait(ec.elementToBeClickable(role), 5000);
//     await role.click();
//     await browser.wait(ec.elementToBeClickable(next), 5000);
//     await next.click();
//   });

//   /**
//    * add tenant detail
//    */
//   it('tenant detail', async () => {
//     let name = element(
//       by.xpath(
//         '//*[@id="layoutSidenav_content"]/main/sbpro-deal-form-page/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-deal-party-detail/div/form/div[1]/input'
//       )
//     );
//     let email = element(
//       by.xpath(
//         '//*[@id="layoutSidenav_content"]/main/sbpro-deal-form-page/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-deal-party-detail/div/form/div[2]/input'
//       )
//     );
//     let mobile = element(
//       by.xpath(
//         '//*[@id="layoutSidenav_content"]/main/sbpro-deal-form-page/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-deal-party-detail/div/form/div[3]/input'
//       )
//     );
//     let next = element(
//       by.xpath(
//         '//*[@id="layoutSidenav_content"]/main/sbpro-deal-form-page/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-deal-party-detail/div/div/button'
//       )
//     );

//     // validation check
//     await email.sendKeys('ncome@next.come');
//     await browser.wait(ec.elementToBeClickable(next), 2000);
//     await next.click();
//     expect(
//       await element(
//         by.xpath(
//           '/html/body/app-root/sbpro-deal-page/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-deal-form-page/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-deal-party-detail/div/div[1]/div'
//         )
//       ).getText()
//     ).to.exist;

//     // happy flow
//     await email.clear();
//     await name.sendKeys(faker.name.firstName());
//     await email.sendKeys(environment.user2LoginId);
//     await mobile.sendKeys(environment.mobile);
//     await browser.wait(ec.elementToBeClickable(next), 2000);
//     next.click();
//   });

//   /**
//    * add property details
//    */
//   it('property details', async () => {
//     let address = element(
//       by.xpath(
//         '/html/body/app-root/sbpro-deal-page/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-deal-form-page/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-deal-property-detail/div/form/div[2]/input'
//       )
//     );
//     let state = element(
//       by.xpath(
//         '/html/body/app-root/sbpro-deal-page/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-deal-form-page/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-deal-property-detail/div/form/div[3]/input'
//       )
//     );
//     let city = element(
//       by.xpath(
//         '/html/body/app-root/sbpro-deal-page/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-deal-form-page/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-deal-property-detail/div/form/div[4]/input'
//       )
//     );
//     let pincode = element(
//       by.xpath(
//         '/html/body/app-root/sbpro-deal-page/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-deal-form-page/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-deal-property-detail/div/form/div[5]/input'
//       )
//     );
//     let next = element(
//       by.xpath(
//         '/html/body/app-root/sbpro-deal-page/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-deal-form-page/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-deal-property-detail/div/form/div[6]/button'
//       )
//     );

//     await browser.wait(ec.presenceOf(address), 5000);
//     await browser.wait(ec.presenceOf(state), 5000);
//     await browser.wait(ec.presenceOf(city), 5000);
//     await browser.wait(ec.presenceOf(pincode), 5000);
//     await address.sendKeys(faker.address.streetAddress());
//     await city.sendKeys(faker.address.city());
//     await pincode.sendKeys('110030');
//     await next.click();

//     // validation check
//     expect(
//       element(
//         by.xpath(
//           `/html/body/app-root/sbpro-deal-page/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-deal-form-page/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-deal-property-detail/div/form/div[3]/span[2]/span`
//         )
//       )
//     ).to.exist;
//     // happy flow
//     await state.sendKeys(faker.address.state());
//     await next.click();
//   });

//   /**
//    * add deal detail
//    */
//   it('deal details', async () => {
//     let security = element(
//       by.xpath(
//         '/html/body/app-root/sbpro-deal-page/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-deal-form-page/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-deal-form/div/form[1]/div/input'
//       )
//     );
//     let rentagreement = element(by.css('input[type="file"]'));
//     let tenure = element(
//       by.xpath(
//         '/html/body/app-root/sbpro-deal-page/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-deal-form-page/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-deal-form/div/form[2]/div[2]/div/div[2]/div/input'
//       )
//     );
//     let calendar = element(
//       by.xpath(
//         '/html/body/app-root/sbpro-deal-page/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-deal-form-page/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-deal-form/div/form[2]/div[2]/div/div[1]/div/input'
//       )
//     );
//     let next = element(
//       by.xpath(
//         '/html/body/app-root/sbpro-deal-page/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-deal-form-page/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-deal-form/div/form[2]/button'
//       )
//     );

//     await browser.wait(ec.presenceOf(security), 5000);
//     await browser.wait(ec.presenceOf(rentagreement), 5000);
//     await browser.wait(ec.presenceOf(tenure), 5000);
//     await browser.wait(ec.presenceOf(calendar), 5000);
//     await browser.wait(ec.elementToBeClickable(next), 5000);

//     // validation check
//     await next.click();
//     expect(
//       element(
//         by.xpath(
//           `/html/body/app-root/sbpro-deal-page/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-deal-form-page/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-deal-form/div/div`
//         )
//       )
//     ).to.exist;
//     // happy flow
//     security.sendKeys(environment.securityAmount);

//     let absolutePath = path.resolve(environment.testFile);
//     await rentagreement.sendKeys(absolutePath);
//     await calendar.click();

//     let month = element(
//       by.xpath(
//         '/html/body/app-root/sbpro-deal-page/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-deal-form-page/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-deal-form/div/form[2]/div[2]/div/div[1]/div/ngb-datepicker/div[1]/ngb-datepicker-navigation/ngb-datepicker-navigation-select/select[2]/option[6]'
//       )
//     );
//     await browser.wait(ec.elementToBeClickable(month), 5000);

//     await month.click();
//     let date = element(
//       by.xpath(
//         '/html/body/app-root/sbpro-deal-page/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-deal-form-page/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-deal-form/div/form[2]/div[2]/div/div[1]/div/ngb-datepicker/div[2]/div/ngb-datepicker-month-view/div[4]/div[3]/div'
//       )
//     );
//     await browser.wait(ec.elementToBeClickable(date), 5000);

//     await date.click();
//     await tenure.sendKeys(6);
//     await browser.wait(ec.elementToBeClickable(next), 5000);

//     await next.click();
//   });

//   /**
//    * otp verification
//    */
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

//   it('deal editing', async () => {
//     await browser.wait(ec.urlIs(route + '/portal/deal'), 5000);
//     // click on edit button
//     let editButton = element(
//       by.xpath(
//         '/html/body/app-root/sbpro-deal-page/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-deal-list-page/div/div/div/div/sbpro-deal-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr[1]/td[9]/button'
//       )
//     );
//     await browser.wait(ec.presenceOf(editButton), 5000);
//     await editButton.click();

//     // click on deal detail tab
//     let dealdetailTab = element(
//       by.xpath(
//         '/html/body/app-root/sbpro-deal-page/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-deal-form-page/div/sbpro-card-navigation/div/div[1]/ul/li[4]/a'
//       )
//     );
//     await browser.wait(ec.presenceOf(dealdetailTab), 5000);
//     await dealdetailTab.click();

//     // set tenure value to 12
//     let tenureInput = element(
//       by.xpath(
//         '/html/body/app-root/sbpro-deal-page/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-deal-form-page/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-deal-form/div/form[2]/div[2]/div/div[2]/div/input'
//       )
//     );
//     await browser.wait(ec.presenceOf(tenureInput), 5000);
//     await tenureInput.clear();
//     await tenureInput.sendKeys('10');

//     // click on update deal button
//     let updateButton = await element(
//       by.xpath(
//         '/html/body/app-root/sbpro-deal-page/sbpro-layout-dashboard/span/div/div[2]/main/sbpro-deal-form-page/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-deal-form/div/form[2]/button'
//       )
//     ).click();
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

//   it('validate changes', async () => {
//     let detailLink = element(
//       by.xpath(
//         '//*[@id="layoutSidenav_content"]/main/sbpro-deal-list-page/div/div/div/div/sbpro-deal-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr[1]/td[1]/a'
//       )
//     );
//     await browser.wait(ec.elementToBeClickable(detailLink), 5000);
//     await detailLink.click();

//     let tab = element(
//       by.xpath(
//         '//*[@id="layoutSidenav_content"]/main/sbpro-deal-detail-admin-page/div/sbpro-card-navigation/div/div[1]/ul/li[4]'
//       )
//     );
//     await browser.wait(ec.elementToBeClickable(tab), 5000);
//     await tab.click();

//     let tenure = element(
//       by.xpath(
//         '//*[@id="layoutSidenav_content"]/main/sbpro-deal-detail-admin-page/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-deal-form/div/form[2]/div[2]/div/div[2]/div/span'
//       )
//     );
//     await browser.wait(ec.presenceOf(tenure), 5000);
//     await browser.wait(ec.textToBePresentInElement(tenure, '10'), 5000);
//   });
// });
