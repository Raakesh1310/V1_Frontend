import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EscrowPagesComponent } from './escrow-pages.component';

describe('EscrowPagesComponent', () => {
  let component: EscrowPagesComponent;
  let fixture: ComponentFixture<EscrowPagesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EscrowPagesComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EscrowPagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
