import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectedBankingStatementsComponent } from './connected-banking-statements.component';

describe('ConnectedBankingStatementsComponent', () => {
  let component: ConnectedBankingStatementsComponent;
  let fixture: ComponentFixture<ConnectedBankingStatementsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConnectedBankingStatementsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectedBankingStatementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
