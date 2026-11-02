import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardEscrowCbOverviewComponent } from './dashboard-escrow-cb-overview.component';

describe('DashboardEscrowCbOverviewComponent', () => {
  let component: DashboardEscrowCbOverviewComponent;
  let fixture: ComponentFixture<DashboardEscrowCbOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardEscrowCbOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardEscrowCbOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
