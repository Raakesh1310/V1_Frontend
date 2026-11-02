import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpdeskFormComponent } from './helpdesk-form.component';

describe('HelpdeskFormComponent', () => {
  let component: HelpdeskFormComponent;
  let fixture: ComponentFixture<HelpdeskFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HelpdeskFormComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpdeskFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
