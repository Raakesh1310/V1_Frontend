import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EscrowPageFieldAadhaarComponent } from './escrow-page-field-aadhaar.component';

describe('EscrowPageFieldAadhaarComponent', () => {
  let component: EscrowPageFieldAadhaarComponent;
  let fixture: ComponentFixture<EscrowPageFieldAadhaarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EscrowPageFieldAadhaarComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EscrowPageFieldAadhaarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
