import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeMapDialogComponent } from './node-map-dialog.component';

describe('NodeMapDialogComponent', () => {
  let component: NodeMapDialogComponent;
  let fixture: ComponentFixture<NodeMapDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NodeMapDialogComponent]
    });
    fixture = TestBed.createComponent(NodeMapDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
