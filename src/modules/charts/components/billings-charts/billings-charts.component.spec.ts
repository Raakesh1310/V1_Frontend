import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingsChartsComponent } from './billings-charts.component';

describe('BillingsChartsComponent', () => {
  let component: BillingsChartsComponent;
  let fixture: ComponentFixture<BillingsChartsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BillingsChartsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillingsChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
