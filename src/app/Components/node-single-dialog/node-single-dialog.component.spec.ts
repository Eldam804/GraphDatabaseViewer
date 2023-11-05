import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeSingleDialogComponent } from './node-single-dialog.component';

describe('NodeSingleDialogComponent', () => {
  let component: NodeSingleDialogComponent;
  let fixture: ComponentFixture<NodeSingleDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NodeSingleDialogComponent]
    });
    fixture = TestBed.createComponent(NodeSingleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
