import { Component, Input, OnChanges, Output, SimpleChanges, EventEmitter } from '@angular/core';
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
  @Output() nodeInfo: EventEmitter<any> = new EventEmitter<any>();

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
    var data = this.canvasData;
    if(this.canvasData && this.canvasData.length == 0) {
      console.debug("GETALLNODES:")
      this.getAllNodes();
    }else{
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
      console.debug(edgesData);
      edgesData.forEach((edgeData: any) => {
          this.edges.push({
              source: edgeData._fields[0].start,
              target: edgeData._fields[0].end,
              type: edgeData._fields[0].type
          });
      });

      this.createGraph();
  });
  } 
  generateColors(n: number): string[] {
    const colors: string[] = [];
    const usedHues: Set<number> = new Set();

    // Generate a random number within a range, inclusive
    const randomBetween = (min: number, max: number) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    for (let i = 0; i < n; i++) {
        let hue;
        do {
            hue = randomBetween(0, 359);
        } while (usedHues.has(hue)); // Ensure the hue hasn't been used yet

        usedHues.add(hue);
        const saturation = randomBetween(60, 100);
        const lightness = randomBetween(40, 60);

        colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }

    return colors;
}
  
  createGraph() {
    const svgWidth = window.innerWidth;
    const svgHeight = window.innerHeight;


    const nodeTypes = [...new Set(this.nodes.map(node => node.name))];
    const edgeTypes = [...new Set(this.edges.map(edge => edge.type))];

    //this.nodeInfo.emit([nodeTypes, edgeTypes]);

    const allTypes = [...nodeTypes, ...edgeTypes]; // Combine node and edge types.
    const colors = this.generateColors(allTypes.length); // Generate colors for all unique types.

    const colorScale = d3.scaleOrdinal(colors).domain(allTypes);

    //const colorScale = d3.scaleOrdinal(d3.schemeCategory10) // or any other categorical color scheme
      //.domain(nodeTypes);
    //const edgeColorScale = d3.scaleOrdinal(d3.schemeCategory10) // or any other color scheme
    //  .domain(edgeTypes);
    // Select SVG and set dimensions
    const nodeTypesWithColors = nodeTypes.map(nodeType => ({
      nodeType: nodeType,
      color: colorScale(nodeType)
    }));
  
  const edgeTypesWithColors = edgeTypes.map(edgeType => ({
      relType: edgeType,
      color: colorScale(edgeType)
    }));

  // Emit the combined data (types and colors)
  this.nodeInfo.emit([nodeTypesWithColors, edgeTypesWithColors]);
  
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
      //event.transform.x = constrain(x, -2 * svgWidth, 2 * svgWidth);
      //event.transform.y = constrain(y, -2 * svgHeight, 2 * svgHeight);
      linkGroup.attr('transform', event.transform);
      nodeGroup.attr('transform', event.transform);
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
  
  const zoomBehavior = d3.zoom()
      .extent([[0, 0], [svgWidth,svgHeight]])
      .scaleExtent([0.1, 30])
      .on('zoom', zoomHandler);

    svg.call(zoomBehavior);

    // Random node positions

    const simulation = d3.forceSimulation(this.nodes)
      .force('link', d3.forceLink(this.edges).id((d: any) => d.id).distance(400)) // Increased distance
      .force('charge', d3.forceManyBody().strength(-300)) // Increased repulsion
      .force('center', d3.forceCenter(svgWidth / 2, svgHeight / 2))
      .force('collision', d3.forceCollide().radius((d: any) => {
        const attributeCount = Object.entries(d.properties).length;
        const longestWordLength = getLongestWordLength(d.properties);
        return computeCircleRadius(attributeCount, longestWordLength) + 200; // Added some extra spacing
    }));

    const linkGroup = svg.append('g').attr('class', 'links');
    const nodeGroup = svg.append('g').attr('class', 'nodes');

    const links = linkGroup
    .selectAll('line')
    .data(this.edges)
    .enter().append('line')
    .attr('stroke', (d: any) => colorScale(d.type))
    .attr('stroke-width', 2);

    const lineGenerator = d3.line()
        .x((d: any) => d.x)
        .y((d: any) => d.y);

    const nodes = nodeGroup.selectAll('.node-group')
        .data(this.nodes)
        .enter().append('g')
        .attr('class', 'node-group');

    

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
