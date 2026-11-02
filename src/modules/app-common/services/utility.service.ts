import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import {
  CopyToClipboard,
  CopyToClipboardOptions,
  ToastMessageData,
  ToastMessageOptions
} from '@common/models';
import { ToastService } from '@common/services/toast.service';
import { OTPResponseModel } from '@modules/auth/models/otp-response.model';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import copyToClipboard from 'copy-to-clipboard';
import moment from 'moment-timezone';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

@Injectable()
export class UtilityService {
  _window: Window;
  parse: JSON['parse'];
  stringify: JSON['stringify'];
  localStorage: Storage;
  _copyToClipboard: CopyToClipboard;
  emailRegex: RegExp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  constructor(private http: HttpClient, private toastService: ToastService) {
    this._window = window;
    this.parse = JSON.parse;
    this.stringify = JSON.stringify;
    this.localStorage = localStorage;
    this._copyToClipboard = copyToClipboard;
  }

  get window(): Window {
    return this._window;
  }

  get version$(): Observable<string> {
    return this.http.get('/assets/version', { responseType: 'text' });
  }

  getStoredObject<T>(objectName: string): T | undefined {
    const objectString = this.localStorage.getItem(objectName);
    if (!objectString) {
      return undefined;
    }
    return this.parse(objectString) as T;
  }

  storeObject(objectName: string, objectToStore: {}): void {
    this.localStorage.setItem(objectName, this.stringify(objectToStore));
  }

  copyToClipboard(text: string, options?: CopyToClipboardOptions) {
    this._copyToClipboard(text, options);
  }

  verifyOTP(otp: number) {
    return this.http.post(environment.apiPrefix + '/auth/otp/verify', {
      otp
    });
  }

  /**
   * Send Otp to mobile
   * by generating 4 digit random number
   * templateId is optional
   */
  sendOTP(
    templateId: string,
    mobile: number | null | undefined,
    data?: object
  ) {
    if (mobile) {
      return this.http.get(
        `${environment.apiPrefix}/auth/otp/generate/${mobile}`,
        {
          params: { templateId, ...data }
        }
      );
    }
    return this.http.get(environment.apiPrefix + '/auth/otp/generate', {
      params: { templateId }
    });
  }

  fetchFile(fileName: string, folderName: string) {
    return this.http.get(environment.apiPrefix + '/document/aws-s3/download', {
      params: {
        fileName,
        folderName
      },
      responseType: 'blob',
      observe: 'response'
    });
  }

