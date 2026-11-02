import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ChallanFormPageComponent } from '@modules/challan/containers';

describe('ChallanOverviewComponent', () => {
  let component: ChallanFormPageComponent;
  let fixture: ComponentFixture<ChallanFormPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChallanFormPageComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChallanFormPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
