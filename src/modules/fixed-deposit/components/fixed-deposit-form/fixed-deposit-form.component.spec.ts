import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedDepositFormComponent } from './fixed-deposit-form.component';

describe('FixedDepositFormComponent', () => {
  let component: FixedDepositFormComponent;
  let fixture: ComponentFixture<FixedDepositFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FixedDepositFormComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedDepositFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
