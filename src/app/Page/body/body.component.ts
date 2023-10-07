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
}
