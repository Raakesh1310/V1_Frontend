import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkTableListComponent } from './bulk-table-list.component';

describe('BulkTableListComponent', () => {
  let component: BulkTableListComponent;
  let fixture: ComponentFixture<BulkTableListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkTableListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkTableListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
