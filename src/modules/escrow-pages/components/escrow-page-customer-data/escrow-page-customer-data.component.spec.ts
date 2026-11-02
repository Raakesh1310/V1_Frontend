import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EscrowPageCustomerDataComponent } from './escrow-page-customer-data.component';

describe('EscrowPageCustomerDataComponent', () => {
  let component: EscrowPageCustomerDataComponent;
  let fixture: ComponentFixture<EscrowPageCustomerDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EscrowPageCustomerDataComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EscrowPageCustomerDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
