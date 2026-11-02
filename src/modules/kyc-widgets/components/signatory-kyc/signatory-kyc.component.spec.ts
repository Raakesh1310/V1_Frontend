import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignatoryKycComponent } from './signatory-kyc.component';

describe('SignatoryKycComponent', () => {
  let component: SignatoryKycComponent;
  let fixture: ComponentFixture<SignatoryKycComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignatoryKycComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignatoryKycComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
