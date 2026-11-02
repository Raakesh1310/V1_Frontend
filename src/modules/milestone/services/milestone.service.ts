import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgbDateParserService } from '@common/services/NgbDateParser.service';
import { AuthService } from '@modules/auth/services';
import { MilestoneModel } from '@modules/milestone/models';
import { GetMilestoneResponseModel } from '@modules/milestone/models/get-milestone-response.model';
import { GetMilestonesResponseModel } from '@modules/milestone/models/get-milestones-response.model';
import { SortDirection } from '@modules/transactions/directives';
import {
  NgbCalendar,
  NgbDate,
  NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';
import { maxHeaderSize } from 'http';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

interface State {
  page: number;
  pageSize: number;

  /**
   * Date From
   * with MinDate field
   * with MaxDate field
   */
  dateFrom: NgbDateStruct;
  dateFromMin: NgbDateStruct;
  dateFromMax: NgbDateStruct;

  /**
   * Date To
   * with MinDate field
   * with MaxDate field
   */
  dateTo: NgbDateStruct;
  dateToMin: NgbDateStruct;
  dateToMax: NgbDateStruct;

  searchTerm: string;
  sortColumn: string;
  sortDirection: SortDirection;
}

@Injectable()
export class MilestoneService {
  private _searchTerm!: string;
  private _milestoneId!: string;
  /**
   * Behaviour subject for Milestone list
   * it get triggered whenever the list
   * gets updated
   */
  private _milestones$ = new BehaviorSubject<MilestoneModel[]>([]);
  private _milestone$ = new BehaviorSubject<MilestoneModel>(
    {} as MilestoneModel
  );

  /**
   * Handles Waiting state
   * whenever any data
   * is being searched/fetched
   * from server
   */
  private _search$ = new Subject<void>();
  private _searchOne$ = new Subject<void>();

  /**
   * Handles Waiting state
   * while loading the data
   */
  private _loading$ = new BehaviorSubject<boolean>(true);

  /**
   * Handles field updates
   * it gets triggered whenever
   * any field gets updated
   */
  private _fieldUpdated$ = new Subject<void>();

  constructor(
    private httpClient: HttpClient,
    private calendar: NgbCalendar,
    private dateParser: NgbDateParserService,
    private authService: AuthService
  ) {
    /**
     * Initialize the dates
     */
    const dNow = new Date();
    this.dateFromMax = calendar.getNext(
      new NgbDate(dNow.getFullYear(), dNow.getMonth() + 1, dNow.getDate()),
      'd',
      0
    );

    // Copy the Instance
    this.dateToMax = this.dateFromMax;

    /**
     * Subscribe to handle
     * Field Updates
     */
    this._fieldUpdated$.subscribe(() => {
      /**
       * Do some Special type of stuff
       * whenever any field gets updated
       */
    });

    /**
     * Subscribe to handle
     * Data search
     */
    this._search$
      .pipe(
        tap(() => this._loading$.next(true)),
        // debounceTime(120),
        switchMap(() => this._search()),
        tap(() => this._loading$.next(false))
      )
      .subscribe((response: GetMilestonesResponseModel) => {
        /**
         * Update and store the value
         * in BehaviourSubject var
         */
        this._milestones$.next(response.result);
      });

    /**
     * Subscribe to handle
     * for searching single entry
     */
    this._searchOne$
      .pipe(
        tap(() => this._loading$.next(true)),
        switchMap(() => this._searchOne(this._milestoneId)),
        tap(() => this._loading$.next(false))
      )
      .subscribe((response: GetMilestoneResponseModel) => {
        this._milestone$.next(response.result);
      });
  }

  private _state: State = {
    page: 1,
    pageSize: 10,
    searchTerm: '',

    /**
     * Date From
     * with MinDate field
     * with MaxDate field
     */
    dateFrom: this.calendar.getNext(new NgbDate(0, 0, 0), 'd', 0),
    dateFromMin: this.calendar.getNext(new NgbDate(0, 0, 0), 'd', 0),
    dateFromMax: this.calendar.getNext(new NgbDate(0, 0, 0), 'd', 0),

    /**
     * Date To
     * with MinDate field
     * with MaxDate field
     */
    dateTo: this.calendar.getNext(new NgbDate(0, 0, 0), 'd', 0),
    dateToMin: this.calendar.getNext(new NgbDate(0, 0, 0), 'd', 0),
    dateToMax: this.calendar.getNext(new NgbDate(0, 0, 0), 'd', 0),

    sortColumn: '',
    sortDirection: ''
  };

  public fetchMilestones() {
    this._search$.next();
  }

  get milestones$(): Observable<MilestoneModel[]> {
    return this._milestones$.asObservable();
  }

  get milestone$(): Observable<MilestoneModel> {
    return this._milestone$.asObservable();
  }
  get loading$(): Observable<boolean> {
    return this._loading$.asObservable();
  }

  get search$(): Observable<void> {
    return this._search$.asObservable();
  }

  get searchOne$(): Observable<void> {
    return this._searchOne$.asObservable();
  }

  set searchTerm(str: string) {
    this._searchTerm = str;
  }

  get page() {
    return 1;
  }

  get dateFrom() {
    return this._state.dateFrom;
  }

  set dateFrom(dateFrom) {
    this._set({ dateFrom });

    this.dateToMin = this.calendar.getNext(
      new NgbDate(this.dateFrom.year, this.dateFrom.month, this.dateFrom.day),
      'd',
      0
    );
  }

  get dateFromMin() {
    return this._state.dateFromMin;
  }

  set dateFromMin(dateFromMin) {
    this._set({ dateFromMin });
  }

  get dateFromMax() {
    return this._state.dateFromMax;
  }

  set dateFromMax(dateFromMax) {
    this._set({ dateFromMax });
  }

  get dateTo() {
    return this._state.dateTo;
  }

  set dateTo(dateTo) {
    this._set({ dateTo });

    this.dateFromMax = this.calendar.getNext(
      new NgbDate(this.dateTo.year, this.dateTo.month, this.dateTo.day),
      'd',
      0
    );
  }

  get dateToMin() {
    return this._state.dateToMin;
  }

  set dateToMin(dateToMin) {
    this._set({ dateToMin });
  }

  get dateToMax() {
    return this._state.dateToMax;
  }

  set dateToMax(dateToMax) {
    this._set({ dateToMax });
  }

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);

    /**
     * Trigger the field updated
     * var
     */
    this._fieldUpdated$.next();
  }

  private _search(): Observable<GetMilestonesResponseModel> {
    console.log('Retrieving Milestone Data');

    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Enable loading state
    this._loading$.next(true);

    // tslint:disable-next-line:no-any
    const params: any = { page: this.page };

    /**
     * Date filters
     */
    // if(){
    //
    // }

    return this.httpClient.get<GetMilestonesResponseModel>(
      environment.apiPrefix + '/milestone',
      {
        headers: httpHeaders,
        params
      }
    );
  }

  private _searchOne(
    milestoneId: string
  ): Observable<GetMilestoneResponseModel> {
    /**
     * Prepare header for the request
     */
    const httpHeaders = new HttpHeaders();
    httpHeaders.append('Content-Type', 'application/json');

    /**
     * Perform the actual request
     * by using httpHeaders
     */
    return this.httpClient.get<GetMilestoneResponseModel>(
      environment.apiPrefix + '/milestone/' + milestoneId,
      { headers: httpHeaders }
    );
  }
}
