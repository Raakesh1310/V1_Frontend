import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndividualKycComponent } from './individual-kyc.component';

describe('IndividualKycComponent', () => {
  let component: IndividualKycComponent;
  let fixture: ComponentFixture<IndividualKycComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IndividualKycComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndividualKycComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
