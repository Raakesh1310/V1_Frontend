import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkTransferDetailsPageComponent } from './bulk-transfer-details-page.component';

describe('BulkTransferDetailsPageComponent', () => {
  let component: BulkTransferDetailsPageComponent;
  let fixture: ComponentFixture<BulkTransferDetailsPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkTransferDetailsPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkTransferDetailsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
