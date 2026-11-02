import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalOverviewComponent } from './approval-overview.component';

describe('ApprovalOverviewComponent', () => {
  let component: ApprovalOverviewComponent;
  let fixture: ComponentFixture<ApprovalOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApprovalOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApprovalOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
