import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DoqfyOrderComponent } from './doqfy-order.component';

describe('DoqfyOrderComponent', () => {
  let component: DoqfyOrderComponent;
  let fixture: ComponentFixture<DoqfyOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DoqfyOrderComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DoqfyOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
