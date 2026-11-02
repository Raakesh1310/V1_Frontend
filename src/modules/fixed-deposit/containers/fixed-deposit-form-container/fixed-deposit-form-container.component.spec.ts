import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedDepositFormContainerComponent } from './fixed-deposit-form-container.component';

describe('FixedDepositFormContainerComponent', () => {
  let component: FixedDepositFormContainerComponent;
  let fixture: ComponentFixture<FixedDepositFormContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FixedDepositFormContainerComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedDepositFormContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
