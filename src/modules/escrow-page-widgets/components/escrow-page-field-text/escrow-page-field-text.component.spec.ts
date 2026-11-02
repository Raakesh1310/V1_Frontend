import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EscrowPageFieldTextComponent } from './escrow-page-field-text.component';

describe('EscrowPageFieldTextComponent', () => {
  let component: EscrowPageFieldTextComponent;
  let fixture: ComponentFixture<EscrowPageFieldTextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EscrowPageFieldTextComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EscrowPageFieldTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
