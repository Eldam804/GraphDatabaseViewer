import { Component, Input, OnChanges, Output, SimpleChanges, EventEmitter } from '@angular/core';
import { DriverService } from 'src/app/Neo4j/Database/driver.service';
import * as d3 from 'd3';
import { ElementRef, OnInit, ViewChild } from '@angular/core';
import { zoom, zoomIdentity } from 'd3-zoom';
import { forkJoin } from 'rxjs';
import { NodeDetailDialogComponent } from 'src/app/Components/node-detail-dialog/node-detail-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { NodeSingleDialogComponent } from 'src/app/Components/node-single-dialog/node-single-dialog.component';

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
  @Input() nodeData: any;
  @Input() edgeData: any;
  @Input() classicView: Boolean = true;
  @Output() nodeInfo: EventEmitter<any> = new EventEmitter<any>();

  constructor(private service: DriverService, public dialog: MatDialog){
    this.getAllNodes();

  }

  ngOnChanges(changes: SimpleChanges) {
    // Check if canvasData input has changed
    if(changes.classicView && !changes.classicView.firstChange){
      console.debug("change happend")
      console.debug(this.classicView);
      if(this.classicView){
        console.debug(this.nodes);
        console.debug(this.edges);
        this.createGraph();
      }else{
        console.debug(this.nodes);
        console.debug(this.edges);
        this.createClusterGraph();
      }
    }
    if ((changes.nodeData && !changes.nodeData.firstChange) || (changes.edgeData && !changes.edgeData.firstChange)) {
      this.handleCanvasDataChange();
    }
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

  displayNodes(nodeData: any): void{
    const nodeQuery = "MATCH(n:" + nodeData.name + ") RETURN n";
    const edgeQuery = "MATCH(:" + nodeData.name  + ")-[r]->(:" + nodeData.name + ") RETURN r";
    let modalNodes: any = [];
    let modalEdges: any = [];
    console.debug(nodeData);
    forkJoin([
      this.service.sendQuery(nodeQuery),
      this.service.sendQuery(edgeQuery)
    ]).subscribe(([nodesData, edgesData]) => {
      nodesData.forEach((nodeData: any) => {
          modalNodes.push({
              id: nodeData._fields[0].identity,
              name: nodeData._fields[0].labels[0],
              properties: nodeData._fields[0].properties 
          });
      });
      console.debug("DATA RETURNED::")
      console.debug(nodesData);
      console.debug(edgesData);
      edgesData.forEach((edgeData: any) => {
          modalEdges.push({
              source: edgeData._fields[0].start,
              target: edgeData._fields[0].end,
              type: edgeData._fields[0].type
          });
      });
      let modalView = true;
      const data = {modalEdges, modalNodes, modalView};
      const dialogRef = this.dialog.open(NodeSingleDialogComponent, {
        data
      });
      dialogRef.afterClosed().subscribe((result: any) => {
        console.log('Modal closes', result);
      })
    });
  }


  handleCanvasDataChange() {
    console.debug("CANVAS CHANGE:")
    console.debug(this.canvasData);
    this.nodes = [];
    this.edges = [];
    //var data = this.canvasData;
    /*if(this.canvasData && this.canvasData.length == 0) {
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
      
    }*/
    console.debug(this.nodeData);
    console.debug(this.edgeData);
    this.nodes = this.nodeData;
    this.edges = this.edgeData;
    if(this.classicView){
      console.debug(this.nodes);
      console.debug(this.edges);
      this.createGraph();
    }else{
      console.debug(this.nodes);
      console.debug(this.edges);
      this.createClusterGraph();
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
      console.debug("ACTUAL EDGES:");
      console.debug(this.edges);
      console.debug("ACTUAL NODES:");
      console.debug(this.nodes);
      console.debug(this.classicView);
      if(this.classicView){
        this.createGraph();
      }else{
        this.createClusterGraph();
      }
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

    const links = linkGroup
    .selectAll('path')
    .data(this.edges)
    .enter().append('path')
    .attr('stroke', (d) => colorScale(d.type))
    .attr('text-anchor', 'middle')
    .attr('fill', 'none') // Prevent the path from being filled
    .attr('stroke-width', 2)
    .attr('fill', 'none');

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
      function linkArc(d: any) {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy);
        // Retrieve the link info based on the edge's id
        const linkInfo = linkIndex[[d.source.id, d.target.id].sort().join("-")];
        const totalLinks = linkInfo.total; // Make sure total is being updated somewhere in the code, or use maxIndex if you're using it to count links
        const linkNumber = d.linknum; // Use the correct property that you assigned during edge setup
      
        // The offset calculation might need to be tweaked depending on the desired distance between links
        let offset = (linkNumber - (totalLinks - 1) / 2) * 30; // Modify the multiplier for the curve spread
        if(linkNumber % 2 == 0){
          offset *= -1
        }
        let qx = d.source.x + dx / 2 + offset;
        let qy = d.source.y + dy / 2 + offset;
        if(totalLinks == 1){
          qx = 0;
          qy = 0;
        }
        return `M${d.source.x},${d.source.y}Q${qx},${qy} ${d.target.x},${d.target.y}`;
      }
      simulation.on('tick', () => {
        links.attr('d', linkArc);
        nodes.attr('transform', d => `translate(${d.x},${d.y})`); // Update the node positions
      });

    this.svg = svg;
    this.zoomBehavior = zoomBehavior;
}

createClusterGraph() {
  const svgWidth = window.innerWidth;
  const svgHeight = window.innerHeight;

  // Nodes: Count and consolidate based on type
  let nodeCounts: { [key: string]: number } = {};
  this.nodes.forEach(node => {
      let type = node.name;
      if (nodeCounts[type]) {
          nodeCounts[type]++;
      } else {
          nodeCounts[type] = 1;
      }
  });

  let clusterNodes = Object.keys(nodeCounts).map(type => ({
      id: type,
      name: type,
      properties: {
          amount: nodeCounts[type]
      },
  }));

  // Edges: Count and consolidate based on source-target-type
  let linkCounts: { [key: string]: { count: number, type: string } } = {};
  this.edges.forEach(edge => {
      let edgeSource: any;
      let edgeTarget: any;
      if(edge.source.id == undefined){
        edgeSource = edge.source;
        edgeTarget = edge.target;
      }else{
        edgeSource = edge.source.id;
        edgeTarget = edge.target.id;
      }
      const sourceType = this.nodes.find(node => node.id === edgeSource)?.name;
      const targetType = this.nodes.find(node => node.id === edgeTarget)?.name;

      if ((sourceType && targetType) && (sourceType != targetType)) {
          const key = `${sourceType}-${targetType}-${edge.type}`;

          if (linkCounts[key]) {
              linkCounts[key].count++;
          } else {
              linkCounts[key] = { count: 1, type: edge.type };
          }
      }
  });

  const consolidatedEdges = Object.entries(linkCounts).map(([key, info]) => {
      const [source, target, type] = key.split('-');
      return {
          source,
          target,
          type: info.type,
          count: info.count
      };
  });
  const nodeById: any = {};
clusterNodes.forEach((node) => {
  nodeById[node.id] = node;
});

consolidatedEdges.forEach((d: any, i) => {
    d.source = nodeById[d.source];
    d.target = nodeById[d.target];

    if (!d.source.linkCount) {
        d.source.linkCount = {};
    }

    if (d.source.linkCount[d.target.id]) {
        d.source.linkCount[d.target.id]++;
    } else {
        d.source.linkCount[d.target.id] = 1;
    }
    
    // Store the index of this link among the links between the same nodes
    d.linkIndex = d.source.linkCount[d.target.id] - 1;
});
function linkArc(d: any) {
    const dx = d.target.x - d.source.x,
      dy = d.target.y - d.source.y,
      dr = Math.sqrt(dx * dx + dy * dy);
    const offset = (d.linkIndex - d.source.linkCount[d.target.id] / 2) * 200; 
    const qx = d.source.x + dx / 2 + offset, qy = d.source.y + dy / 2 + offset;
    return `M${d.source.x},${d.source.y}Q${qx},${qy} ${d.target.x},${d.target.y}`;
  }

  // Extract unique node types and edge types
  const nodeTypes = [...new Set(this.nodes.map(node => node.name))];
  const edgeTypes = [...new Set(this.edges.map(edge => edge.type))];
  const allTypes = [...nodeTypes, ...edgeTypes]; // Combine node and edge types.

  // Generate colors for all unique types.
  const colors = this.generateColors(allTypes.length); 
  const colorScale = d3.scaleOrdinal(colors).domain(allTypes);

  // D3 setup
  const svg = d3.select(this.svgRef.nativeElement)
      .style('background-color', 'transparent')
      .attr('width', svgWidth)
      .attr('height', svgHeight);

  svg.selectAll('.nodes').remove();
  svg.selectAll('.links').remove();
  const zoomBehavior = d3.zoom()
      .extent([[0, 0], [svgWidth, svgHeight]])
      .scaleExtent([0.1, 8])
      .on('zoom', (event: any) => {
          linkGroup.attr('transform', event.transform);
          nodeGroup.attr('transform', event.transform);
      });

  svg.call(zoomBehavior);

  const simulation = d3.forceSimulation(clusterNodes as any)
      .force('link', d3.forceLink(consolidatedEdges).id((d: any) => d.id).distance(1000))
      .force('charge', d3.forceManyBody().strength(-2000))
      .force('center', d3.forceCenter(svgWidth / 2, svgHeight / 2))
      .force('collision', d3.forceCollide().radius(100));

  const linkGroup = svg.append('g').attr('class', 'links');
  const nodeGroup = svg.append('g').attr('class', 'nodes');

  const links = linkGroup
    .selectAll('path')
    .data(consolidatedEdges)
    .enter().append('path')
    .attr('stroke', (d) => colorScale(d.type))
    .attr('text-anchor', 'middle')
    .attr('fill', 'none') // Prevent the path from being filled
    .attr('stroke-width', 2)
    .attr('fill', 'none');
  
  
  const linkText = linkGroup
      .selectAll('.link-text')
      .data(consolidatedEdges)
      .enter().append('text')
      .attr('class', 'link-text')
      .text((d) => `${d.type}: ${d.count}`);
      const offsetRatio = 0.5; // Adjust this value as needed; 0.5 represents the midpoint of the curve.

      linkText
          .attr('x', (d: any) => {
              const dx = d.target.x - d.source.x;
              const dy = d.target.y - d.source.y;
              const qx = d.source.x + dx * offsetRatio;
              return qx;
          })
          .attr('y', (d: any) => {
              const dy = d.target.y - d.source.y;
              const dx = d.target.x - d.source.x;
              const qy = d.source.y + dy * offsetRatio;
              return qy;
          })
          .attr('transform', (d: any) => {
              const dx = d.target.x - d.source.x;
              const dy = d.target.y - d.source.y;
              const rotation = Math.atan2(dy, dx) * (180 / Math.PI);
              return `rotate(${rotation}, ${(d.source.x + d.target.x) / 2}, ${(d.source.y + d.target.y) / 2})`;
          })
          .text((d: any) => `${d.type}: ${d.count}`);
  const nodes = nodeGroup.selectAll('.node-group')
      .data(clusterNodes)
      .enter().append('g')
      .attr('class', 'node-group')
      .on('click', (event, nodeData) => this.displayNodes(nodeData));

  nodes.append('circle')
      .attr('r', 50)
      .attr('fill', (d) => colorScale(d.name));

  nodes.append('text')
      .attr('dy', -25)
      .style('text-anchor', 'middle')
      .style('font-weight', 'bold')
      .text((d) => `${d.name}: ${d.properties.amount}`);

      simulation.on('tick', () => {
        links.attr('d', linkArc);
    
        linkText
            .attr('x', (d: any) => {
                const dx = d.target.x - d.source.x;
                const dy = d.target.y - d.source.y;
                const dr = Math.sqrt(dx * dx + dy * dy);
                const offset = (d.linkIndex - d.source.linkCount[d.target.id] / 2) * 130; 
                const qx = d.source.x + dx / 2 + offset;
                return qx;
            })
            .attr('y', (d: any) => {
                const dy = d.target.y - d.source.y;
                const dx = d.target.x - d.source.x;
                const dr = Math.sqrt(dx * dx + dy * dy);
                const offset = (d.linkIndex - d.source.linkCount[d.target.id] / 2) * 90; 
                const qy = d.source.y + dy / 2 + offset;
                return qy;
            })
            .attr('transform', (d: any) => {
                const dx = d.target.x - d.source.x;
                const dy = d.target.y - d.source.y;
                const rotation = Math.atan2(dy, dx) * (390 / Math.PI);
                return `rotate(${rotation}, ${(d.source.x + d.target.x) / 2}, ${(d.source.y + d.target.y) / 2})`;
            })
            .text((d: any) => `${d.type}: ${d.count}`);
    
        nodes.attr('transform', (d: any) => `translate(${d.x}, ${d.y})`);
    });

  this.svg = svg;
  this.zoomBehavior = zoomBehavior;

  // Prepare data for modal window display
  const nodeTypesWithColors = nodeTypes.map(nodeType => ({
    nodeType: nodeType,
    color: colorScale(nodeType)
  }));

  const edgeTypesWithColors = edgeTypes.map(edgeType => ({
    relType: edgeType,
    color: colorScale(edgeType)
  }));

  // Emit the combined data (types and colors) for the modal
  this.nodeInfo.emit([nodeTypesWithColors, edgeTypesWithColors]);
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
