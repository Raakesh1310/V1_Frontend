import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduledTransferComponent } from './scheduled-transfer.component';

describe('ScheduledTransferComponent', () => {
  let component: ScheduledTransferComponent;
  let fixture: ComponentFixture<ScheduledTransferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ScheduledTransferComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduledTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
