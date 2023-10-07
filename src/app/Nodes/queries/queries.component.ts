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
  constructor(private neo4jDriver: DriverService) {
  }

  sendQuery() {
    if(this.query){
      this.neo4jDriver.sendQuery(this.query)
        .subscribe((result: any) => {
            // Success block
            const queryObj = {
              query: this.query,
              message: 'Success'
            };
            this.queries.push(queryObj);
            console.debug(this.queries);
            console.debug("QUERY RESULT:" + result)
            this.queryResult.emit(result);
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
