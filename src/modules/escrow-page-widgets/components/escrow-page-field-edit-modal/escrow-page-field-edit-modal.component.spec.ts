import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EscrowPageFieldEditModalComponent } from './escrow-page-field-edit-modal.component';

describe('EscrowPageFieldEditModalComponent', () => {
  let component: EscrowPageFieldEditModalComponent;
  let fixture: ComponentFixture<EscrowPageFieldEditModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EscrowPageFieldEditModalComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EscrowPageFieldEditModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
