import { Injectable } from '@angular/core';
import neo4j,{ Driver, Session } from 'neo4j-driver';
import { BehaviorSubject, Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private driver!: Driver;
  private _neo4jUrl = new BehaviorSubject<string>('bolt://localhost:7687');
  private _credentials = new BehaviorSubject<{username: string; password: string}>({ username: 'neo4j', password: 'neo4j' });
  private username;
  private password;
  constructor() { 
    this._credentials.next({username: "neo4j",password: "neo4j"});
    this.username = this._credentials.value.username;
    this.password = this._credentials.value.password;
    this.initializeDriver(this.username, this.password);
  }
  public updateCredentials(url: string, username: string, password: string): Observable<void> {
    return from(new Promise<void>((resolve, reject) => {
        // Close the existing driver and wait for the closure to complete
        if (this.driver) {
            this.driver.close().then(() => {
                this.initializeNewDriver(url, username, password, resolve, reject);
            }).catch(reject);
        } else {
            this.initializeNewDriver(url, username, password, resolve, reject);
        }
    }));
}
private initializeNewDriver(url: string, username: string, password: string, resolve: () => void, reject: (reason: any) => void) {
  this._neo4jUrl.next(url);
  this._credentials.next({ username, password });
  this.username = username;
  this.password = password;

  try {
      this.driver = neo4j.driver(this._neo4jUrl.value, neo4j.auth.basic(username, password), { disableLosslessIntegers: true });
      resolve();
  } catch (error) {
      reject(error);
  }
}
  public checkDatabaseConnectivity(): Promise<boolean> {
    const session = this.driver.session();
    return session
      .run('RETURN 1')
      .then(() => {
        session.close();
        return true; // The database is connected
      })
      .catch(error => {
        console.error('Error checking database connectivity:', error);
        session.close();
        return false; // There was an error connecting to the database
      });
  }
  private initializeDriver(username: string, password: string): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            this.driver = neo4j.driver(this._neo4jUrl.value, neo4j.auth.basic(username, password), { disableLosslessIntegers: true });
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}
  get credentials$(): Observable<{ username: string; password: string }> {
    return this._credentials.asObservable();
  }

  // Method to get Observable for neo4jUrl
  get neo4jUrl$(): Observable<string> {
    return this._neo4jUrl.asObservable();
  }
  public testConnection(url: any): Promise<boolean> {
    return new Promise((resolve) => {
      const tempDriver = neo4j.driver(url, neo4j.auth.basic('', ''), {
        // Adjust connection timeout if necessary
        connectionTimeout: 20000,
      });
  
      // Get server info to test the connection
      tempDriver.getServerInfo()
        .then(info => {
          console.log('Connected to Neo4j server:', info);
          //resolve(true);      // Resolve true if the server info is retrieved successfully
        })
        .catch(error => {
          if (error.code === 'Neo.ClientError.Security.Unauthorized') {
            resolve(true);
          } else {
            resolve(false);
          }
          resolve(false);     // Resolve false if there is an error retrieving server info
        })
        .finally(() => {
          tempDriver.close(); // Always close the driver
        });
    });
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
