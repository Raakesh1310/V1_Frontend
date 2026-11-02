import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BankAccountBgComponent } from './bank-account-bg.component';

describe('BankAccountBgComponent', () => {
  let component: BankAccountBgComponent;
  let fixture: ComponentFixture<BankAccountBgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BankAccountBgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BankAccountBgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
