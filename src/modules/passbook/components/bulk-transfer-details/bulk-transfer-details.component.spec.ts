import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkTransferDetailsComponent } from './bulk-transfer-details.component';

describe('BulkTransferDetailsComponent', () => {
  let component: BulkTransferDetailsComponent;
  let fixture: ComponentFixture<BulkTransferDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkTransferDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkTransferDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
