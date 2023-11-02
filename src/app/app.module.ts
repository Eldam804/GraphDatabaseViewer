import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CanvasViewComponent } from './Nodes/canvas-view/canvas-view.component';
import { QueriesComponent } from './Nodes/queries/queries.component';
import { HeaderComponent } from './Page/header/header.component';
import { BodyComponent } from './Page/body/body.component';
import { FooterComponent } from './Page/footer/footer.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {MatGridListModule} from '@angular/material/grid-list';
import {CdkDrag} from '@angular/cdk/drag-drop';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import { DBConnectDialogComponent } from './Components/dbconnect-dialog/dbconnect-dialog.component';
import {NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import {MatSidenavModule} from '@angular/material/sidenav';
import { NodeMapDialogComponent } from './Components/node-map-dialog/node-map-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NodeDetailDialogComponent } from './Components/node-detail-dialog/node-detail-dialog.component';
@NgModule({
  declarations: [
    AppComponent,
    CanvasViewComponent,
    QueriesComponent,
    HeaderComponent,
    BodyComponent,
    FooterComponent,
    DBConnectDialogComponent,
    NodeMapDialogComponent,
    NodeDetailDialogComponent,
  ],
  exports: [
    AppComponent,
    CanvasViewComponent,
    QueriesComponent,
    HeaderComponent,
    BodyComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatGridListModule,
    CdkDrag,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    NgIf,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatSidenavModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
