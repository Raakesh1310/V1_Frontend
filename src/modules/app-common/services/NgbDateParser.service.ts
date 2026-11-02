import { Injectable } from '@angular/core';
import {
  NgbCalendar,
  NgbDateParserFormatter,
  NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import moment from 'moment';
// import {
//   isNumber,
//   padNumber,
//   toInteger
// } from '@ng-bootstrap/ng-bootstrap/util/util';

@Injectable({ providedIn: 'root' })
export class NgbDateParserService extends NgbDateParserFormatter {
  constructor(private calendar: NgbCalendar) {
    super();
  }

  public parse(value: string): NgbDateStruct {
    if (value) {
      const dateParts = value.trim().split('/');
      if (dateParts.length === 1 && this.isNumber(dateParts[0])) {
        return { day: _.toInteger(dateParts[0]), month: 0, year: 0 };
      } else if (
        dateParts.length === 2 &&
        this.isNumber(dateParts[0]) &&
        this.isNumber(dateParts[1])
      ) {
        return {
          day: _.toInteger(dateParts[0]),
          month: _.toInteger(dateParts[1]),
          year: 0
        };
      } else if (
        dateParts.length === 3 &&
        this.isNumber(dateParts[0]) &&
        this.isNumber(dateParts[1]) &&
        this.isNumber(dateParts[2])
      ) {
        return {
          day: _.toInteger(dateParts[0]),
          month: _.toInteger(dateParts[1]),
          year: _.toInteger(dateParts[2])
        };
      }
    }
    return this.calendar.getToday();
  }

  public format(date: NgbDateStruct, sep:string=' '): string {
    return date
      ? `${this.isNumber(date.day) ? date.day : ''}${sep}${
          this.isNumber(date.month)
            ? moment(date.month, 'MM').format('MMM')
            : ''
        }${sep}${date.year}`
      : '';
  }

  // tslint:disable-next-line:no-any
  private isNumber(value: any): value is number {
    return !isNaN(_.parseInt(value));
  }

  private padNumber(value: number) {
    if (this.isNumber(value)) {
      return `0${value}`.slice(-2);
    } else {
      return '';
    }
  }
}
