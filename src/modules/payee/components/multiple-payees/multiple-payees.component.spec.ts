import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiplePayeesComponent } from './multiple-payees.component';

describe('MultiplePayeesComponent', () => {
  let component: MultiplePayeesComponent;
  let fixture: ComponentFixture<MultiplePayeesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiplePayeesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiplePayeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
