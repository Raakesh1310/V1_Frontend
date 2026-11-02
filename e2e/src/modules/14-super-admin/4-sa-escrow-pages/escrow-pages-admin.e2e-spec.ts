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
import { environment } from '../../../../environmentTest'

describe('escrow pages', () => {
           
    let emailAddressInput!: ElementFinder;
    let passwordInput!: ElementFinder;
    let submitButton!: ElementFinder;
    let form!: ElementFinder;
    it('Login should Work Fine', async () => {
        await browser.get(`${environment.baseRoute}/auth/login`);
        emailAddressInput = element(by.id('inputEmailAddress'));
        passwordInput = element(by.id('inputPassword'));
        submitButton = element(by.id('input'));
        form = element(by.tagName('form'));
    
        await emailAddressInput.sendKeys(environment.adminLoginId);
        await passwordInput.sendKeys(environment.adminLoginPassword);
        await submitButton.click();
        await browser.wait(ec.urlContains('dashboard'),5000);
        expect(await browser.getCurrentUrl()).to.equal(
            `${environment.baseRoute}/dashboard`
        );
    });
    
    it('All table field values should be populating as expected',async ()=>{
        await element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[11]/a')).click()
        const escrowPagesCount = await element.all(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-list-admin-page/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[2]/div[2]/table/tbody')).count();
        //console.log(escrowPagesCount)
        if(escrowPagesCount > 0){
            expect(await browser.isElementPresent(element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-list-admin-page/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[2]/div[2]/table/thead/tr/th[1]/span')))).to.equal(true);
            expect(await browser.isElementPresent(element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-list-admin-page/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[2]/div[2]/table/thead/tr/th[2]/span')))).to.equal(true);
            expect(await browser.isElementPresent(element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-list-admin-page/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[2]/div[2]/table/thead/tr/th[3]/span')))).to.equal(true);
            expect(await browser.isElementPresent(element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-list-admin-page/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[2]/div[2]/table/thead/tr/th[4]/span')))).to.equal(true);
            expect(await browser.isElementPresent(element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-list-admin-page/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[2]/div[2]/table/thead/tr/th[5]/span')))).to.equal(true);

            
        }    
    })

    
    it('search on template name',async ()=>{
        await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-list-admin-page/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[2]/div[1]/form/div[1]/button[2]')).click()
        const escrowPagesCount = await element.all(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-list-admin-page/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[2]/div[2]/table/tbody')).count();
        //console.log(escrowPagesCount)
        if(escrowPagesCount > 0){
            let templateName = await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-list-admin-page/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr[1]/td[2]/a/ngb-highlight')).getText();
            await element(by.xpath('//*[@id="search-box"]')).sendKeys(templateName);
            await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-list-admin-page/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[2]/div[1]/form/div[1]/button[1]')).click();
            await browser.wait(ec.textToBePresentInElement(element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-list-admin-page/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr/td[2]/a/ngb-highlight')),templateName),3000);
            //expect(await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-list-admin-page/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr[1]/td[2]/a/ngb-highlight')).getText()).to.equal(templateName);
            
        }
    })

    it('clicking on account id should take us to account details page', async ()=>{
        await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-list-admin-page/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[2]/div[1]/form/div[1]/button')).click();
        const escrowPagesCount = await element.all(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-list-admin-page/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[2]/div[2]/table/tbody')).count();
        //console.log(escrowPagesCount)
        if(escrowPagesCount > 0){
            let accIdEl = element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-list-admin-page/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr[1]/td[4]/a/ngb-highlight'));
            let accId = await accIdEl.getText();
            await accIdEl.click()
            expect(await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-account-detail-admin-page/div/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-account-detail/form/div[1]/div[2]/div[1]/p')).getText()).to.equal(accId);
        }
    })

    it('Copying the link should result in Toast alert - Copied link successfully', async ()=>{
        await element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[11]/a')).click();
        const escrowPagesCount = await element.all(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-list-admin-page/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr')).count();
        //console.log(escrowPagesCount)
        if(escrowPagesCount > 0){
            await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-list-admin-page/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr[1]/td[6]/button')).click();
            let toast = element(by.xpath('/html/body/app-root/sbpro-toast-view/sbpro-toast/div/div[2]'));
            await browser.wait(browser.isElementPresent(toast),3000);
            //expect(await browser.isElementPresent(toast)).to.equal(true)
        }
    })

    it(' Clicking on the template should open the Template and Download should be working as expected.', async ()=>{
        await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-list-admin-page/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[2]/div[1]/form/div[1]/button[2]')).click();
  
        const escrowPagesCount = await element.all(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-list-admin-page/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[2]/div[2]/table/tbody')).count();
        //console.log(escrowPagesCount)
        if(escrowPagesCount > 0){
            await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-list-admin-page/div/div/div/div/sbpro-escrow-page-list/sbpro-card/div/div[2]/div[2]/table/tbody/tr[1]/td[2]/a/ngb-highlight')).click();
            //expect(await browser.isElementPresent(element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-customer-detail-admin-page/div/div/div/div/sbpro-escrow-page-customer-data/sbpro-card/div/div[1]/span')))).to.equal(true);
            await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-escrow-customer-detail-admin-page/div/div/div/div/sbpro-escrow-page-customer-data/sbpro-card/div/div[1]/div/span/a')).click();
            let dir = path.join(__dirname,'../../../../downloads');
            //console.log(dir)
            await browser.sleep(4000);
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
    
    
})
