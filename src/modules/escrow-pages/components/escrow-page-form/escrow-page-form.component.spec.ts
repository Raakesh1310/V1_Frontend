import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EscrowPageFormComponent } from './escrow-page-form.component';

describe('CreateFormComponent', () => {
  let component: EscrowPageFormComponent;
  let fixture: ComponentFixture<EscrowPageFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EscrowPageFormComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EscrowPageFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
