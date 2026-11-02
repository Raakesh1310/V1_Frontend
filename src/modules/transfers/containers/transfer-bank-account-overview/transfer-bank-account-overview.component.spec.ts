import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferBankAccountOverviewComponent } from './transfer-bank-account-overview.component';

describe('TransferBankAccountOverviewComponent', () => {
  let component: TransferBankAccountOverviewComponent;
  let fixture: ComponentFixture<TransferBankAccountOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransferBankAccountOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferBankAccountOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
