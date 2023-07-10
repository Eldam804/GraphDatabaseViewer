import { Component, Output, EventEmitter } from '@angular/core';
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef, MatDialogModule} from '@angular/material/dialog';
import { DBConnectDialogComponent } from 'src/app/Components/dbconnect-dialog/dbconnect-dialog.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  private ipAddress: String = "192.168.11.22";
  private dbName: String = "Neo4j DB";

  @Output("openDrawer")
  emitter: EventEmitter<any> = new EventEmitter();

  constructor(public dialog: MatDialog) {}
  openModal(){
    const dialogRef = this.dialog.open(DBConnectDialogComponent, {
      data: {dbName: this.dbName, ipAddress: this.ipAddress}
    });
    
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
  openDrawer(){
    this.emitter.emit("openDrawer");
  }
}
