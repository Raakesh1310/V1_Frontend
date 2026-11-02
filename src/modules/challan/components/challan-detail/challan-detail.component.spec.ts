import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChallanDetailComponent } from './challan-detail.component';

describe('ChallanDetailComponent', () => {
  let component: ChallanDetailComponent;
  let fixture: ComponentFixture<ChallanDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChallanDetailComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChallanDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
