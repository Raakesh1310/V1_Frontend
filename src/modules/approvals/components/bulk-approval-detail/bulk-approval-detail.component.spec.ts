import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkApprovalDetailComponent } from './bulk-approval-detail.component';

describe('BulkApprovalDetailComponent', () => {
  let component: BulkApprovalDetailComponent;
  let fixture: ComponentFixture<BulkApprovalDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkApprovalDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkApprovalDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
