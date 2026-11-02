import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DoqfyOrderComponentComponent } from './doqfy-order-component.component';

describe('DoqfyOrderComponentComponent', () => {
  let component: DoqfyOrderComponentComponent;
  let fixture: ComponentFixture<DoqfyOrderComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DoqfyOrderComponentComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DoqfyOrderComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
