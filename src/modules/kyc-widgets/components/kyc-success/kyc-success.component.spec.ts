import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KycSuccessComponent } from './kyc-success.component';

describe('KycSuccessComponent', () => {
  let component: KycSuccessComponent;
  let fixture: ComponentFixture<KycSuccessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KycSuccessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KycSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
