import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountSourceValidationComponent } from './account-source-validation.component';

describe('AccountSourceValidationComponent', () => {
  let component: AccountSourceValidationComponent;
  let fixture: ComponentFixture<AccountSourceValidationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountSourceValidationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountSourceValidationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