  async downloadFile(
    $event: Event,
    fileHash: string,
    folderName: string,
    fileName?: string
  ) {
    $event.preventDefault();
    try {
      const result = await this.fetchFile(fileHash, folderName).subscribe(
        (resp: any) => {
          this.saveFile(resp?.body, fileName as string);
        },
        (error: any) => {
          this.showToast('Error', `Cannot download file ${fileName}`, {
            headerClasses: 'bg-danger text-white'
          });
          console.log(error);
        }
      );
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  }
  public saveFile(blobPart: BlobPart, fileName: string) {
    const blob = new Blob([blobPart]);

    // Create a link element and click it to trigger the download
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(link.href);
  }

  /**
   * Send Otp to mobile
   * by generating 4 digit random number
   * templateId is optional
   */
  resendOTP(
    templateId: string,
    mobile: number | null | undefined,
    data?: object
  ): Observable<OTPResponseModel> {
    if (mobile) {
      return this.http
        .get<OTPResponseModel>(
          environment.apiPrefix + `/auth/otp/regenerate/${mobile}`,
          {
            params: { templateId }
          }
        )
        .pipe(
          map(resp => {
            return resp;
          }),
          catchError(err => {
            console.log(err);
            return throwError(err);
          })
        );
    }
    return this.http
      .get<OTPResponseModel>(environment.apiPrefix + `/auth/otp/regenerate`, {
        params: { templateId }
      })
      .pipe(
        map(resp => {
          return resp;
        }),
        catchError(err => {
          console.log(err);
          return throwError(err);
        })
      );
  }

  sendMailOTP(template: string) {
    return this.http.get(
      `${environment.apiPrefix}/verification/email/otp/generate/${template}`
    );
  }
  verifyMailOTP(otp: number) {
    return this.http.get(
      `${environment.apiPrefix}/verification/email/otp/verify/${otp}`
    );
  }

  onlyAlphaNumeric(e: any) {
    try {
      let name = e.key;
      let validation = name.toLowerCase().match(/[a-zA-Z0-9 ]+/);
      if (
        validation ||
        name === 'Backspace' ||
        name === 'Delete' ||
        name === 'ArrowRight' ||
        name === 'ArrowLeft'
      ) {
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  onlyNumeric(e: any) {
    try {
      let name = e.key;
      let validation = name.toLowerCase().match(/[0-9]+/g);
      if (
        validation ||
        name === 'Backspace' ||
        name === 'Delete' ||
        name === 'ArrowRight' ||
        name === 'ArrowLeft'
      ) {
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  onlyNumericWithoutDecimal(name: any) {
    try {
      // let name = e.key;
      let validation = name.toLowerCase().match(/[0-9]+/g);
      if (
        validation ||
        name === 'Backspace' ||
        name === 'Delete' ||
        name === 'ArrowRight' ||
        name === 'ArrowLeft'
      ) {
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const forbidden = this.emailRegex.test(control.value);
      return !forbidden ? { email: { value: control.value } } : null;
    };
  }

  emailIsInvalid(email: string) {
    try {
      let name = email;
      let validation = name.toLowerCase().match(/^[\w-\.]+@([\w-]+\.)+[\w-]+$/);
      if (!validation) {
        return 'Invalid Email Address.';
      }
    } catch (e) {
      return 'Invalid Email Address.';
    }
  }

  validateName(e: any) {
    try {
      let name = e.key;
      let validation = name.toLowerCase().match(/^[a-zA-Z ]+$/);
      if (
        validation ||
        name === 'Backspace' ||
        name === 'Delete' ||
        name === 'ArrowRight' ||
        name === 'ArrowLeft'
      ) {
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  firstCapitalize(str: string) {
    try {
      if (str[0]) {
        return str[0].toUpperCase() + str.slice(1);
      }
    } catch (e) {}
    return '';
  }

  getFullName(firstName: string | null, lastName: string | null) {
    let result = firstName || '';
    if (lastName !== '') {
      if (result.length > 0) {
        result += ' ';
      }
      result += lastName;
    }
    return result;
  }

  showToast(
    header: ToastMessageData,
    body: ToastMessageData,
    options: ToastMessageOptions = {}
  ) {
    const defaultOptions = {
      autohide: true,
      delay: 5000
    };
    this.toastService.show(header, body, { ...defaultOptions, ...options });
  }

  /**
   * To parse the given date string
   * with the given timezone in string format
   * and return the moment object for the same
   *
   * @param dateStr
   * @param timezone
   */
  public parseByTimeZone(dateStr: string, timezone: string): moment.Moment {
    return moment(new Date(dateStr)).tz(timezone);
  }

  /*
   * Format number according to indian currency
   */
  public toINR(number: number) {
    const numberParts = number.toString().split('.');
    const numberString = numberParts[0];
    const fractionalPart = numberParts.length > 0 ? numberParts[1] : null;
    let lastThree = numberString.slice(Math.max(0, numberString.length - 3));
    const otherNumbers = numberString.slice(
      0,
      Math.max(0, numberString.length - 3)
    );
    if (otherNumbers != '') lastThree = ',' + lastThree;
    let res =
      '₹' + otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
    return fractionalPart
      ? [res, fractionalPart.slice(0, 2)].join('.')
      : [res, '00'].join('.');
  }

  public getNextDayFromNgb(date: NgbDateStruct): NgbDateStruct {
    const _date = new Date(`${date.year}/${date.month}/${date.day}`);
    const newDate = moment(_date).add(24, 'hours');
    return {
      day: newDate.date(),
      month: newDate.month() + 1,
      year: newDate.year()
    } as NgbDateStruct;
  }

  public isNotNullOrEmptyString(str: string | null) {
    return !!str && str !== '';
  }

  exactLengthValidator(length: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value && control.value.length !== length) {
        return {
          exactLength: {
            requiredLength: length,
            actualLength: control.value.length
          }
        };
      }
      return null;
    };
  }

  noSpaceValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const hasSpace = /\s/.test(control.value);
      return hasSpace ? { noSpace: { value: control.value } } : null;
    };
  }

}
