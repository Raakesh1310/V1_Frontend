import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KycWidgetMobileEmailComponent } from './kyc-widget-mobile-email.component';

describe('KycWidgetMobileEmailComponent', () => {
  let component: KycWidgetMobileEmailComponent;
  let fixture: ComponentFixture<KycWidgetMobileEmailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KycWidgetMobileEmailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KycWidgetMobileEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
