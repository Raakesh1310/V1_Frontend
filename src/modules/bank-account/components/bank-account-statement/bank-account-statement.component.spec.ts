import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BankAccountStatementComponent } from './bank-account-statement.component';

describe('BankAccountStatementComponent', () => {
  let component: BankAccountStatementComponent;
  let fixture: ComponentFixture<BankAccountStatementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BankAccountStatementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BankAccountStatementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
