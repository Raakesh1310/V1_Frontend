import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChallanTableComponent } from './challan-table.component';

describe('ChallanTableComponent', () => {
  let component: ChallanTableComponent;
  let fixture: ComponentFixture<ChallanTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChallanTableComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChallanTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
