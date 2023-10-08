import { Component, Inject } from '@angular/core';
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef, MatDialogModule} from '@angular/material/dialog';
@Component({
  selector: 'app-node-map-dialog',
  templateUrl: './node-map-dialog.component.html',
  styleUrls: ['./node-map-dialog.component.css']
})
export class NodeMapDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<NodeMapDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
