import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChallanFormComponent } from './challan-form.component';

describe('ChallanFormComponent', () => {
  let component: ChallanFormComponent;
  let fixture: ComponentFixture<ChallanFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChallanFormComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChallanFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
