import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileBankDetailsComponent } from './profile-bank-details.component';

describe('ProfileBankDetailsComponent', () => {
  let component: ProfileBankDetailsComponent;
  let fixture: ComponentFixture<ProfileBankDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProfileBankDetailsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileBankDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
