import { Component } from '@angular/core';
import { DriverService } from 'src/app/Neo4j/Database/driver.service';
import * as d3 from 'd3';
import { ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-canvas-view',
  templateUrl: './canvas-view.component.html',
  styleUrls: ['./canvas-view.component.css']
})
export class CanvasViewComponent {
  @ViewChild('svg') svgRef!: ElementRef;
  @ViewChild('graphContainer') graphContainerRef!: ElementRef;  
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
      //this.createGraph()
    })
    this.service.getAllEdges().subscribe((data: any) => {
      console.debug("RETRIEVING EDGES")
      console.debug(data);
      for(let i = 0; i < data.length; i++){
        this.edges.push({
          source: data[i]._fields[0].start,
          target: data[i]._fields[0].end
        })
        console.debug("EDGES:")
        console.debug(this.edges[i]);
        console.debug(this.edges[i]);
      }
      console.debug("EDGES:")
      console.debug(this.edges);
      this.createGraph();
    })
  } 
  createGraph() {
    // Get the native elements
  console.debug("DATA:")
  console.debug(this.nodes);
  console.debug(this.edges)
  const svgWidth = 800; // Adjust as needed
  const svgHeight = 800; // Adjust as needed

  // Get the native elements
  const svg = d3.select(this.svgRef.nativeElement)
    .attr('width', svgWidth)
    .attr('height', svgHeight);

  const graphContainer = d3.select(this.graphContainerRef.nativeElement)
    .style('width', svgWidth + 'px')
    .style('height', svgHeight + 'px');

  // Initialize nodes with random positions within the SVG container
  this.nodes.forEach(node => {
    node.x = Math.random() * svgWidth;
    node.y = Math.random() * svgHeight;
  });

  // Define your graph layout, for example, a force-directed layout
  const simulation = d3
    .forceSimulation(this.nodes)
    .force(
      'link',
      d3.forceLink(this.edges).id((d: any) => d.id)
    )
    .force('charge', d3.forceManyBody())
    .force('center', d3.forceCenter(svgWidth / 2, svgHeight / 2));

  // Create links and nodes
  const links = svg
    .selectAll('path') // Use 'path' elements for links
    .data(this.edges)
    .enter()
    .append('path') // Create a path for each link
    .attr('stroke', '#ccc') // Set the stroke color
    .attr('stroke-width', 2); // Set the stroke width

  const linkPathGenerator = d3.linkVertical()
    .x((d: any) => d.x)
    .y((d: any) => d.y);

  // Set the 'd' attribute of the path element
  links.attr('d', (d: any) => linkPathGenerator({ source: d.source, target: d.target }));

  const nodes = svg
    .selectAll('circle')
    .data(this.nodes)
    .enter()
    .append('circle')
    .attr('r', 10)
    .attr('fill', 'lightblue');

  // Define a tick function to update the positions of nodes and links
  simulation.on('tick', () => {
    links
      .attr('d', (d: any) => linkPathGenerator({ source: d.source, target: d.target }));

    nodes.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y);
  });

  // Append the SVG to the graph container
  svg.attr('width', '800px').attr('height', '800px');
  graphContainer.style('width', '800px').style('height', '800px');

  // Start the simulation
  simulation.alpha(1).restart();
  }
}
