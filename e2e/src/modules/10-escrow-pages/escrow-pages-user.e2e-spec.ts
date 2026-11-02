import { expect } from 'chai';
import {
  browser,
  by,
  element,
  logging,
  ExpectedConditions as ec,
  ElementFinder,
  WebElement
} from 'protractor';
import fs from 'fs';
import path from 'path';
import {environment} from '../../../environmentTest'


describe('escrow pages', () => {
    
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
        await browser.wait(ec.urlContains('dashboard'),5000)
        expect(await browser.getCurrentUrl()).to.equal(
            `${environment.baseRoute}/dashboard`
        );
    });
    
    it('All table field values should be populating as expected',async ()=>{
        await element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[7]/a')).click()
        await element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[7]/nav/sbpro-side-nav-item[1]/a')).click()
        const escrowPagesCount = await element.all(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-pages-list/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr')).count();
        //console.log(escrowPagesCount)
        if(escrowPagesCount > 0){
            expect(await browser.isElementPresent(element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-pages-list/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr[1]/td[1]/a/ngb-highlight')))).to.equal(true)
            expect(await browser.isElementPresent(element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-pages-list/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr[1]/td[2]/ngb-highlight')))).to.equal(true)
            expect(await browser.isElementPresent(element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-pages-list/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr[1]/td[3]/a/ngb-highlight')))).to.equal(true)
            expect(await browser.isElementPresent(element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-pages-list/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr[1]/td[4]')))).to.equal(true)

        }    
    })

    /*it('search on template name',async ()=>{
        //await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-pages-list/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[1]/div/button')).click()
        const escrowPagesCount = await element.all(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-pages-list/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr')).count();
        //console.log(escrowPagesCount)
        if(escrowPagesCount > 0){
            let templateName = await element(by.xpath(`//*[@id="layoutSidenav_content"]/main/sbpro-escrow-pages-list/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr[${escrowPagesCount}]/td[1]/a/ngb-highlight`)).getText()
            await element(by.xpath('//*[@id="search-box"]')).sendKeys(templateName);
            await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-pages-list/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[2]/div[1]/form/div/div[4]/a')).click();
            let el = element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-pages-list/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr/td[1]/a'))
            await browser.wait(ec.textToBePresentInElement(el,templateName),3000)
            expect(await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-pages-list/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr/td[1]/a')).getText()).to.equal(templateName);
            
        }
    })*/

    it('clicking on account id should take us to account details page', async ()=>{
        //await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-pages-list/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[2]/div[1]/form/div/div[4]/button')).click()
        const escrowPagesCount = await element.all(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-pages-list/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr')).count();
        //console.log(escrowPagesCount)
        if(escrowPagesCount > 0){
            let accIdEl = element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-pages-list/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr[1]/td[3]/a/ngb-highlight'))
            let accId = await accIdEl.getText();
            await accIdEl.click()
            expect(await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-account-details-page/div/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-account-detail/form/div/div[2]/div[1]/p')).getText()).to.equal(accId)
        }
    })

    it('Copying the link should result in Toast alert - Copied link successfully', async ()=>{
        //*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[9]/nav/sbpro-side-nav-item[1]/a
        //await element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[9]/a')).click()
        await element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[7]/nav/sbpro-side-nav-item[1]/a')).click()
        const escrowPagesCount = await element.all(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-pages-list/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr')).count();
        //console.log(escrowPagesCount)
        if(escrowPagesCount > 0){
            await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-pages-list/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr[1]/td[5]/button')).click();
            let toast = element(by.xpath('/html/body/app-root/sbpro-toast-view/sbpro-toast/div/div[2]'))
            await browser.wait(browser.isElementPresent(toast),5000)
            //expect(await browser.isElementPresent(toast)).to.equal(true)
        }
    })

    it(' Clicking on the template should open the Template and Download should be working as expected.', async ()=>{
        //await element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[9]/a')).click()
        await element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[7]/nav/sbpro-side-nav-item[1]/a')).click()
        const escrowPagesCount = await element.all(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-pages-list/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr')).count();
        //console.log(escrowPagesCount)
        if(escrowPagesCount > 0){
            await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-pages-list/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr[1]/td[1]/a/ngb-highlight')).click()
            expect(await browser.isElementPresent(element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-pages-customer-details/div/div/div/div/sbpro-escrow-page-customer-data/sbpro-card/div/div[1]/span')))).to.equal(true)
            await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-pages-customer-details/div/div/div/div/sbpro-escrow-page-customer-data/sbpro-card/div/div[1]/div/span/a')).click()
            let dir = path.join(__dirname,'../../../downloads');
            //console.log(dir)
            await browser.sleep(3000);
            let files = fs.readdir(dir,(error,files)=>{
                //console.log(files)
                expect(files.length).greaterThan(0);
                if(files.length > 0){
                        for (const file of files) {
                        fs.unlink(path.join(dir, file), err => {
                            if (err) throw err;
                        });
                        }
                    
                }
            });

        }
    })

    it('user should be able to create an escrow page', async ()=>{
        await element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[7]/nav/sbpro-side-nav-item[2]/a')).click()
        let pageTitle = element(by.xpath('//*[@id="title"]'))
        let pageTitleData = 'page'+Date.now();
        await pageTitle.sendKeys(pageTitleData);
        await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-pages-form/div/sbpro-create-form/sbpro-card/div/div/form/div[2]/ng-select/div/div/div[2]/input')).click()
        let options = element.all(by.css('.ng-option'))
        options.first().click()
        await element(by.xpath('//*[@id="input"]')).click()
        let dealName = element(by.xpath('//*[@id="cdk-drop-list-0"]/div[1]/sbpro-escrow-page-field-text/div/input'))
        await browser.wait(ec.visibilityOf(dealName),5000)
        let dealNameData = 'deal'+Date.now().toString();
        await dealName.sendKeys(dealNameData);
        await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-pages-form/div/sbpro-create-form/sbpro-card/div/div/form/sbpro-escrow-page-widgets-page/div[2]/div/button')).click()
        let customeField = element(by.xpath('//*[@id="cdk-drop-list-0"]/div[3]/sbpro-escrow-page-field-text/div/input'))
        await browser.wait(ec.visibilityOf(customeField),5000)
        await customeField.sendKeys("customLabel")
        await element(by.xpath('//*[@id="input"]')).click()
        //browser.sleep(2000)
        let preview = element(by.xpath('//*[@id="input"]/span'))
        await browser.wait(ec.textToBePresentInElement(preview,'Preview'),5000)
        
        await preview.click()
        let generateLink = element(by.buttonText('Generate Link'))
        browser.wait(ec.visibilityOf(generateLink),5000)
        await generateLink.click()
        await browser.wait(ec.visibilityOf(element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-pages-list/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[1]'))),5000)
        expect(await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-pages-list/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr[1]/td[1]/a/ngb-highlight')).getText()).equal(pageTitleData)

    })
})
