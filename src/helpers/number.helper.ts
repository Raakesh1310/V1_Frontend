export default class NumberHelper {
  private static _instance: NumberHelper;

  static getInstance() {
    if (!this._instance) this._instance = new NumberHelper();
    return this._instance;
  }

  /**
   * Format Number to given currency
   * @param val
   * @param options
   */
  formatCurrency(val: number, options?: Intl.NumberFormatOptions) {
    // noinspection SuspiciousTypeOfGuard
    if (typeof val !== 'number' || Number.isNaN(val)) {
      val = 0;
    }

    if (!options) options = {} as Intl.NumberFormatOptions;

    options.style = 'currency';

    if (!options.maximumFractionDigits) options.maximumFractionDigits = 2;
    if (!options.currency) options.currency = 'INR';

    return val.toLocaleString('en-IN', options);
  }

  /**
   * Format Number to given style format
   *
   * @param val
   * @param options
   */
  formatNumber(val: number, options?: Intl.NumberFormatOptions) {
    // noinspection SuspiciousTypeOfGuard
    if (typeof val !== 'number') return '';

    return val.toLocaleString('en-IN', options);
  }
}
