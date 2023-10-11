import { Component, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';

@Component({
  selector: 'app-body',
  templateUrl: './body.component.html',
  styleUrls: ['./body.component.css'],
})
export class BodyComponent {
  @ViewChild('drawer', { static: true }) public drawer!: MatDrawer;
  @ViewChild('drawerCode', { static: true }) public codeDrawer!: MatDrawer;
  public queryOutput: any;
  public nodes: any;
  public edges: any;
  public nodeData: any;
  classicView: boolean = true; // default value

  handleViewChange(view: boolean) {
    this.classicView = view;
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
