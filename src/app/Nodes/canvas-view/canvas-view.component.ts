import { Component } from '@angular/core';
import { DriverService } from 'src/app/Neo4j/Database/driver.service';
import * as d3 from 'd3';
import { ElementRef, OnInit, ViewChild } from '@angular/core';
import { zoom, zoomIdentity } from 'd3-zoom';
import { forkJoin } from 'rxjs';

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
  private svg: any;
  private zoomBehavior: any;

  constructor(private service: DriverService){
    this.getAllNodes();
  }

  getAllNodes(){
    forkJoin([
      this.service.getAllNodes(),
      this.service.getAllEdges()
    ]).subscribe(([nodesData, edgesData]) => {
      nodesData.forEach((nodeData: any) => {
          this.nodes.push({
              id: nodeData._fields[0].identity,
              name: nodeData._fields[0].labels[0],
              properties: nodeData._fields[0].properties 
          });
      });

      edgesData.forEach((edgeData: any) => {
          this.edges.push({
              source: edgeData._fields[0].start,
              target: edgeData._fields[0].end
          });
      });

      this.createGraph();
  });
  } 
  
  createGraph() {
    const svgWidth = window.innerWidth;
    const svgHeight = window.innerHeight;

    // Select SVG and set dimensions
    const svg = d3.select(this.svgRef.nativeElement)
      .style('background-color', 'transparent')
        .attr('width', svgWidth)
        .attr('height', svgHeight);
        

    const constrain = (value: number, min: number, max: number) => {
        return Math.max(min, Math.min(value, max));
    };

    const zoomHandler = (event: any) => {
      const { x, y, k } = event.transform;
      event.transform.x = constrain(x, -2 * svgWidth, 2 * svgWidth);
      event.transform.y = constrain(y, -2 * svgHeight, 2 * svgHeight);
      linkGroup.attr('transform', event.transform);
      nodeGroup.attr('transform', event.transform);
  };
  
  const zoomBehavior = d3.zoom()
      .extent([[-2 * svgWidth, -2 * svgHeight], [3 * svgWidth, 3 * svgHeight]])
      .scaleExtent([1, 10])
      .on('zoom', zoomHandler);

    svg.call(zoomBehavior);

    // Random node positions

    const simulation = d3.forceSimulation(this.nodes)
      .force('link', d3.forceLink(this.edges).id((d: any) => d.id).distance(150)) // Shortened distance
      .force('charge', d3.forceManyBody().strength(-100)) // Increased repulsion for closer nodes
      .force('center', d3.forceCenter(svgWidth / 2, svgHeight / 2));

    const linkGroup = svg.append('g').attr('class', 'links');
    const nodeGroup = svg.append('g').attr('class', 'nodes');

    const links = linkGroup
    .selectAll('line')
    .data(this.edges)
    .enter().append('line')
    .attr('stroke', 'red') 
    .attr('stroke-width', 2);

    const lineGenerator = d3.line()
        .x((d: any) => d.x)
        .y((d: any) => d.y);

    const nodes = nodeGroup.selectAll('.node-group')
        .data(this.nodes)
        .enter().append('g')
        .attr('class', 'node-group');

    nodes.append('circle')
        .attr('r', 50)
        .attr('fill', 'lightblue');

    nodes.append('text')
        .attr('dy', -25)
        .style('text-anchor', 'middle')
        .style('font-weight', 'bold')
        .text((d: any) => d.name);

    nodes.append('text')
        .attr('dy', -5)
        .style('text-anchor', 'middle')
        .text((d: any) => {
            const attributes = Object.entries(d.properties);
            return attributes.map(([key, value]) => `${key}: ${value}`).join('\n');
        });

    simulation.on('tick', () => {
      links
      .attr('x1', (d: any) => d.source.x)
      .attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x)
      .attr('y2', (d: any) => d.target.y);
        nodes.attr('transform', (d: any) => `translate(${d.x}, ${d.y})`);
    });

    this.svg = svg;
    this.zoomBehavior = zoomBehavior;
}
  increaseZoom() {
    // Get the current transform
    const currentTransform = d3.zoomTransform(this.svg.node());
    
    // Increase the scale factor
    const newScale = currentTransform.k * 1.2; // You can adjust the zoom factor as needed
  
    // Create a new transform
    const newTransform = d3.zoomIdentity
      .translate(currentTransform.x, currentTransform.y)
      .scale(newScale);
  
    // Apply the new transform with a smooth transition
    this.svg.transition().duration(250).call(this.zoomBehavior.transform, newTransform);
  }
  
   decreaseZoom() {
    // Get the current transform
    const currentTransform = d3.zoomTransform(this.svg.node());
  
    // Decrease the scale factor
    const newScale = currentTransform.k / 1.2; // You can adjust the zoom factor as needed
  
    // Create a new transform
    const newTransform = d3.zoomIdentity
      .translate(currentTransform.x, currentTransform.y)
      .scale(newScale);
  
    // Apply the new transform with a smooth transition
    this.svg.transition().duration(250).call(this.zoomBehavior.transform, newTransform);
  }
}
