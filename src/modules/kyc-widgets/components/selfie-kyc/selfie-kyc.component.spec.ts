import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelfieKycComponent } from './selfie-kyc.component';

describe('SelfieKycComponent', () => {
  let component: SelfieKycComponent;
  let fixture: ComponentFixture<SelfieKycComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelfieKycComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelfieKycComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
