import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EscrowPagesCustomerDetailsComponent } from './escrow-pages-customer-details.component';

describe('EscrowPagesCustomerDetailsComponent', () => {
  let component: EscrowPagesCustomerDetailsComponent;
  let fixture: ComponentFixture<EscrowPagesCustomerDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EscrowPagesCustomerDetailsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EscrowPagesCustomerDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
