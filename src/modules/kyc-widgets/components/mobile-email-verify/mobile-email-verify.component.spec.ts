import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileEmailVerifyComponent } from './mobile-email-verify.component';

describe('MobileEmailVerifyComponent', () => {
  let component: MobileEmailVerifyComponent;
  let fixture: ComponentFixture<MobileEmailVerifyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MobileEmailVerifyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileEmailVerifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
