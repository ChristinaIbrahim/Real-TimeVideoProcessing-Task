import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalysisView } from './analysis-view';

describe('AnalysisView', () => {
  let component: AnalysisView;
  let fixture: ComponentFixture<AnalysisView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalysisView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalysisView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
