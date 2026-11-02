import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountPayeeDetailComponent } from './account-payee-detail.component';

describe('AccountPayeeDetailComponent', () => {
  let component: AccountPayeeDetailComponent;
  let fixture: ComponentFixture<AccountPayeeDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AccountPayeeDetailComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountPayeeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
