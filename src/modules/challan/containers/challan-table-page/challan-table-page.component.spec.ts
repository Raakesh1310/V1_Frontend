import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChallanTablePageComponent } from './challan-table-page.component';

describe('ChallanTablePageComponent', () => {
  let component: ChallanTablePageComponent;
  let fixture: ComponentFixture<ChallanTablePageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChallanTablePageComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChallanTablePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
