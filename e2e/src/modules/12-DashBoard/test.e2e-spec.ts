import { expect } from 'chai';
import {
  browser,
  by,
  element,
  logging,
  ExpectedConditions as ec,
  ElementFinder
} from 'protractor';
import { environment } from '../../../environmentTest';

describe('DashBoard', () => {
  let emailAddressInput!: ElementFinder;
  let passwordInput!: ElementFinder;
  let submitButton!: ElementFinder;

  it('Login should Work Fine', async () => {
    await browser.get(`${environment.baseRoute}/auth/login`);
    emailAddressInput = element(by.id('inputEmailAddress'));
    passwordInput = element(by.id('inputPassword'));
    submitButton = element(by.id('input'));

    await emailAddressInput.sendKeys(environment.user1LoginId);
    await passwordInput.sendKeys(environment.user1LoginPassword);
    await submitButton.click();
    await browser.wait(ec.urlContains('dashboard'), 5000);
    expect(await browser.getCurrentUrl()).to.equal(
      `${environment.baseRoute}/dashboard`
    );
  });

  it('logo should be present', async () => {
    let logo = element(by.xpath('//*[@id="navbarDropdownUserImage"]/img'));
    await browser.wait(ec.presenceOf(logo));
  });

  it('DashBoard side nav element should be present', async () => {
    //All dashboard components should load
    //1.All side nav items should exist
    expect(
      await browser.isElementPresent(
        element(
          by.xpath(
            '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[1]/a'
          )
        )
      )
    ).to.equal(true);
  });
  it('Account side nav element should be present', async () => {
    //All dashboard components should load
    //1.All side nav items should exist
    expect(
      await browser.isElementPresent(
        element(
          by.xpath(
            '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[2]/a'
          )
        )
      )
    ).to.equal(true);
  });
  it('List and Add Account sub-side nav element should be present on clicking account', async () => {
    //All dashboard components should load
    //1.All side nav items should exist
    expect(
      await browser.isElementPresent(
        element(
          by.xpath(
            '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[2]/a'
          )
        )
      )
    ).to.equal(true);
    element(
      by.xpath(
        '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[2]/a'
      )
    ).click();
    expect(
      await browser.isElementPresent(
        element(
          by.xpath(
            '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[2]/nav/sbpro-side-nav-item[1]/a'
          )
        )
      )
    );
    expect(
      await browser.isElementPresent(
        element(
          by.xpath(
            '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[2]/nav/sbpro-side-nav-item[2]/a'
          )
        )
      )
    );
  });
  it('Deals side nav element should be present', async () => {
    //All dashboard components should load
    //1.All side nav items should exist
    expect(
      await browser.isElementPresent(
        element(
          by.xpath(
            '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[3]/a'
          )
        )
      )
    ).to.equal(true);
  });
  it('List and Add Deals sub-side nav element should be present on clicking Deals', async () => {
    //All dashboard components should load
    //1.All side nav items should exist
    element(
      by.xpath(
        '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[3]/a'
      )
    ).click();
    expect(
      await browser.isElementPresent(
        element(
          by.xpath(
            '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[3]/nav/sbpro-side-nav-item[1]/a'
          )
        )
      )
    );
    expect(
      await browser.isElementPresent(
        element(
          by.xpath(
            '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[3]/nav/sbpro-side-nav-item[2]/a'
          )
        )
      )
    );
  });
  it('Transfer fund side nav element should be present', async () => {
    //All dashboard components should load
    //1.All side nav items should exist
    expect(
      await browser.isElementPresent(
        element(
          by.xpath(
            '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[4]/a'
          )
        )
      )
    ).to.equal(true);
  });

  it('Create Transfer and My Scheduled Transfer sub-side nav element should be present on clicking Deals', async () => {
    //All dashboard components should load
    //1.All side nav items should exist
    element(
      by.xpath(
        '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[4]/a'
      )
    ).click();
    expect(
      await browser.isElementPresent(
        element(
          by.xpath(
            '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[4]/nav/sbpro-side-nav-item[1]/a'
          )
        )
      )
    );
    expect(
      await browser.isElementPresent(
        element(
          by.xpath(
            '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[4]/nav/sbpro-side-nav-item[2]/a'
          )
        )
      )
    );
  });

  it('Manage Payees fund side nav element should be present', async () => {
    //All dashboard components should load
    //1.All side nav items should exist
    expect(
      await browser.isElementPresent(
        element(
          by.xpath(
            '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[5]/a'
          )
        )
      )
    ).to.equal(true);
  });
  it('List and Add payee sub-side nav element should be present on clicking Manage Payees', async () => {
    //All dashboard components should load
    //1.All side nav items should exist
    element(
      by.xpath(
        '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[5]/a'
      )
    ).click();
    expect(
      await browser.isElementPresent(
        element(
          by.xpath(
            '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[5]/nav/sbpro-side-nav-item[1]/a'
          )
        )
      )
    );
    expect(
      await browser.isElementPresent(
        element(
          by.xpath(
            '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[5]/nav/sbpro-side-nav-item[2]/a'
          )
        )
      )
    );
  });

  it('My Passbook fund side nav element should be present', async () => {
    //All dashboard components should load
    //1.All side nav items should exist
    expect(
      await browser.isElementPresent(
        element(
          by.xpath(
            '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[6]/a'
          )
        )
      )
    ).to.equal(true);
  });

  it('Inwards Fund Deposit Add Outward Fund Transfer sub-side nav element should be present on clicking Manage Payees', async () => {
    //All dashboard components should load
    //1.All side nav items should exist
    element(
      by.xpath(
        '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[6]/a'
      )
    ).click();
    expect(
      await browser.isElementPresent(
        element(
          by.xpath(
            '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[6]/nav/sbpro-side-nav-item[1]/a'
          )
        )
      )
    );
    expect(
      await browser.isElementPresent(
        element(
          by.xpath(
            '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[6]/nav/sbpro-side-nav-item[2]/a'
          )
        )
      )
    );
  });

  it('Manage teams fund side nav element should be present', async () => {
    //All dashboard components should load
    //1.All side nav items should exist
    expect(
      await browser.isElementPresent(
        element(
          by.xpath(
            '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[7]/a'
          )
        )
      )
    ).to.equal(true);
  });

  it('Escrow Pages fund side nav element should be present', async () => {
    //All dashboard components should load
    //1.All side nav items should exist
    expect(
      await browser.isElementPresent(
        element(
          by.xpath(
            '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[8]/a'
          )
        )
      )
    ).to.equal(true);
  });

  it('List Add Create Escrow Page sub-side nav element should be present on clicking Manage Payees', async () => {
    //All dashboard components should load
    //1.All side nav items should exist
    element(
      by.xpath(
        '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[8]/a'
      )
    ).click();
    expect(
      await browser.isElementPresent(
        element(
          by.xpath(
            '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[8]/nav/sbpro-side-nav-item[1]/a'
          )
        )
      )
    );
    expect(
      await browser.isElementPresent(
        element(
          by.xpath(
            '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[8]/nav/sbpro-side-nav-item[2]/a'
          )
        )
      )
    );
  });

  it('My profile fund side nav element should be present', async () => {
    //All dashboard components should load
    //1.All side nav items should exist
    expect(
      await browser.isElementPresent(
        element(
          by.xpath(
            '//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[9]/a'
          )
        )
      )
    ).to.equal(true);
  });

  it('Inward and Outward Chart should be present', async () => {
    //All dashboard components should load
    //1.All side nav items should exist
    expect(
      await browser.isElementPresent(
        element(
          by.xpath(
            '//*[@id="layoutSidenav_content"]/main/sbpro-dashboard-overview/div/sbpro-dashboard-charts/div/div[3]/div/sbpro-card/div/div[3]/sb-charts-area/div/canvas'
          )
        )
      )
    ).to.equal(true);
    expect(
      await browser.isElementPresent(
        element(
          by.xpath(
            '//*[@id="layoutSidenav_content"]/main/sbpro-dashboard-overview/div/sbpro-dashboard-charts/div/div[3]/div/sbpro-card/div/div[2]/sb-charts-bar/div/canvas'
          )
        )
      )
    ).to.equal(true);
  });
  // 4 cards
  it('Number of inward deposit card should be present', async () => {
    //All dashboard components should load
    //1.All side nav items should exist
    expect(
      await browser.isElementPresent(
        element(
          by.xpath(
            '//*[@id="layoutSidenav_content"]/main/sbpro-dashboard-overview/div/sbpro-dashboard-charts/div/sbpro-dashboard-cards/div/div[1]/div'
          )
        )
      )
    ).to.equal(true);
  });

  it('Amount of outward transfer card should be present', async () => {
    //All dashboard components should load
    //1.All side nav items should exist
    expect(
      await browser.isElementPresent(
        element(
          by.xpath(
            '//*[@id="layoutSidenav_content"]/main/sbpro-dashboard-overview/div/sbpro-dashboard-charts/div/sbpro-dashboard-cards/div/div[4]/div'
          )
        )
      )
    ).to.equal(true);
  });

  it('Number of outward transfer card should be present', async () => {
    //All dashboard components should load
    //1.All side nav items should exist
    expect(
      await browser.isElementPresent(
        element(
          by.xpath(
            '//*[@id="layoutSidenav_content"]/main/sbpro-dashboard-overview/div/sbpro-dashboard-charts/div/sbpro-dashboard-cards/div/div[3]/div'
          )
        )
      )
    ).to.equal(true);
  });

  it('Amount of inward deposit should be present', async () => {
    //All dashboard components should load
    //1.All side nav items should exist
    expect(
      await browser.isElementPresent(
        element(
          by.xpath(
            '//*[@id="layoutSidenav_content"]/main/sbpro-dashboard-overview/div/sbpro-dashboard-charts/div/sbpro-dashboard-cards/div/div[2]/div'
          )
        )
      )
    ).to.equal(true);
  });
});
