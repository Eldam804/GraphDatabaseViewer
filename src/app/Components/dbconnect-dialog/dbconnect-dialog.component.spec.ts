import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DBConnectDialogComponent } from './dbconnect-dialog.component';

describe('DBConnectDialogComponent', () => {
  let component: DBConnectDialogComponent;
  let fixture: ComponentFixture<DBConnectDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DBConnectDialogComponent]
    });
    fixture = TestBed.createComponent(DBConnectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
