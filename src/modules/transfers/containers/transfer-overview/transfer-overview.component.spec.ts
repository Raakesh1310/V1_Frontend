import { Component, DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { TransferOverviewComponent } from './transfer-overview.component';

@Component({
  template: `
    <sbpro-transfer-overview
      [someInput]="someInput"
      (someFunction)="someFunction($event)"
    ></sbpro-transfer-overview>
  `
})
class TestHostComponent {
  // someInput = 1;
  // someFunction(event: Event) {}
}

describe('TransferOverviewComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let hostComponentDE: DebugElement;
  let hostComponentNE: Element;

  let component: TransferOverviewComponent;
  let componentDE: DebugElement;
  let componentNE: Element;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestHostComponent, TransferOverviewComponent],
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
    expect(hostComponentNE.querySelector('sbpro-transfer-overview')).toEqual(
      jasmine.anything()
    );
  });
});
