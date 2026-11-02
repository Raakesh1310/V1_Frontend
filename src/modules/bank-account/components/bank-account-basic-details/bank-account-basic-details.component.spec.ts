import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BankAccountBasicDetailsComponent } from './bank-account-basic-details.component';

describe('BankAccountBasicDetailsComponent', () => {
  let component: BankAccountBasicDetailsComponent;
  let fixture: ComponentFixture<BankAccountBasicDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BankAccountBasicDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BankAccountBasicDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
