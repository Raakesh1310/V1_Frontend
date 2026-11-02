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
 
 
 describe('Outwards fund deposits', ()=>{
   
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
          //browser.sleep(2000);
          await browser.wait(ec.urlContains('dashboard'))
          expect(await browser.getCurrentUrl()).to.equal(
            `${environment.baseRoute}/dashboard`
          );
        });
     
        it('all the field should load', async ()=>{
          //await element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[6]/a')).click();
          await browser.get(`${environment.baseRoute}/portal/passbook`);
          //await element(by.xpath('//*[@id="sidenavAccordion"]/div[1]/div/sbpro-side-nav-item[6]/nav/sbpro-side-nav-item[2]/a')).click();
          expect(await browser.isElementPresent(element(by.xpath('//*[@id="search-box"]')))).to.equal(true);
          expect(await browser.isElementPresent(element(by.xpath('//*[@id="date-from"]')))).to.equal(true);
          expect(await browser.isElementPresent(element(by.xpath('//*[@id="date-to"]')))).to.equal(true);
          expect(await browser.isElementPresent(element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-passbook-overview/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-passbook-table-list/div/form/div[1]/button[1]')))).to.equal(true);
          expect(await browser.isElementPresent(element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-passbook-overview/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-passbook-table-list/div/form/div[1]/button[2]')))).to.equal(true);
          expect(await browser.isElementPresent(element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-passbook-overview/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-passbook-table-list/div/form/div[1]/div/a')))).to.equal(true);

       })

        describe('search filter should be working', ()=>{

          // beforeEach( async ()=>{
          //   await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-passbook-overview/div/div/div/sbpro-passbook-table-list/sbpro-card/div/div[2]/form/div/div[4]/button[2]')).click()
          //   browser.sleep(2000);
          // })
            it('search filter on paymentId should be working', async ()=>{
                const noOfRows = await element.all(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-passbook-overview/div/div/div/sbpro-passbook-table-list/sbpro-card/div/div[2]/div[1]/table/tbody')).count()
                //console.log(noOfRows);
                if(noOfRows > 1){
                    const paymentId = await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-passbook-overview/div/div/div/sbpro-passbook-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr[1]/td[1]/ngb-highlight')).getText()
                    //console.log(paymentId)
                    element(by.xpath('//*[@id="search-box"]')).sendKeys(paymentId)
                    await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-passbook-overview/div/div/div/sbpro-passbook-table-list/sbpro-card/div/div[2]/form/div[1]/button[1]')).click()
                    await browser.wait(ec.textToBePresentInElement(element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-passbook-overview/div/div/div/sbpro-passbook-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr/td[1]/ngb-highlight/span')),paymentId),3000)
                    const newNoOfRows = await element.all(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-passbook-overview/div/div/div/sbpro-passbook-table-list/sbpro-card/div/div[2]/div[1]/table/tbody')).count()
                    expect(newNoOfRows).to.equal(1);
                    //expect(await browser.isElementPresent(element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr[1]/td[1]/ngb-highlight')))).to.equal(true);
                    const newPaymentId = await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-passbook-overview/div/div/div/sbpro-passbook-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr/td[1]/ngb-highlight/span')).getText()
                    expect(newPaymentId).to.equal(paymentId);
                }
            })

            

            it('search filter on virtual account id', async ()=> {
                await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-passbook-overview/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-passbook-table-list/div/form/div[1]/button[2]')).click()
                const noOfRows = await element.all(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-passbook-overview/div/div/div/sbpro-passbook-table-list/sbpro-card/div/div[2]/div[1]/table/tbody')).count()
                if(noOfRows > 1){
                    const accountId = await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-passbook-overview/div/div/div/sbpro-passbook-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr[1]/td[4]/ngb-highlight')).getText()
                    //console.log(accountId)
                    element(by.xpath('//*[@id="search-box"]')).sendKeys(accountId)
                    await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-passbook-overview/div/div/div/sbpro-passbook-table-list/sbpro-card/div/div[2]/form/div[1]/button[1]')).click()
                    await browser.wait(ec.textToBePresentInElement(element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-passbook-overview/div/div/div/sbpro-passbook-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr[1]/td[4]/ngb-highlight/span')),accountId),3000)
                    const rows = await element.all(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/div[1]/table/tbody')).count();
                    for(let i=0;i<rows;i++){
                        const accId = await element(by.xpath(`//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr[${i+1}]/td[4]`)).getText()
                        expect(accountId).to.equal(accId)
                    }
                }
            })

            // it('search filter on Beneficiary Name', async ()=> {
            //     const noOfRows = await element.all(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-passbook-overview/div/div/div/sbpro-passbook-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr')).count()
            //     if(noOfRows > 1){
            //         const benName = await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-passbook-overview/div/div/div/sbpro-passbook-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr[1]/td[5]/ngb-highlight')).getText()
            //         //console.log(benName)
            //         await element(by.xpath('//*[@id="search-box"]')).sendKeys(benName)
            //         await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-passbook-overview/div/div/div/sbpro-passbook-table-list/sbpro-card/div/div[2]/form/div/div[4]/button[1]')).click()
                  
            //         await browser.sleep(2000)
            //         const rows = await element.all(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr')).count();
            //         for(let i=0;i<rows;i++){
            //             const benfName = await element(by.xpath(`//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr[${i+1}]/td[5]`)).getText()
            //             expect(benfName).to.equal(benName)
            //         }
            //     }
            // })

            // it('search filter on Benificiary Account', async ()=> {
            //     const noOfRows = await element.all(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-passbook-overview/div/div/div/sbpro-passbook-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr')).count()
            //     if(noOfRows > 1){
            //         const benfAccount = await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-passbook-overview/div/div/div/sbpro-passbook-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr[1]/td[7]/ngb-highlight')).getText()
            //         //console.log(benfAccount)
            //         await element(by.xpath('//*[@id="search-box"]')).sendKeys(benfAccount)
            //         await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-passbook-overview/div/div/div/sbpro-passbook-table-list/sbpro-card/div/div[2]/form/div/div[4]/button[1]')).click()
            //         await browser.sleep(2000)
            //         const rows = await element.all(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr')).count();
            //         for(let i=0;i<rows;i++){
            //             const benAcc = await element(by.xpath(`//*[@id="layoutSidenav_content"]/main/sbpro-transactions-overview/div/div/div/sbpro-transaction-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr[${i+1}]/td[7]`)).getText()
            //             expect(benfAccount).to.equal(benAcc)
            //         }
            //     }
            // })

            // it('Clicking on the Download option should download the report', async()=>{
            //     await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-passbook-overview/div/div/div/sbpro-passbook-table-list/sbpro-card/div/div[2]/form/div/div[4]/button[2]')).click()
            //     await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-passbook-overview/div/div/div/sbpro-passbook-table-list/sbpro-card/div/div[2]/form/div/div[4]/a')).click()
            //     await browser.sleep(3000)
            //     let dir = path.join(__dirname,'../../../downloads');
            //     //console.log(dir)
            //     let files = fs.readdir(dir,(error,files)=>{
            //       //console.log(files)
            //       expect(files.length).greaterThan(0);
            //       if(files.length > 0){
            //               for (const file of files) {
            //                 fs.unlink(path.join(dir, file), err => {
            //                   if (err) throw err;
            //                 });
            //               }
                        
            //       }
            //     });        
            // });

            it('Clicking on the Payment Id should open the detailed transaction page and print should work',async ()=>{
                await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-passbook-overview/div/sbpro-card-navigation/div/div[2]/div/div/sbpro-passbook-table-list/div/form/div[1]/button[2]')).click()
                const noOfRows = await element.all(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-passbook-overview/div/div/div/sbpro-passbook-table-list/sbpro-card/div/div[2]/div[1]/table/tbody')).count()
                //console.log(noOfRows);
                if(noOfRows > 1){
                    const paymentId = await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-passbook-overview/div/div/div/sbpro-passbook-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr[1]/td[1]/ngb-highlight')).getText()
                    await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-passbook-overview/div/div/div/sbpro-passbook-table-list/sbpro-card/div/div[2]/div[1]/table/tbody/tr[1]/td[1]/ngb-highlight')).click()
                    //await browser.sleep(2000);
                    //await browser.wait(ec.visibilityOf(element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transfer-details-page/div/div/div/sbpro-transfer-details/sbpro-card/div/div[1]'))))
                    expect(await browser.isElementPresent(element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transfer-details-page/div/div/div/sbpro-transfer-details/sbpro-card/div/div[2]/form/div[1]/div[1]/div[1]/p'))));
                    expect(await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transfer-details-page/div/div/div/sbpro-transfer-details/sbpro-card/div/div[2]/form/div[1]/div[1]/div[1]/p')).getText()).to.equal(paymentId);

                    expect(await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transfer-details-page/div/div/div/sbpro-transfer-details/sbpro-card/div/div[2]/form/div[1]/div[1]/div[2]/p')).getText()).to.not.equal('')
                    expect(await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transfer-details-page/div/div/div/sbpro-transfer-details/sbpro-card/div/div[2]/form/div[1]/div[1]/div[3]/p')).getText()).to.not.equal('')

                    expect(await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transfer-details-page/div/div/div/sbpro-transfer-details/sbpro-card/div/div[2]/form/div[1]/div[2]/div[5]/p')).getText()).to.not.equal('')
                    expect(await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transfer-details-page/div/div/div/sbpro-transfer-details/sbpro-card/div/div[2]/form/div[1]/div[2]/div[1]/p')).getText()).to.not.equal('')
                    expect(await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transfer-details-page/div/div/div/sbpro-transfer-details/sbpro-card/div/div[2]/form/div[1]/div[1]/div[4]/p')).getText()).to.not.equal('')


                }
            })

            // it('audit report should download', async()=>{
            //   await element(by.xpath('//*[@id="layoutSidenav_content"]/main/sbpro-transfer-details-page/div/div/div/sbpro-transfer-details/sbpro-card/div/div[2]/form/div[3]/div/div/a/b')).click()
            //   await browser.sleep(20000)
            //   let dir = path.join(__dirname,'../../../downloads');
            //   //console.log(dir)
            //   let files = fs.readdir(dir,(error,files)=>{
            //     //console.log(files)
            //     expect(files.length).greaterThan(0);
            //     if(files.length > 0){
            //             for (const file of files) {
            //               fs.unlink(path.join(dir, file), err => {
            //                 if (err) throw err;
            //               });
            //             }
            //     }
            //   });
              
            // });
        })

       
    })