import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedDepositListContainerComponent } from './fixed-deposit-list-container.component';

describe('FixedDepositListContainerComponent', () => {
  let component: FixedDepositListContainerComponent;
  let fixture: ComponentFixture<FixedDepositListContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FixedDepositListContainerComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedDepositListContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
