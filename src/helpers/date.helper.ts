import moment from 'moment-timezone';
import { Service } from 'typedi';

@Service()
export default class DateHelper {

  /**
   * Converts the given date object to given timezone
   * and return the UTC formatted timezone
   *
   * @param date
   * @param timeZone
   */
  public convertToTimeZone(date: Date, timeZone: string): moment.Moment {
    return moment(date).tz(timeZone);
  }

}
