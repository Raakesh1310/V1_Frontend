import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ChallanDetailPageComponent } from '@modules/challan/containers';

describe('ChallanDetailPageComponent', () => {
  let component: ChallanDetailPageComponent;
  let fixture: ComponentFixture<ChallanDetailPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChallanDetailPageComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChallanDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
