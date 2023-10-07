import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
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
export class CanvasViewComponent implements OnChanges{
  @ViewChild('svg') svgRef!: ElementRef;
  @ViewChild('graphContainer') graphContainerRef!: ElementRef;  
  public nodes: Array<any> = [];
  public edges: Array<any> = [];
  private svg: any;
  private zoomBehavior: any;
  @Input() canvasData: any;

  constructor(private service: DriverService){
    this.getAllNodes();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Check if canvasData input has changed
    if (changes.canvasData && !changes.canvasData.firstChange) {
      this.handleCanvasDataChange();
    }
  }

  handleCanvasDataChange() {
    console.debug("CANVAS CHANGE:")
    console.debug(this.canvasData);
    this.nodes = [];
    this.edges = [];
    var data = this.canvasData
    data.forEach((er: any) => {
      this.nodes.push({
        id: er._fields[0].identity,
        name: er._fields[0].labels[0],
        properties: er._fields[0].properties
      });
    });
    console.debug("nodes:" + this.nodes);
    console.debug("edges:" + this.edges);
    this.createGraph();
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


    const nodeTypes = [...new Set(this.nodes.map(node => node.name))];
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10) // or any other categorical color scheme
      .domain(nodeTypes);
    // Select SVG and set dimensions
    const svg = d3.select(this.svgRef.nativeElement)
      .style('background-color', 'transparent')
        .attr('width', svgWidth)
        .attr('height', svgHeight);
   
    svg.selectAll('.nodes').remove();
    svg.selectAll('.links').remove();
        

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
      .scaleExtent([1, 20])
      .on('zoom', zoomHandler);

    svg.call(zoomBehavior);

    // Random node positions

    const simulation = d3.forceSimulation(this.nodes)
      .force('link', d3.forceLink(this.edges).id((d: any) => d.id).distance(300)) // Shortened distance
      .force('charge', d3.forceManyBody().strength(-200)) // Increased repulsion for closer nodes
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

    const computeCircleRadius = (attributeCount: number, wordLenght: number) => {
      const baseRadius = 50;
      const additionalRadius = 3;  // Increment for each additional attribute beyond a threshold
      const threshold = 3;  // Base radius corresponds to this number of attributes
      const wordThreshold = 10;
      
      if (attributeCount <= threshold && wordLenght <= wordThreshold) return baseRadius;
      if(attributeCount >= wordLenght){
        return baseRadius + (attributeCount - threshold) * additionalRadius
      }else{
        return baseRadius + (wordLenght - wordThreshold) * additionalRadius;
      }
      
    };
    const getLongestWordLength = (properties: any) => {
      let longestLength = 0;
  
      for (let key in properties) {
          const keyLength = key.length;
          const valueLength = String(properties[key]).length;
          longestLength = Math.max(longestLength, 
            (keyLength + valueLength));
      }
  
      return longestLength;
    };

    nodes.append('circle')
    .attr('r', (d: any) => {
        const attributeCount = Object.entries(d.properties).length;
        const longestWordLength = getLongestWordLength(d.properties);
        return computeCircleRadius(attributeCount, longestWordLength);
    })
    .attr('fill', (d: any) => colorScale(d.name));

    nodes.append('text')
        .attr('dy', -25)
        .style('text-anchor', 'middle')
        .style('font-weight', 'bold')
        .text((d: any) => d.name);

        nodes.each(function(d: any) {
          const node = d3.select(this);
          const attributes = Object.entries(d.properties);
          let yPosition = 5; // Starting position for the first attribute
          const lineHeight = 15; // Height for each line
      
          attributes.forEach(([key, value], index) => {
              node.append('text')
                  .attr('dy', yPosition + (index * lineHeight))
                  .attr('dx', 0)
                  .style('text-anchor', 'middle')
                  .text(`${key}: ${value}`);
          });
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
