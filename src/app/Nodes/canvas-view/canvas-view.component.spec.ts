import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasViewComponent } from './canvas-view.component';

describe('CanvasViewComponent', () => {
  let component: CanvasViewComponent;
  let fixture: ComponentFixture<CanvasViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CanvasViewComponent]
    });
    fixture = TestBed.createComponent(CanvasViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
