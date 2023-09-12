import { Component } from '@angular/core';
import { DriverService } from 'src/app/Neo4j/Database/driver.service';

@Component({
  selector: 'app-canvas-view',
  templateUrl: './canvas-view.component.html',
  styleUrls: ['./canvas-view.component.css']
})
export class CanvasViewComponent {
  public nodes: Array<any> = [];
  public edges: Array<any> = [];
  constructor(private service: DriverService){
    this.getAllNodes();
  }

  getAllNodes(){
    this.service.getAllNodes().subscribe((data: any) => {
      console.debug(data);
      for(let i = 0; i < data.length; i++){
        this.nodes.push({
          id: data[i]._fields[0].identity,
          name: data[i]._fields[0].labels[0],
          properties: data[i]._fields[0].properties 
        })
      }
      console.debug("RETRIEVING NODES")
      console.debug(this.nodes);
    })
    this.service.getAllEdges().subscribe((data: any) => {
      console.debug("RETRIEVING EDGES")
      console.debug(data);
      for(let i = 0; i < data.length; i++){
        this.edges.push({
          startNode: data[i]._fields[0].start,
          endNode: data[i]._fields[0].end
        })
      }
      console.debug("EDGES:")
      console.debug(this.edges);
    })
  } 
}
