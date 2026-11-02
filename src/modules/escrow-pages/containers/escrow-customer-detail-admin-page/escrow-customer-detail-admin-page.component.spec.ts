import { Component, DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { EscrowCustomerDetailAdminPageComponent } from './escrow-customer-detail-admin-page.component';

@Component({
  template: `
    <sbpro-escrow-customer-detail-admin-page
      [someInput]="someInput"
      (someFunction)="someFunction($event)"
    ></sbpro-escrow-customer-detail-admin-page>
  `
})
class TestHostComponent {
  // someInput = 1;
  // someFunction(event: Event) {}
}

describe('EscrowCustomerDetailAdminPageComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let hostComponentDE: DebugElement;
  let hostComponentNE: Element;

  let component: EscrowCustomerDetailAdminPageComponent;
  let componentDE: DebugElement;
  let componentNE: Element;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestHostComponent, EscrowCustomerDetailAdminPageComponent],
      imports: [NoopAnimationsModule],
      providers: [],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    hostComponentDE = fixture.debugElement;
    hostComponentNE = hostComponentDE.nativeElement;

    componentDE = hostComponentDE.children[0];
    component = componentDE.componentInstance;
    componentNE = componentDE.nativeElement;

    fixture.detectChanges();
  });

  it('should display the component', () => {
    expect(
      hostComponentNE.querySelector('sbpro-escrow-customer-detail-admin-page')
    ).toEqual(jasmine.anything());
  });
});
