import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EscrowPagesLiveComponent } from './escrow-pages-live.component';

describe('EscrowPagesLiveComponent', () => {
  let component: EscrowPagesLiveComponent;
  let fixture: ComponentFixture<EscrowPagesLiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EscrowPagesLiveComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EscrowPagesLiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
