import { Component, DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { EscrowPageWidgetsPageComponent } from './escrow-page-widgets-page.component';

@Component({
  template: `
    <sbpro-escrow-page-widgets-page
      [someInput]="someInput"
      (someFunction)="someFunction($event)"
    ></sbpro-escrow-page-widgets-page>
  `
})
class TestHostComponent {
  // someInput = 1;
  // someFunction(event: Event) {}
}

describe('EscrowPageWidgetsPageComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let hostComponentDE: DebugElement;
  let hostComponentNE: Element;

  let component: EscrowPageWidgetsPageComponent;
  let componentDE: DebugElement;
  let componentNE: Element;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestHostComponent, EscrowPageWidgetsPageComponent],
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
      hostComponentNE.querySelector('sbpro-escrow-page-widgets-page')
    ).toEqual(jasmine.anything());
  });
});
