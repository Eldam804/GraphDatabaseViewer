import { Component } from '@angular/core';
import { MatFormField } from '@angular/material/form-field';

@Component({
  selector: 'app-queries',
  templateUrl: './queries.component.html',
  styleUrls: ['./queries.component.css']
})
export class QueriesComponent {
  public query?: String;
  public queries: String[] = [];
  constructor() {
  }

  sendQuery() {
    if(this.query){
      this.queries.push(this.query);
      this.query = "";
    }
  }

}
