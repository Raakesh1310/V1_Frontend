import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KycWidgetBaseComponent } from './kyc-widget-base.component';

describe('KycWidgetBaseComponent', () => {
  let component: KycWidgetBaseComponent;
  let fixture: ComponentFixture<KycWidgetBaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KycWidgetBaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KycWidgetBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
