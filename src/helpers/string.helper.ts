import { Injectable } from "@angular/core";

@Injectable()
export default class StringHelper {
  private static _instance: StringHelper;

  static getInstance() {
    if (!this._instance) this._instance = new StringHelper();
    return this._instance;
  }

  /**
   * Please use Number helper's function instead
   *
   * @param num
   * @param maximumFractionDigits
   * @deprecated
   */
  convertToIndianCurrency(num: number, maximumFractionDigits = 2) {
    const type = typeof num;

    if (type === 'number')
      return num.toLocaleString('en-IN', {
        maximumFractionDigits,
        style: 'currency',
        currency: 'INR'
      });

    return '';
  }

  // convertToIndianCurrency(num: number) {
  //   return num.toLocaleString('en-IN', {
  //     maximumFractionDigits: 2,
  //     style: 'currency',
  //     currency: 'INR'

  //   });
  // }
}
