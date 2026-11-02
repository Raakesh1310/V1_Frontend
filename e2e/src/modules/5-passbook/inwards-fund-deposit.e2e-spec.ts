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
import { environment } from '../../../environmentTest'


describe('PassBoook module',()=>{
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
          //browser.sleep(2000)
          await browser.wait(ec.urlContains('dashboard'))
          expect(await browser.getCurrentUrl()).to.equal(
            `${environment.baseRoute}/dashboard`
          );
        });


        it('all the field should load', async ()=>{
            await element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[5]/a')).click();
            await element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[5]/nav/sbpro-side-nav-item[1]/a')).click();
            expect(await browser.isElementPresent(element(by.xpath('//*[@id="search-box"]')))).to.equal(true);
            expect(await browser.isElementPresent(element(by.xpath('//*[@id="date-from"]')))).to.equal(true);
            expect(await browser.isElementPresent(element(by.xpath('//*[@id="date-to"]')))).to.equal(true);
            expect(await browser.isElementPresent(element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/form/div[1]/button[1]')))).to.equal(true);
            expect(await browser.isElementPresent(element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/form/div[1]/button[2]')))).to.equal(true);

        })
        
        describe('search filter should be working', ()=>{

            beforeEach( async ()=>{
                await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/form/div[1]/button[1]')).click()
            })
            it('search filter on transactionId should be working', async ()=>{
                const noOfRows = await element.all(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr')).count()
                //console.log(noOfRows);
                if(noOfRows > 1){
                    const transactionId = await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr[1]/td[1]/ngb-highlight')).getText()
                    //console.log(transactionId)
                    element(by.xpath('//*[@id="search-box"]')).sendKeys(transactionId)
                    await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/form/div[1]/button[1]')).click()
                    //await browser.sleep(2000);
                    let newTransactionId = element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr[1]/td[1]/ngb-highlight'))
                    await browser.wait(ec.textToBePresentInElement(newTransactionId,transactionId),3000)
                    // const newNoOfRows = await element.all(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr')).count()
                    // expect(newNoOfRows).to.equal(1);
                    // expect(await browser.isElementPresent(element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr[1]/td[1]/ngb-highlight')))).to.equal(true);
                    // const newTransactionId = await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr[1]/td[1]/ngb-highlight')).getText()
                    // expect(newTransactionId).to.equal(transactionId);
                }
            })

            it('search filter on account id', async ()=> {
                const noOfRows = await element.all(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr')).count()
                if(noOfRows > 1){
                    const accountId = await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr[1]/td[2]/ngb-highlight')).getText()
                    //console.log(accountId)
                    element(by.xpath('//*[@id="search-box"]')).sendKeys(accountId)
                    await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/form/div/div[4]/button[1]')).click()
                    //await browser.sleep(2000)
                    await browser.wait(ec.textToBePresentInElement(element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr/td[2]/ngb-highlight/span')),accountId),3000)
                    const rows = await element.all(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr')).count();
                    for(let i=0;i<rows;i++){
                        const accId = await element(by.xpath(`//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr[${i+1}]/td[2]`)).getText()
                        expect(accountId).to.equal(accId)
                    }
                }
            })

            // it('search filter on Remitter Name', async ()=> {
            //     const noOfRows = await element.all(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr')).count()
            //     if(noOfRows > 1){
            //         const remitterName = await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr[1]/td[4]/ngb-highlight')).getText()
            //         //console.log(remitterName)
            //         await element(by.xpath('//*[@id="search-box"]')).sendKeys(remitterName)
            //         await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/form/div/div[4]/button[1]')).click()
            //         //await browser.sleep(2000)
            //         browser.wait(ec.textToBePresentInElement(element(by.xpath('')),remitterName),3000)
            //         const rows = await element.all(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr')).count();
            //         for(let i=0;i<rows;i++){
            //             const remName = await element(by.xpath(`//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr[${i+1}]/td[4]`)).getText()
            //             expect(remitterName).to.equal(remName)
            //         }
            //     }
            // })

            it('search filter on Remitter Account', async ()=> {
                const noOfRows = await element.all(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr')).count()
                if(noOfRows > 1){
                    const remitterAccount = await element(by.xpath(`//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr[${noOfRows}]/td[5]/ngb-highlight`)).getText()
                    //(remitterAccount)
                    await element(by.xpath('//*[@id="search-box"]')).sendKeys(remitterAccount)
                    await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/form/div/div[4]/button[1]')).click()
                    //await browser.sleep(2000)
                    await browser.wait(ec.textToBePresentInElement(element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr/td[5]/ngb-highlight')),remitterAccount),3000)
                    const rows = await element.all(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr')).count();
                    for(let i=0;i<rows;i++){
                        const remAcc = await element(by.xpath(`//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr[${i+1}]/td[5]`)).getText()
                        expect(remitterAccount).to.equal(remAcc)
                    }
                }
            })

            it('Clicking on the Download option should download the report', async()=>{
                await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/form/div[1]/div/a')).click()
                await browser.sleep(3000)
                let dir = path.join(__dirname,'../../../downloads');
                //console.log(dir)
                let files = fs.readdir(dir,(error,files)=>{
                  //console.log(files)
                  expect(files.length>0);//.greaterThan(0);
                  if(files.length > 0){
                          for (const file of files) {
                            fs.unlink(path.join(dir, file), err => {
                              if (err) throw err;
                            });
                          }
                        
                  }
                });
            })

            it('Clicking on the Transaction Id should open the detailed transaction page and print should work',async ()=>{
                
                const noOfRows = await element.all(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr')).count()
                //console.log(noOfRows);
                if(noOfRows > 1){
                    const transactionId = await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr[1]/td[1]/ngb-highlight')).getText()
                    await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr[1]/td[1]/ngb-highlight')).click()
                    //await browser.sleep(2000);
                    await browser.wait(ec.visibilityOf(element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transaction-details-page/div/div/div/sbpro-transaction-details/sbpro-card/div/div[1]'))))
                    expect(await browser.isElementPresent(element(by.xpath('//*[@id="print-section"]/form/div/div[1]/div[1]/p'))));
                    expect(await element(by.xpath('//*[@id="print-section"]/form/div/div[1]/div[1]/p')).getText()).to.equal(transactionId);

                    
                    var printButton = element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transaction-details-page/div/div/div/sbpro-transaction-details/sbpro-card/div/div[3]/button[2]'));
                    expect(await browser.isElementPresent(printButton)).to.equal(true)
                    // await printButton.click();
                    // browser.getAllWindowHandles().then(function(handles){
                    //     console.log("handles",handles.length)
                    //     browser.switchTo().window(handles[1]).then(async function(){
                    //         expect(await browser.isElementPresent(element(by.xpath('//*[@id="sidebar"]//print-preview-button-strip//div/cr-button[1]'))))
                    //         expect(await browser.isElementPresent(element(by.xpath('//*[@id="sidebar"]//print-preview-button-strip//div/cr-button[2]'))))
                    //         await browser.sleep(4000);
                    //         await element(by.xpath('//*[@id="sidebar"]//print-preview-button-strip//div/cr-button[2]')).click()
                    //         await browser.close()
                    //         await browser.switchTo().window(handles[0])
                            
                    //     });
                    // });
                    
                }
            })
           
        })
        
   

   
})