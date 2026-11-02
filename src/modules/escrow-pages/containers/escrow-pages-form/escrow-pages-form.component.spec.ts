import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EscrowPagesFormComponent } from './escrow-pages-form.component';

describe('EscrowPagesFormComponent', () => {
  let component: EscrowPagesFormComponent;
  let fixture: ComponentFixture<EscrowPagesFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EscrowPagesFormComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EscrowPagesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
