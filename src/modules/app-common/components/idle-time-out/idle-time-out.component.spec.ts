import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IdleTimeOutComponent } from './idle-time-out.component';

describe('IdleTimeOutComponent', () => {
  let component: IdleTimeOutComponent;
  let fixture: ComponentFixture<IdleTimeOutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IdleTimeOutComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IdleTimeOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
