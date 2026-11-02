// import { expect } from 'chai';
// import { browser, by, element, logging } from 'protractor';

// import { AppPage } from '../../helpers/app.po';

// describe('App', () => {
//   let page: AppPage;

//   beforeEach(() => {
//     page = new AppPage();
//   });

//   it('should display welcome message', async () => {
//     page.navigateTo();
//     const bodyTag = element(by.tagName('body'));
//     expect(await bodyTag.getText()).to.be.eq('Please wait...');
//   });

//   afterEach(async () => {
//     // Assert that there are no errors emitted from the browser
//     const logs = await browser
//       .manage()
//       .logs()
//       .get(logging.Type.BROWSER);
//     expect(logs).not.to.include(
//       jasmine.objectContaining({
//         level: logging.Level.SEVERE
//       } as logging.Entry)
//     );
//   });
// });
