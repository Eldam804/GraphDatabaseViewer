import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Component, Inject, ViewChild, ChangeDetectorRef  } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef, MatDialogModule} from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { DriverService } from 'src/app/Neo4j/Database/driver.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dbconnect-dialog',
  templateUrl: './dbconnect-dialog.component.html',
  styleUrls: ['./dbconnect-dialog.component.css'],
})
export class DBConnectDialogComponent {
    public dbChecked = false;
    public loading: Boolean = false; 
    @ViewChild('stepper') private stepper!: MatStepper;
    credentialsForm = new FormGroup({
      url: new FormControl('bolt://localhost:7687'),
      username: new FormControl('neo4j'),
      password: new FormControl('neo4j'),
    });
    constructor(
      public dialogRef: MatDialogRef<DBConnectDialogComponent>,
      private driverService: DriverService,
      private changeDetectorRef: ChangeDetectorRef,
      private snackBar: MatSnackBar
    ) {
      this.credentialsForm = new FormGroup({
        url: new FormControl('bolt://localhost:7687', Validators.required),
        username: new FormControl({ value: 'neo4j', disabled: true }, Validators.required),
        password: new FormControl({ value: 'neo4j', disabled: true }, Validators.required),
      })
    }
    showSnackbar(message: string) {
      this.snackBar.open(message, 'Close', {
        duration: 2000,
        verticalPosition: 'top'
      });
    }
    onStepChange(event: StepperSelectionEvent) {
      // If moving back to the first step, reset dbChecked
      if (event.selectedIndex === 0) {
        this.dbChecked = false;
        this.credentialsForm.get('username')!.disable();
        this.credentialsForm.get('password')!.disable();
        this.credentialsForm = new FormGroup({
          url: new FormControl('bolt://localhost:7687', Validators.required),
          username: new FormControl({ value: 'neo4j', disabled: true }, Validators.required),
          password: new FormControl({ value: 'neo4j', disabled: true }, Validators.required),
        })
      }
    }
    checkDatabase() {
      this.loading = true;
      const url = this.credentialsForm.get('url')!.value;
      this.driverService.testConnection(url)
        .then(isAvailable => {
          this.loading = false;
          this.changeDetectorRef.detectChanges(); // Trigger change detection manually
          if(isAvailable){
            console.debug("CONNECTION SUCCESS");
            this.dbChecked = true;
            this.credentialsForm.get('username')!.enable();
            this.credentialsForm.get('password')!.enable();
            this.showSnackbar("Database connection successful!");
            setTimeout(() => this.stepper.next(), 2); // Programmatically move to the next step
          } else {
            this.showSnackbar("Database connection unsuccessful!");
            console.debug("CONNECTION UNSUCCESSFUL");
            // Handle unsuccessful connection
          }
        });
    }

    onSubmit(){
      this.loading = true;
      
      //@ts-ignore
      this.driverService.updateCredentials(this.credentialsForm.get('url')?.value, this.credentialsForm.get('username')?.value, this.credentialsForm.get('password')?.value).subscribe({
        next: () => {
            // Success handling
            //this.showSnackbar("Successfully connected to the database!");
        },
        error:(error: any) => {
            // Error handling
            //console.error('Error updating credentials:', error);
            //this.showSnackbar("Failed to connect to the database.");
        },
        complete: () => {
            // This will run after either next or error
            setTimeout(() => {
              this.dialogRef.close();
              this.loading = false;
              this.driverService.checkDatabaseConnectivity().then(isConnected => {
                  if(isConnected){
                    this.showSnackbar("Successfully connected to the database!");
                  }else{
                    this.showSnackbar("Failed to connect to the database.");
                  }
                }
              )
          }, 3000);
        }
    });
      
    }

    onNoClick(): void {
      this.dialogRef.close();
    }
}
