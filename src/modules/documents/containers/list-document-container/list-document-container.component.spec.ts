import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListDocumentContainerComponent } from './list-document-container.component';

describe('ListDocumentContainerComponent', () => {
  let component: ListDocumentContainerComponent;
  let fixture: ComponentFixture<ListDocumentContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ListDocumentContainerComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListDocumentContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
