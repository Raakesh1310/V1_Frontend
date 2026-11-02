import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SimpleChange } from '@angular/core';
import { NgbDateStruct, NgbDate, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'sbpro-date-range',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './date-range.component.pug',
    styleUrls: ['date-range.component.scss'],
})
export class DateRangeComponent implements OnInit {
    predefinedRanges!: { [key: string]: { startDate: NgbDateStruct, endDate: NgbDateStruct } };
    startDate!: NgbDateStruct;
    endDate!: NgbDateStruct;
    selectedRange: string = '1d';
    minDate!: NgbDateStruct;
    maxDate!: NgbDateStruct;
    @Output() dateChange = new EventEmitter<{ startDate: any, endDate: any }>();
    @Output() error = new EventEmitter<string>();
    @Input() selectedReport: string = '';
    constructor(
        private calendar: NgbCalendar,
        private cdr: ChangeDetectorRef,
    ) {
        this.predefinedRanges = {
            '1d': this.calculateDateRange(1),
            '1w': this.calculateDateRange(7),
            '1m': this.calculateDateRange(30),
        };
        const today = this.calendar.getToday();
        const minDateDate = new Date(today.year, today.month - 1, today.day);
        minDateDate.setMonth(minDateDate.getMonth() - 6);
        this.minDate = {
            year: minDateDate.getFullYear(),
            month: minDateDate.getMonth() + 1, // NgbDateStruct month is 1-based
            day: minDateDate.getDate()
        };
        this.maxDate = today;
    }
    ngOnInit() {
        this.applyDateRange('1d');
    }

    ngOnChanges(changes: SimpleChange) {
        if (this.selectedReport === 'Statement') {
            const today = this.calendar.getToday();
            const minDateDate = new Date(today.year, today.month - 1, today.day);
            minDateDate.setMonth(minDateDate.getMonth() - 12);
            this.minDate = {
                year: minDateDate.getFullYear(),
                month: minDateDate.getMonth() + 1, // NgbDateStruct month is 1-based
                day: minDateDate.getDate()
            };
            this.cdr.detectChanges();
        }
    }
    /**
 *  
 * @param days 
 * @returns Date from the range of days
 */
    private calculateDateRange(days: number): { startDate: NgbDateStruct, endDate: NgbDateStruct } {
        const today = this.calendar.getToday();
        const startDate = new NgbDate(today.year, today.month, today.day);
        startDate.day -= days;

        return {
            startDate: this.calendar.getPrev(today, 'd', days),
            endDate: today
        };
    }


    /**
     * 
     * @param startDate 
     * @param endDate 
     * @returns boolean if the data is valid or not 
     */
    private validateDateRange(startDate: NgbDateStruct, endDate: NgbDateStruct): boolean {
        const start = new NgbDate(startDate.year, startDate.month, startDate.day);
        const end = new NgbDate(endDate.year, endDate.month, endDate.day);
        return start.before(end) || start.equals(end);
    }


    /**
     * This function sets the date from the range provided 
     * @param range 
     */
    applyDateRange(range: string): void {
        const dateRange = this.predefinedRanges[range];
        if (this.validateDateRange(dateRange.startDate, dateRange.endDate)) {
            this.startDate = dateRange.startDate;
            this.endDate = dateRange.endDate;
            this.selectedRange = range;
            this.emitDateChange();
            this.cdr.detectChanges();
        } else {
            console.error('Invalid date range:', dateRange);
        }
    }

    /**
     * 
     * @param range 
     * @returns The numbers of days from the range
     */
    getDaysForRange(range: string): number {
        const rangeMapping: { [key: string]: number } = {
            '1d': 1,
            '1w': 7,
            '1m': 30,
            '1y': 365
        };
        return rangeMapping[range] || 0;
    }

    /**
     * 
     * @param startDate 
     * @param endDate 
     * @returns The range from the date provided "1d", "1w", "1m", "1y" and "custom"
     */
    getMatchingRange(): string | null {
        for (const range in this.predefinedRanges) {
            const { startDate, endDate } = this.predefinedRanges[range];
            if (this.isSameDate(startDate, this.startDate) && this.isSameDate(endDate, this.endDate)) {
                return range;
            }
        }
        return null;
    }


    private isSameDate(date1: NgbDateStruct, date2: NgbDateStruct): boolean {
        const d1 = new NgbDate(date1.year, date1.month, date1.day);
        const d2 = new NgbDate(date2.year, date2.month, date2.day);
        return d1.equals(d2);
    }

    onDateRangeChange(range: string): void {
        this.applyDateRange(range);
    }


    onDateSelect(type: 'start' | 'end', selectedDate: NgbDateStruct): void {
        if (type === 'start') {
            this.startDate = selectedDate;
        } else {
            this.endDate = selectedDate;
        }

        // Adjust dropdown if dates match a predefined range
        const matchingRange = this.getMatchingRange();
        this.selectedRange = matchingRange || 'custom';

        // Additional validation
        if (!this.validateDateRange(this.startDate, this.endDate)) {
            console.log('Selected dates are invalid.');
        }
        this.emitDateChange();
        this.cdr.detectChanges();
    }

    emitDateChange() {
        const { year: startYear, month: startMonth, day: startDay } = this.startDate;
        const { year: endYear, month: endMonth, day: endDay } = this.endDate;
        if (startYear > endYear ||
            (startYear === endYear && startMonth > endMonth) ||
            (startYear === endYear && startMonth === endMonth && startDay > endDay)) {
            this.error.emit('Start date cannot be after end date');
            this.dateChange.emit({ startDate: this.startDate, endDate: this.endDate });
        } else {
            // this.error.emit(undefined);
            this.dateChange.emit({ startDate: this.startDate, endDate: this.endDate });
        }
    }
}
