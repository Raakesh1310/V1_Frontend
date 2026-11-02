import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo(url: string = '') {
    if (!url) {
      url = browser.baseUrl;
    }
    return browser.get(url) as Promise<unknown>;
  }

  getTitleText() {
    return element(by.css('sbpro-dashboard-head')).getAttribute(
      'title'
    ) as Promise<string>;
  }
}
