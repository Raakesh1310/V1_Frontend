import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkTransferBankAccountOverviewComponent } from './bulk-transfer-bank-account-overview.component';

describe('BulkTransferBankAccountOverviewComponent', () => {
  let component: BulkTransferBankAccountOverviewComponent;
  let fixture: ComponentFixture<BulkTransferBankAccountOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkTransferBankAccountOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkTransferBankAccountOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
