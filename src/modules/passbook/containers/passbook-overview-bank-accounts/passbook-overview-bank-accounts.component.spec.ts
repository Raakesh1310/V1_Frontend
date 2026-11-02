import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PassbookOverviewBankAccountsComponent } from './passbook-overview-bank-accounts.component';

describe('PassbookOverviewBankAccountsComponent', () => {
  let component: PassbookOverviewBankAccountsComponent;
  let fixture: ComponentFixture<PassbookOverviewBankAccountsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PassbookOverviewBankAccountsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PassbookOverviewBankAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
