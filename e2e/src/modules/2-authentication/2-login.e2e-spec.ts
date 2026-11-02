import { expect } from 'chai';
import {
  browser,
  by,
  element,
  logging,
  ExpectedConditions as ec,
  ElementFinder
} from 'protractor';
import faker from 'faker';
import { environment } from '../../../environmentTest';

describe('Authentication: Login', () => {
  let emailAddressInput!: ElementFinder;
  let passwordInput!: ElementFinder;
  let submitButton!: ElementFinder;
  let form!: ElementFinder;

  beforeEach(() => {
    browser.get(`${environment.baseRoute}/auth/login`);
    emailAddressInput = element(by.id('inputEmailAddress'));
    passwordInput = element(by.id('inputPassword'));
    submitButton = element(by.id('input'));
    form = element(by.tagName('form'));
  });

  it('Check for the form elements', async () => {
    /**
     * Navigate to default url
     */

    /**
     * Wait for the input element
     * if those elements are present in the page
     */
    await browser.wait(ec.visibilityOf(emailAddressInput), 5000);
    await browser.wait(ec.visibilityOf(passwordInput), 5000);
    await browser.wait(ec.visibilityOf(submitButton), 5000);
    await browser.wait(ec.visibilityOf(form), 5000);
  });

  it('Submit blank form', async () => {
    await emailAddressInput.click();
    await passwordInput.click();

    await submitButton.click();

    expect(await form.getText()).to.have.string('Email required.');
    expect(await form.getText()).to.have.string('Password required.');
  });

  it('Submit form with invalid input', async () => {
    await emailAddressInput.sendKeys('iiiiiiiii');
    await passwordInput.sendKeys('111111111');

    await submitButton.click();

    expect(await form.getText()).to.have.string('Email is not valid.');
  });

  it('Error on entering unregistered email', async () => {
    await emailAddressInput.sendKeys(faker.internet.email());
    await passwordInput.sendKeys(faker.internet.password());
    await submitButton.click();
    await browser.wait(
      ec.visibilityOf(element(by.className('alert alert-danger'))),
      5000
    );
    expect(
      await element(by.xpath('//*[@id="layoutAuthentication_content"]/main/div/div/div/div/div[2]/div/sbpro-alert/div')).getText()
    ).to.be.equal(
      '×\nThe email or password combination you entered doesn’t exist.'
    );
  });

  it('Error on entering wrong password', async () => {
    await emailAddressInput.sendKeys(environment.user1LoginId);
    await passwordInput.sendKeys(faker.internet.password());
    await submitButton.click();
    await browser.wait(
      ec.visibilityOf(element(by.className('alert alert-danger'))),
      5000
    );
    expect(
      await element(by.className('alert alert-danger')).getText()
    ).to.be.equal(
      '×\nIncorrect email or password. To reset click on the “Forgot?” link.'
    );
  });

  it('Error on entering unverified email', async () => {
    await emailAddressInput.sendKeys(environment.unverifiedUser);
    await passwordInput.sendKeys(environment.unverifiedPassword);
    await submitButton.click();
    await browser.wait(
      ec.visibilityOf(element(by.className('alert alert-danger'))),
      5000
    );
    expect(
      await element(by.className('alert alert-danger')).getText()
    ).to.be.equal(
      '×\nThe email or password combination you entered doesn’t exist.'
    );
  });

  it('Forgot password', async () => {
    await element(by.linkText('(Forgot?)')).click();
    await browser.wait(
      ec.visibilityOf(element(by.id('inputEmailAddress'))),
      5000
    );
    expect(element(by.id('inputEmailAddress'))).to.exist;
  });

  it('Invalid email on forgot password', async () => {
    await element(by.linkText('(Forgot?)')).click();
    await browser.wait(
      ec.visibilityOf(element(by.id('inputEmailAddress'))),
      5000
    );

    await element(by.id('inputEmailAddress')).sendKeys(faker.name.findName());
    await element(by.css('main')).click();
    await browser.wait(
      ec.visibilityOf(element(by.className('invalid-feedback'))),
      5000
    );
    expect(
      await element(by.className('invalid-feedback')).getText()
    ).to.be.equal('Email is not valid.');
  });

  it('reset password using forgot password', async () => {
    await element(by.linkText('(Forgot?)')).click();
    await browser.wait(
      ec.visibilityOf(element(by.id('inputEmailAddress'))),
      5000
    );

    await element(by.id('inputEmailAddress')).sendKeys(
      environment.user1LoginId
    );
    await element(
      by.xpath(
        '//*[@id="layoutAuthentication_content"]/main/div/div/div/div/div[2]/form/div[2]/button'
      )
    ).click();
    let success = element(
      by.xpath(
        '//*[@id="layoutAuthentication_content"]/main/div/div/div/div/div[2]/center[2]/span'
      )
    );
    await browser.wait(ec.presenceOf(success));
    expect(await success.getText()).to.be.eq(
      `A password reset link has been sent to "${environment.user1LoginId}"`
    );
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser
      .manage()
      .logs()
      .get(logging.Type.BROWSER);
    expect(logs).not.to.include({
      level: logging.Level.SEVERE
    } as logging.Entry);
  });
});
