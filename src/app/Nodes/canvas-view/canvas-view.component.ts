import { Component } from '@angular/core';
import { DriverService } from 'src/app/Neo4j/Database/driver.service';
import * as d3 from 'd3';
import { ElementRef, OnInit, ViewChild } from '@angular/core';
import { zoom, zoomIdentity } from 'd3-zoom';

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
    const svgWidth = window.innerWidth; // Set the width to the window width
    const svgHeight = window.innerHeight; // Set the height to the window height

  
    // Get the native elements
    const svg = d3.select(this.svgRef.nativeElement)
      .attr('width', svgWidth)
      .attr('height', svgHeight);
    
      const zoomHandler = (event: any) => {
        const currentTransform = event.transform;

        const minX = -svgWidth * (currentTransform.k - 1);
        const minY = -svgHeight * (currentTransform.k - 1);
        const maxX = svgWidth * (currentTransform.k - 1);
        const maxY = svgHeight * (currentTransform.k - 1);

        // Limit translation (panning) to the bounds
        currentTransform.x = Math.max(minX, Math.min(currentTransform.x, maxX));
        currentTransform.y = Math.max(minY, Math.min(currentTransform.y, maxY));

        // Limit zoom to the extent
        currentTransform.k = Math.min(zoomBehavior.scaleExtent()[1], Math.max(currentTransform.k, zoomBehavior.scaleExtent()[0]));

        // Use event.transform for the zoom transformation
        svg.attr('transform', event.transform);
      };
      
      const zoomBehavior = d3
        .zoom()
        .extent([[0, 0], [svgWidth, svgHeight]])
        .scaleExtent([1, 10])
        .on('zoom', zoomHandler);
      
      svg.call(zoomBehavior);

    const graphContainer = d3.select(this.graphContainerRef.nativeElement)
      .style('width', svgWidth + 'px')
      .style('height', svgHeight + 'px')
      .style('overflow', 'hidden');
  
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
        d3.forceLink(this.edges).id((d: any) => d.id).distance(250)
      )
      .force('charge', d3.forceManyBody().strength(-100))
      
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
  
    // Create a group element for each node, which includes a circle and text
    const nodes = svg
      .selectAll('.node-group') // Use a class to select
      .data(this.nodes)
      .enter()
      .append('g') // Create a group for each node
      .attr('class', 'node-group')
      .attr('transform', (d: any) => `translate(${d.x}, ${d.y})`);
  
    // Append a circle to the node group
    nodes
      .append('circle')
      .attr('r', 50) // Adjust the radius as needed for bigger nodes
      .attr('fill', 'lightblue');
  
    // Append text to the node group
    nodes
      .append('text')
      .attr('dy', -25) // Adjust the vertical position of the text
      .style('text-anchor', 'middle')
      .style('font-weight', 'bold')
      .text((d: any) => ':' + d.name); // Display the node name
  
    // Append attributes text to the node group
    nodes
      .append('text')
      .attr('dy', -5) // Adjust the vertical position of the text
      .style('text-anchor', 'middle')
      .text((d: any) => {
        const attributes = Object.entries(d.properties);
        return attributes.map(([key, value]) => `${key}: ${value}`).join('\n');
      });
      const nodeGroups = svg
  .selectAll('g')
  .data(this.nodes)
  .enter()
  .append('g')
  .attr('class', 'node-group')
  .attr('transform', (d: any) => `translate(${d.x}, ${d.y})`);

// Append a circle to each 'g' element
nodeGroups
  .append('circle')
  .attr('r', 20) // Adjust the radius to your desired size
  .attr('fill', 'lightblue');

// Append a foreignObject with text to each 'g' element for wrapping text
nodeGroups
  .append('foreignObject')
  .attr('width', 40) // Adjust the width to control text wrapping
  .attr('height', 40) // Adjust the height to control text wrapping
  .attr('x', -20) // Position the foreignObject in the center of the circle
  .attr('y', -20) // Position the foreignObject in the center of the circle
  .append('xhtml:div')
  .attr('class', 'node-text')
  .html((d: any) => `
    <b>${d.name}</b><br>
    Name: ${d.properties.name}<br>
    Age: ${d.properties.age}
  `);
  
    // Define a tick function to update the positions of nodes and links
    simulation.on('tick', () => {
      links
        .attr('d', (d: any) => linkPathGenerator({ source: d.source, target: d.target }));
        //.attr('x1', (d: any) => d.source.x * d3.event.transform.k + d3.event.transform.x)
        //.attr('y1', (d: any) => d.source.y * d3.event.transform.k + d3.event.transform.y)
        //.attr('x2', (d: any) => d.target.x * d3.event.transform.k + d3.event.transform.x)
        //.attr('y2', (d: any) => d.target.y * d3.event.transform.k + d3.event.transform.y);
  
      nodes.attr('transform', (d: any) => `translate(${d.x}, ${d.y})`);
        //.attr('cx', (d: any) => d.x * d3.event.transform.k + d3.event.transform.x)
        //.attr('cy', (d: any) => d.y * d3.event.transform.k + d3.event.transform.y);
    });
  
    // Append the SVG to the graph container
    svg.attr('width', svgWidth).attr('height', svgHeight);
    graphContainer.style('width', svgWidth + 'px').style('height', svgHeight + 'px');
  
    // Start the simulation
    simulation.alpha(1).restart();
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
