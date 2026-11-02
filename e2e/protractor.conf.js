// @ts-check
// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { SpecReporter } = require('jasmine-spec-reporter');

/**
 * @type { import("protractor").Config }
 */
var HtmlReporter = require('protractor-beautiful-reporter');
exports.config = {
  allScriptsTimeout: 20000,
  specs: ['./src/**/*.e2e-spec.ts'],
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      // Get rid of --ignore-certificate yellow warning
      args: [
        '--headless',
        '--disable-gpu',
        '--window-size=500,500',
        '--no-sandbox',
        '--test-type=browser'
      ],
      // Set download path and avoid prompting for download even though
      // this is already the default on Chrome but for completeness
      prefs: {
        download: {
          prompt_for_download: false,
          directory_upgrade: true,
          default_directory: `${__dirname}\/downloads\/`
        }
      }
    }
  },
  suites: {
    all: [
      'src/modules/*/**.e2e-spec.ts',
      'src/modules/14-super-admin/*/**.e2e-spec.ts'
    ],
    dashboard: 'src/modules/12-DashBoard/test.e2e-spec.ts',
    settings: 'src/modules/13-Settings/test.e2e-spec.ts',
    profile: 'src/modules/11-Profile/test.e2e-spec.ts',
    passbook: 'src/modules/5-passbook/*.e2e-spec.ts',
    manage_teams: 'src/modules/9-manage-teams/*.e2e-spec.ts',//Only Invite New Member Not Working //Site Bug
    escrow_pages: 'src/modules/10-escrow-pages/*.e2e-spec.ts',
    login: 'src/modules/2-authentication/2-login.e2e-spec.ts',
    payee: 'src/modules/3-payee/*.e2e-spec.ts',
    'payee:form': 'src/modules/3-payee/1-form.e2e-spec.ts',
    'payee:list': 'src/modules/3-payee/2-list.e2e-spec.ts',
    account: 'src/modules/4-account/*.e2e-spec.ts',
    'account:form': 'src/modules/4-account/1-form.e2e-spec.ts',
    'account:list': 'src/modules/4-account/2-list.e2e-spec.ts',
    deals: 'src/modules/7-deals/*.e2e-spec.ts',
    'deal:flow1': 'src/modules/7-deals/03-transact-money.e2e-spec.ts',
    'deal:create': 'src/modules/7-deals/01-create-deal.e2e-spec.ts',
    approvals: 'src/modules/15-approvals/*.e2e-spec.ts',
    'approvals:single': 'src/modules/15-approvals/01-single-transfer-multiple-approval.e2e-spec.ts',
    'approvals:bulk': 'src/modules/15-approvals/02-bulk-transfer-bulk-approvals.e2e-spec.ts',
    'approvals:multiple': 'src/modules/15-approvals/03-multiple-transfer-multiple-approvals.e2e-spec.ts',
    transfer: [
      'src/modules/14-super-admin/5-sa-transfer/*.e2e-spec.ts',
      'src/modules/6-transfer/*.e2e-spec.ts',
    ],
    'transfer:form': 'src/modules/6-transfer/1-form.e2e-spec.ts',
    sa_mails: 'src/modules/14-super-admin/8-sa-mails/*.e2e-spec.ts',
    sa_merchant: 'src/modules/14-super-admin/1-sa-merchants/*.e2e-spec.ts',
    sa_account: 'src/modules/14-super-admin/2-sa-accounts/*.e2e-spec.ts',
    sa_agreements: 'src/modules/14-super-admin/7-sa-agreements/*.e2e-spec.ts',
    sa_escrow_pages:
      'src/modules/14-super-admin/4-sa-escrow-pages/*.e2e-spec.ts',
    sa_deals: 'src/modules/14-super-admin/3-sa-deals/deal-admin.e2e-spec.ts',
    sa_transfer: 'src/modules/14-super-admin/5-sa-transfer/admin-transfer-list.spec.ts',
    sa_transaction: 'src/modules/14-super-admin/6-sa-transaction/admin-transaction-list.spec.ts'
  },
  directConnect: true,
  baseUrl: 'http://localhost:4200/',
  framework: 'mocha',
  // jasmineNodeOpts: {
  //   showColors: true,
  //   defaultTimeoutInterval: 30000,
  //   print: function() {}
  // },
  mochaOpts: {
    reporter: 'mochawesome-screenshots',
    reporterOptions: {
      reportDir: '../html', //The directory which stores the reports
      reportName: 'E2EReport',
      reportTitle: 'E2E Test Reports',
      takePassedScreenshot: true, //Option to control the scope of screenshots
      clearOldScreenshots: true
    },
    slow: 3000,
    timeout: 50000
  },
  onPrepare: function() {
    // @ts-ignore
    browser
      .manage()
      .window()
      .setSize(1600, 1000);
    require('ts-node').register({
      project: require('path').join(__dirname, './tsconfig.json')
    });
    //   jasmine.getEnv().addReporter(new HtmlReporter({
    //     baseDirectory: 'tmp/screenshots'
    //  }).getJasmine2Reporter());
    // jasmine
    //   .getEnv()
    //   .addReporter(new SpecReporter({ spec: { displayStacktrace: true } }));
  }
};
