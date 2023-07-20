import { Component } from '@angular/core';
import { DriverService } from 'src/app/Neo4j/Database/driver.service';

@Component({
  selector: 'app-canvas-view',
  templateUrl: './canvas-view.component.html',
  styleUrls: ['./canvas-view.component.css']
})
export class CanvasViewComponent {
  public nodes: Array<any> = [];
  constructor(private service: DriverService){
    this.getAllNodes();
  }

  getAllNodes(){
    this.service.getAllNodes().subscribe((data: any) => {
      console.debug(data);
      for(let i = 0; i < data.length; i++){
        this.nodes.push({
          name: data[i]._fields[0].labels[0],
          properties: data[i]._fields[0].properties 
        })
      }
      console.debug(this.nodes);
      console.log(data);
    })
  }
}
