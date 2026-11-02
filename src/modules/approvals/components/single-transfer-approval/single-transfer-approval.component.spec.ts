import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleTransferApprovalComponent } from './single-transfer-approval.component';

describe('SingleTransferApprovalComponent', () => {
  let component: SingleTransferApprovalComponent;
  let fixture: ComponentFixture<SingleTransferApprovalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SingleTransferApprovalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleTransferApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
