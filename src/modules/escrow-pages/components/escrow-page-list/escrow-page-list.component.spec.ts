import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EscrowPageListComponent } from './escrow-page-list.component';

describe('EscrowPageListComponent', () => {
  let component: EscrowPageListComponent;
  let fixture: ComponentFixture<EscrowPageListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EscrowPageListComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EscrowPageListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
