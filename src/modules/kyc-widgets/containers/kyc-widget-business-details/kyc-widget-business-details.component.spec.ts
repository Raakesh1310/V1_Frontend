import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KycWidgetBusinessDetailsComponent } from './kyc-widget-business-details.component';

describe('KycWidgetBusinessDetailsComponent', () => {
  let component: KycWidgetBusinessDetailsComponent;
  let fixture: ComponentFixture<KycWidgetBusinessDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KycWidgetBusinessDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KycWidgetBusinessDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
