import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DoqfyFormComponent } from './doqfy-form.component';

describe('DoqfyFormComponent', () => {
  let component: DoqfyFormComponent;
  let fixture: ComponentFixture<DoqfyFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DoqfyFormComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DoqfyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
