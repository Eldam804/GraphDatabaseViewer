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
  public zoomPercentage: number = 100;
  readonly UPPER_LIMIT: number = 150;
  readonly LOWER_LIMIT: number = 10;

  @Output("openDrawer")
  emitter: EventEmitter<any> = new EventEmitter();

  @Output("openCodeDrawer")
  codeEmitter: EventEmitter<any> = new EventEmitter();


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
  openCodeDrawer(){
    this.codeEmitter.emit("openCodeDrawer");
  }

  increaseZoom(){
    if(this.zoomPercentage < this.UPPER_LIMIT){
      this.zoomPercentage += 10;
    }
  }
  decreaseZoom(){
    if(this.zoomPercentage > this.LOWER_LIMIT){
      this.zoomPercentage -= 10;
    }
  }
}
