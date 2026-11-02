import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkApprovalDetailOverviewComponent } from './bulk-approval-detail-overview.component';

describe('BulkApprovalDetailOverviewComponent', () => {
  let component: BulkApprovalDetailOverviewComponent;
  let fixture: ComponentFixture<BulkApprovalDetailOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkApprovalDetailOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkApprovalDetailOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
