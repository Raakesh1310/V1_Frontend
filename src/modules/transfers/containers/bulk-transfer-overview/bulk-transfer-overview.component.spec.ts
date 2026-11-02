import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkTransferOverviewComponent } from './bulk-transfer-overview.component';

describe('BulkTransferOverviewComponent', () => {
  let component: BulkTransferOverviewComponent;
  let fixture: ComponentFixture<BulkTransferOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkTransferOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkTransferOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
