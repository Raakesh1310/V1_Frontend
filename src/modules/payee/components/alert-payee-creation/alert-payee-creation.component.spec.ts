import { Component, DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AlertPayeeCreationComponent } from './alert-payee-creation.component';

@Component({
  template: `
    <sbpro-alert-payee-creation
      [someInput]="someInput"
      (someFunction)="someFunction($event)"
    ></sbpro-alert-payee-creation>
  `
})
class TestHostComponent {
  // someInput = 1;
  // someFunction(event: Event) {}
}

describe('AlertPayeeCreationComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let hostComponentDE: DebugElement;
  let hostComponentNE: Element;

  let component: AlertPayeeCreationComponent;
  let componentDE: DebugElement;
  let componentNE: Element;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestHostComponent, AlertPayeeCreationComponent],
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
    expect(hostComponentNE.querySelector('sbpro-alert-payee-creation')).toEqual(
      jasmine.anything()
    );
  });
});
