import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Subscription } from 'rxjs';
import { DriverService } from 'src/app/Neo4j/Database/driver.service';

@Component({
  selector: 'app-body',
  templateUrl: './body.component.html',
  styleUrls: ['./body.component.css'],
})
export class BodyComponent implements OnInit {
  @ViewChild('drawer', { static: true }) public drawer!: MatDrawer;
  @ViewChild('drawerCode', { static: true }) public codeDrawer!: MatDrawer;
  public queryOutput: any;
  public nodes: any;
  public edges: any;
  public nodeData: any;
  public databaseSelected: boolean = true;
  public restartView: boolean = false;
  private credentialsSubscription!: Subscription;
  classicView: boolean = true; // default value

  constructor(private service: DriverService){
    this.checkConnectivity();
  }

  checkConnectivity(){
    this.service.checkDatabaseConnectivity().then(isConnected => {
      this.databaseSelected = isConnected;
    });
  }

  ngOnInit() {
    // Subscribe to the credentials observable
    this.credentialsSubscription = this.service.credentials$.subscribe({
      next: (credentials : any) => {
        //Timeout here is need because the connection is checked too soon.
        setTimeout(() => {
          this.checkConnectivity();
        }, 3500);
      }
    });
  }

  handleViewChange(view: boolean) {
    this.classicView = view;
  }
  handleRestart(restart: boolean){
    this.restartView = restart;
    setTimeout(() => this.restartView = false, 0);
  }
  toggle() {
    console.debug("Helloo!!")
    this.drawer.toggle();
  }
  toggleCode(){
    this.codeDrawer.toggle();
  }
  // ... rest of your methods ...

  handleQueryResult(result: any) {
    this.queryOutput = result;

    // If you need to process the result before sending it to app-canvas-view, do it here
  }
  handleNodeResult(result: any){
    this.nodes = result;
  }
  handleRelationshipsResult(result: any){
    this.edges = result;
  }
}
