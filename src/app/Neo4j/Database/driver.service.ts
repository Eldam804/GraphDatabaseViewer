import { Injectable } from '@angular/core';
import neo4j,{ Driver, Session } from 'neo4j-driver';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  public neo4jUrl: string;
  private driver: Driver;
  constructor() { 
    this.neo4jUrl = 'bolt://localhost:7687';
    this.driver = neo4j.driver(this.neo4jUrl, neo4j.auth.basic('neo4j', 'Swag1234'), {disableLosslessIntegers: true});
  }

  sendQuery(query: String):Observable<any>{
    return from(this.execute(query));
  }

  public getAllNodes():Observable<any>{
    //return from(this.execute("MATCH(n) MATCH()-[r]-() RETURN n, r"));
    return from(this.execute("MATCH(n) RETURN n"));
  }
  public getAllEdges(): Observable<any> {
    return from(this.execute("MATCH ()-[r]->() RETURN r"));
  }

  private execute(query: String): Promise<any>{
    return new Promise((resolve, reject) => {
      const session: Session = this.driver.session();
      session
        .run(query)
        .then(result => {
          session.close();
          resolve(result.records);
        })
        .catch(error => {
          session.close();
          reject(error);
        });
    });
  }
}
