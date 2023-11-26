import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import * as d3 from 'd3';
import { NodeDetailDialogComponent } from '../node-detail-dialog/node-detail-dialog.component';
import { Edge, Node } from 'src/app/Models/nodes';
import { NodeMapDialogComponent } from '../node-map-dialog/node-map-dialog.component';

@Component({
  selector: 'app-node-single-dialog',
  templateUrl: './node-single-dialog.component.html',
  styleUrls: ['./node-single-dialog.component.css']
})
export class NodeSingleDialogComponent implements AfterViewInit {
  modalView: boolean = true;
  @ViewChild('svg') svgRef!: ElementRef;
  @ViewChild('graphContainer') graphContainerRef!: ElementRef; 
  public edges: Array<Edge> = [];
  public nodes: Array<Node> = [];
  private nodeInformation: any;
  private svg: any;
  private zoomBehavior: any;
  constructor(
    public dialogRef: MatDialogRef<NodeSingleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog
  ) {
    this.edges = data.modalEdges;
    this.nodes = data.modalNodes;
    //this.createGraph();
  }
  ngAfterViewInit(): void {
    this.createGraph();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
  openModal(){
    
    const dialogRef = this.dialog.open(NodeMapDialogComponent, {
      data: this.nodeInformation
    });
    console.debug(this.nodeInformation);
    
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
  displayData(nodeData: any): void{
    const nodeName = nodeData.name;
    const properties = nodeData.properties;
    console.debug(properties);
    const data = {nodeName, properties};
    const dialogRef = this.dialog.open(NodeDetailDialogComponent, {
      data
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      console.log('Modal closes', result);
    })
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
  getNodeCount(nodeName: string){
    var count: number = 0;
    console.debug(nodeName);
    for (let index = 0; index < this.nodes.length; index++) {
      if(this.nodes[index].name == nodeName){
          count++;
      }
    }
    return count;
  }

  getEdgeCount(nodeType: string){
    var count: number = 0;
    console.debug(nodeType);
    for (let index = 0; index < this.edges.length; index++) {
      if(this.edges[index].type == nodeType){
          count++;
      }
    }
    return count;
  }

  createGraph() {
    const svgWidth = window.innerWidth - 250;
    const svgHeight = window.innerHeight - 400;


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
    console.debug("NODE TYPES: ", nodeTypes);
    console.debug("EDGE TYPES: ",edgeTypes);
    const nodeTypesWithColors = nodeTypes.map(nodeType => ({
      nodeType: nodeType,
      color: colorScale(nodeType),
      length: this.getNodeCount(nodeType)
    }));
  
  const edgeTypesWithColors = edgeTypes.map(edgeType => ({
      relType: edgeType,
      color: colorScale(edgeType),
      length: this.getEdgeCount(edgeType)
    }));

  // Emit the combined data (types and colors)
  //this.nodeInfo.emit([nodeTypesWithColors, edgeTypesWithColors]);
  this.nodeInformation = [nodeTypesWithColors, edgeTypesWithColors];
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
    return baseRadius;
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
      .force('link', d3.forceLink(this.edges).id((d: any) => d.id).distance(100)) // Increased distance
      .force('charge', d3.forceManyBody().strength(-300)) // Increased repulsion
      .force('center', d3.forceCenter(svgWidth / 2, svgHeight / 2))
      .force('collision', d3.forceCollide().radius((d: any) => {
        const attributeCount = Object.entries(d.properties).length;
        const longestWordLength = getLongestWordLength(d.properties);
        return computeCircleRadius(attributeCount, longestWordLength) + 200; // Added some extra spacing
    }));
    let linkIndex: any = {};
    this.edges.forEach((edge, i) => {
      let ids = [edge.source.id, edge.target.id].sort();
      let id = ids.join("-");
      if (!linkIndex[id]) {
        linkIndex[id] = { total: 0, maxIndex: 0 };
      }
      linkIndex[id].maxIndex++;
      edge.linknum = linkIndex[id].maxIndex;
    });
    console.debug("EDGES:");
    console.debug(linkIndex);

    const linkGroup = svg.append('g').attr('class', 'links');
    const nodeGroup = svg.append('g').attr('class', 'nodes');

    const tooltip = d3.select(this.graphContainerRef.nativeElement).append("div")
    .attr('class', 'tooltip');


    const links = linkGroup
    .selectAll('path')
    .data(this.edges)
    .enter().append('path')
    .attr('stroke', (d) => colorScale(d.type))
    .attr('text-anchor', 'middle')
    .attr('fill', 'none') // Prevent the path from being filled
    .attr('stroke-width', 2)
    .attr('fill', 'none');

    links.on('mouseenter', function(event, d) {
      tooltip
        .style('opacity', 1)
        .style('left', `${event.pageX}px`)
        .style('top', `${event.pageY}px`)
        .html(`Node data: ${d.type}`); // replace with your actual node data
    })
    .on('mouseleave', function(d) {
      tooltip.style('opacity', 0);
    });

    const lineGenerator = d3.line()
        .x((d: any) => d.x)
        .y((d: any) => d.y);

    const nodes = nodeGroup.selectAll('.node-group')
        .data(this.nodes)
        .enter().append('g')
        .attr('class', 'node-group')
        .on('click', (event, nodeData) => this.displayData(nodeData));

        nodes.on('mouseenter', function(event, d) {
          // Using D3's selection to select the current node and change its cursor
          d3.select(this).style('cursor', 'pointer');
          
          // Optionally, change other styles for more visual feedback
          d3.select(this).style('fill', 'rgba(0, 128, 255, 0.8)');
        })
        .on('mouseleave', function(event, d) {
          // Reset the cursor and other styles when the mouse leaves the node
          d3.select(this).style('cursor', 'default');
          d3.select(this).style('fill', 'black');
        });

    nodes.append('circle')
    .attr('r', (d: any) => {
        const attributeCount = Object.entries(d.properties).length;
        const longestWordLength = getLongestWordLength(d.properties);
        return computeCircleRadius(attributeCount, longestWordLength);
    })
    .attr('fill', (d: any) => colorScale(d.name));

    function truncateText(text: any, maxLength: any) {
      return text.length > maxLength ? text.slice(0, maxLength - 3) + '...' : text;
  }
    nodes.append('text')
        .attr('dy', -25)
        //.attr('textLength', 45)  // Setting maximum width to a value slightly less than 50
        //.attr('lengthAdjust', 'spacingAndGlyphs')
        .style('text-anchor', 'middle')
        .style('font-weight', 'bold')
        .text((d: any) => truncateText(d.name, 10));

        nodes.each(function(d: any) {
          const node = d3.select(this);
          const attributes = Object.entries(d.properties).slice(0, 3);
          let yPosition = 5;
          const lineHeight = 15;
      
          attributes.forEach(([key, value], index) => {
              node.append('text')
                  .attr('dy', yPosition + (index * lineHeight))
                  .attr('dx', 0)
                  .attr('lengthAdjust', 'spacingAndGlyphs')
                  .style('text-anchor', 'middle')
                  .text(`${truncateText(key, 6)}: ${truncateText(value, 5)}`);
          });
      });

    simulation.on('tick', () => {
      links
      .attr('x1', (d: any) => d.source.x)
      .attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x)
      .attr('y2', (d: any) => d.target.y)
      .attr('d', (d: any) => {
        let dx = d.target.x - d.source.x,
            dy = d.target.y - d.source.y;
        
        const linkInfo = linkIndex[[d.source.id, d.target.id].sort().join("-")];
        const totalLinks = linkInfo.maxIndex;
        
        // Calculate an offset for the curvature based on linknum
        const offset = (d.linknum - Math.ceil(totalLinks)) - 2;
        
        // Define a curvature multiplier. If even total links, -1 and 1 are used, otherwise 0, -1, and 1
        const multiplier = totalLinks % 2 === 0 ?
            (d.linknum <= totalLinks / 2 ? 1 : -1) :
            (d.linknum < Math.floor(totalLinks / 2) ? 1 : d.linknum > Math.floor(totalLinks / 2) ? -1 : 0);
        let dr;
        if(totalLinks == 1){
          dr = 0;
        }else{
          dr = Math.sqrt(dx * dx + dy * dy) + (offset * multiplier * 80);
        }
        //dr = 200 * offset * multiplier;
        return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0 1,${d.target.x},${d.target.y}`;
    });
        nodes.attr('transform', (d: any) => `translate(${d.x}, ${d.y})`);
    });

    this.svg = svg;
    this.zoomBehavior = zoomBehavior;
}
}
