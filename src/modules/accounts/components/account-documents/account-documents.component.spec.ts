import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountDocumentsComponent } from './account-documents.component';

describe('AccountDocumentsComponent', () => {
  let component: AccountDocumentsComponent;
  let fixture: ComponentFixture<AccountDocumentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AccountDocumentsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
