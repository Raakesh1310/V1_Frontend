import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InwardOutwardChartComponent } from './inward-outward-chart.component';

describe('InwardOutwardChartComponent', () => {
  let component: InwardOutwardChartComponent;
  let fixture: ComponentFixture<InwardOutwardChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InwardOutwardChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InwardOutwardChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
