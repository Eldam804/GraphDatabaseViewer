import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueriesComponent } from './queries.component';

describe('QueriesComponent', () => {
  let component: QueriesComponent;
  let fixture: ComponentFixture<QueriesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QueriesComponent]
    });
    fixture = TestBed.createComponent(QueriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
