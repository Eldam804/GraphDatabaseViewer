import { Component } from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { DriverService } from 'src/app/Neo4j/Database/driver.service';

@Component({
  selector: 'app-queries',
  templateUrl: './queries.component.html',
  styleUrls: ['./queries.component.css']
})
export class QueriesComponent {
  public query?: String;
  public queries: String[] = [];
  constructor(private neo4jDriver: DriverService) {
  }

  sendQuery() {
    if(this.query){
      this.queries.push(this.query);
      this.neo4jDriver.sendQuery(this.query);
      this.query = "";
    }
  }

}
