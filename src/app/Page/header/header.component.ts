import { Component, Output, EventEmitter, Input } from '@angular/core';
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef, MatDialogModule} from '@angular/material/dialog';
import { DBConnectDialogComponent } from 'src/app/Components/dbconnect-dialog/dbconnect-dialog.component';
import { NodeMapDialogComponent } from 'src/app/Components/node-map-dialog/node-map-dialog.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  private ipAddress: String = "192.168.11.22";
  @Input()
  public nodeInformation: any;
  private dbName: String = "Neo4j DB";
  public zoomPercentage: number = 100;
  readonly UPPER_LIMIT: number = 150;
  readonly LOWER_LIMIT: number = 10;

  @Output("openDrawer")
  emitter: EventEmitter<any> = new EventEmitter();

  @Output("openCodeDrawer")
  codeEmitter: EventEmitter<any> = new EventEmitter();

  @Output() viewChanged = new EventEmitter<boolean>();

  @Output() restartNodes = new EventEmitter();

  constructor(public dialog: MatDialog) {}
  openModal(){
    
    const dialogRef = this.dialog.open(NodeMapDialogComponent, {
      data: this.nodeInformation
    });
    console.debug(this.nodeInformation);
    
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
  openConnectionModal(){
    const dialogRef = this.dialog.open(DBConnectDialogComponent, {
      disableClose: true,
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

  restart(){
    this.restartNodes.emit(true);
  }
  classicView(){
    this.viewChanged.emit(true);
  }
  clusterView(){
    this.viewChanged.emit(false);
  }
}
