import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DoqfyFormComponentComponent } from './doqfy-form-component.component';

describe('DoqfyFormComponentComponent', () => {
  let component: DoqfyFormComponentComponent;
  let fixture: ComponentFixture<DoqfyFormComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DoqfyFormComponentComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DoqfyFormComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
