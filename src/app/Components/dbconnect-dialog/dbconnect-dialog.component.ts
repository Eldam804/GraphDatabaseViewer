import { Component, Inject } from '@angular/core';
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef, MatDialogModule} from '@angular/material/dialog';
@Component({
  selector: 'app-dbconnect-dialog',
  templateUrl: './dbconnect-dialog.component.html',
  styleUrls: ['./dbconnect-dialog.component.css']
})
export class DBConnectDialogComponent {
    constructor(
      public dialogRef: MatDialogRef<DBConnectDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,
    ) {}
  
    onNoClick(): void {
      this.dialogRef.close();
    }
}
