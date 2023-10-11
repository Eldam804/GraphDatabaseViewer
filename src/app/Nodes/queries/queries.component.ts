import { Component, Output, EventEmitter  } from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { DriverService } from 'src/app/Neo4j/Database/driver.service';

@Component({
  selector: 'app-queries',
  templateUrl: './queries.component.html',
  styleUrls: ['./queries.component.css']
})
export class QueriesComponent {
  public query?: String;
  public queries: any[] = [];
  @Output() queryResult: EventEmitter<any> = new EventEmitter(); 
  @Output() queryNodesResult: EventEmitter<any> = new EventEmitter(); 
  @Output() queryRelationshipsResult: EventEmitter<any> = new EventEmitter(); 
  constructor(private neo4jDriver: DriverService) {
  }

  sendQuery() {
    if (this.query) {
      this.neo4jDriver.sendQuery(this.query)
        .subscribe((result: any) => {
            // Success block
            const queryObj = {
              query: this.query,
              message: 'Success'
            };
            this.queries.push(queryObj);
            console.debug(this.queries);
            console.debug("QUERY RESULT:", result);
  
            // Prepare to separate and structure nodes and relationships data
            //const nodes: any = [];
            const relationships: any = [];
            const nodesMap = new Map();
  
            result.forEach((record: any) => {
              // Dynamically process all items in _fields
              record._fields.forEach((field: any) => {
                if (field.start && field.end) {
                  // It's a relationship
                  relationships.push({
                    source: field.start, // get the 'low' field from 'identity' for 'start' node
                    target: field.end, // get the 'low' field from 'identity' for 'end' node
                    type: field.type // get 'type' of the relationship
                    /*
                      source: edgeData._fields[0].start,
                      target: edgeData._fields[0].end,
                      type: edgeData._fields[0].type
                    */
                  });
                } else if (field.identity && field.labels != null) {
                  const nodeId = field.identity;
                  if(!nodesMap.has(nodeId)){
                    nodesMap.set(nodeId, {
                      id: field.identity, // get the 'low' field from 'identity'
                      name: field.labels ? field.labels[0] : '', // Check if 'labels' exists before accessing
                      properties: field.properties // get 'properties' of the node
                    })
                  }
                }
              });
            });
            const nodes = Array.from(nodesMap.values());
            // Emit the results separately
            console.debug("QUERY NODE RESULT:");
            console.debug(nodes);
            console.debug("REL RESULT:");
            console.debug(relationships);
            this.queryNodesResult.emit(nodes);
            this.queryRelationshipsResult.emit(relationships);
  
            this.query = "";
          },
          (error) => {
            // Error block
            console.error(error);
            const queryObj = {
              query: this.query,
              message: 'Error'
            };
            this.queries.push(queryObj);
            console.debug(this.queries);
            this.query = "";
          }
        );
    }
}

}
