import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkTransferApprovalComponent } from './bulk-transfer-approval.component';

describe('BulkTransferApprovalComponent', () => {
  let component: BulkTransferApprovalComponent;
  let fixture: ComponentFixture<BulkTransferApprovalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkTransferApprovalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkTransferApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
