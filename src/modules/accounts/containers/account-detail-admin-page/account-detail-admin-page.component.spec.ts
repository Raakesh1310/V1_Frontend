import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountDetailAdminPageComponent } from './account-detail-admin-page.component';

describe('AccountDetailAdminPageComponent', () => {
  let component: AccountDetailAdminPageComponent;
  let fixture: ComponentFixture<AccountDetailAdminPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AccountDetailAdminPageComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountDetailAdminPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
