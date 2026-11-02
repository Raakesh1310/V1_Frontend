import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllDepositsComponent } from './bank-account-all-deposits.component';

describe('AllDepositsComponent', () => {
  let component: AllDepositsComponent;
  let fixture: ComponentFixture<AllDepositsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllDepositsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllDepositsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
