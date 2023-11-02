import { Component, Inject } from '@angular/core';
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef, MatDialogModule} from '@angular/material/dialog';

@Component({
  selector: 'app-node-detail-dialog',
  templateUrl: './node-detail-dialog.component.html',
  styleUrls: ['./node-detail-dialog.component.css']
})
export class NodeDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<NodeDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
