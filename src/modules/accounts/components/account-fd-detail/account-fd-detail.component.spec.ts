import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountFdDetailComponent } from './account-fd-detail.component';

describe('AccountFdDetailComponent', () => {
  let component: AccountFdDetailComponent;
  let fixture: ComponentFixture<AccountFdDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AccountFdDetailComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountFdDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
