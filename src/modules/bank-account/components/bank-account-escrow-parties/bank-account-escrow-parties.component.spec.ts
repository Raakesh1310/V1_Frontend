import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BankAccountEscrowPartiesComponent } from './bank-account-escrow-parties.component';

describe('BankAccountEscrowPartiesComponent', () => {
  let component: BankAccountEscrowPartiesComponent;
  let fixture: ComponentFixture<BankAccountEscrowPartiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BankAccountEscrowPartiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BankAccountEscrowPartiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
