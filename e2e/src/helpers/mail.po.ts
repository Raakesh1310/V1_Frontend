import {
  browser,
  by,
  element,
  ElementFinder,
  promise as pPromise
} from 'protractor';
const POP3Client = require("mailpop3");
import { environment } from '../../environmentTest';

//Helper to connect to mails pop3
export class MailClient {

mailClient: any;

//Connect Mail Client
connectMail(){
  let deferred = pPromise.defer();

  this.mailClient = new POP3Client(environment.pop3Conf.port, environment.pop3Conf.host, {
    tlserrs: false,
    enabletls: environment.pop3Conf.tls,
    debug: false
  });
  this.mailClient.on("connect", () => {
    console.log("CONNECT success");
    this.mailClient.login(environment.pop3Conf.user, environment.pop3Conf.password);
  });
  this.mailClient.on("error", function(error: any) {
    if (error.errno === 111) console.log("Unable to connect to server");
    else console.log("Server error occurred");
    console.log(error);
  });
  this.mailClient.on("login", (status: boolean, rawData: string) => {
    if (status) {
      console.log("LOGIN/PASS success");
      deferred.fulfill(true);
    } else {
      console.log("LOGIN/PASS failed");
      this.mailClient.quit();
    }
  });
  return deferred.promise;
}

//Function to get Email Count 
getEmailCount(){
  let deferred = pPromise.defer();
  this.mailClient.list();

  this.mailClient.on("list", (status: boolean, msgCount: number, msgNumber: number, data: string, rawData: string)  => {
    if (status === false) {
      console.log("LIST failed");
      //this.mailClient.quit();    
    } 
    else {
      console.log("LIST success with " + msgCount + " element(s)");
      if (msgCount > 0){
        deferred.fulfill(msgCount);
        //this.mailClient.quit();
      }
      else{
        console.log("No Mails");
      }
    }
  });
  return deferred.promise;
}

//Function to get email based on count
getEmail(count: number){
  let deferred = pPromise.defer();
  this.mailClient.retr(count);
  console.log("RETR Email number " + count);

  this.mailClient.on("retr", (status: boolean, msgNumber: number, data: string, rawData: string)  => {
    if (status === true) {
      console.log("RETR success for msgNumber " + msgNumber);
      const emailSubject = this.getEmailSubject(data);
      deferred.fulfill({ 
        emailSubject: emailSubject, 
        emailBody: data
      });
      this.mailClient.dele(msgNumber);
    } 
    else 
    {
      console.log("RETR failed for msgnumber " + msgNumber);
    }
    this.mailClient.quit();
  });
  return deferred.promise;
}

//Function to get last email's date time
getLastEmailDate(){
  let deferred = pPromise.defer();
  this.mailClient.retr(1);
  this.mailClient.on("retr", (status: boolean, msgNumber: number, data: string, rawData: string)  => {
    if (status === true) {
      console.log("RETR success for msgNumber " + msgNumber);
      this.mailClient.dele(msgNumber);
      deferred.fulfill(this.getEmailDate(data));
    } 
    else 
    {
      console.log("RETR failed for msgnumber " + msgNumber);
    }
    this.mailClient.quit();
  });
  return deferred.promise;
}

//Function to check for new email based on last email date
checkNewEmail(lastEmailDate: string){
  let deferred = pPromise.defer();
  let checkHits = 0;
  
  const mailChecker = setInterval(() => {
    if (checkHits > 20){
      const emailBody = '', emailSubject = '';
      deferred.fulfill({emailSubject, emailBody});
      clearInterval(mailChecker);
    }
    this.mailClient.retr(1);
    this.mailClient.rset();
    checkHits += 1;
  }, 5000);
  this.mailClient.on("retr", (status: boolean, msgNumber: number, data: string, rawData: string)  => {
    if (status === true) {
      if (this.getEmailDate(data) !== lastEmailDate)
      {
        const emailSubject = this.getEmailSubject(data);
        const emailBody = this.getEmailBody(data);
        clearInterval(mailChecker);
        deferred.fulfill({emailSubject, emailBody});
      }
      this.mailClient.dele(msgNumber);
    } 
    else 
    {
      console.log("RETR failed for msgnumber " + msgNumber);
      clearInterval(mailChecker);
    }
  });
  return deferred.promise;
}

//Get Email Date 
getEmailDate(email: string){
  const dateRegex = /^Date: .*\n?/m;
  const dateLine = email.match(dateRegex);
  if (dateLine){;
    return dateLine[0].split('Date: ')[1];
  }
  return null;
}

//Get Email Subject
getEmailSubject(email: string){
  const subjRegex = /^Subject: .*\n?/m;
  const subjLine = email.match(subjRegex);
  if (subjLine){;
    return subjLine[0].split('Subject: ')[1].replace(/(\r\n|\n|\r)/gm, "");
  }
  return null;
}

//Get Email Subject
getEmailOtp(email: string){
  const otpRegex = /^.*?(\d+) is the OTP(.*)/m;
  const otpLine = email.match(otpRegex);
  if (otpLine){;
    return otpLine[1];
  }
  return null;
}

getEmailUser(email: string){
  const loginRegex = /[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+\S/gm
  const loginLine = email.match(loginRegex);
  if(loginLine){;
    return loginLine[1];
  }
  return null;
}

getEmailPassword(email: string){
  const passwordRegex = /[a-zA-Z0-9]{10}$/gm;
  const passwordLine = email.match(passwordRegex);
  if(passwordLine){
    return passwordLine[0];
  }
  return null;
}

//Get Email Body
getEmailBody(email: string){
  const bodyRegex = /<pre>.*<\/pre>?/g;
  const bodyExpression = email.match(bodyRegex);
  if (bodyExpression){;
    return bodyExpression[0].replace(/<[^>]*>/g, '');
  }
  return null;
}
}                     