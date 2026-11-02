import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EscrowPagesListComponent } from './escrow-pages-list.component';

describe('EscrowPagesListComponent', () => {
  let component: EscrowPagesListComponent;
  let fixture: ComponentFixture<EscrowPagesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EscrowPagesListComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EscrowPagesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
