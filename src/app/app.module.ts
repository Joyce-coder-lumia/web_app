import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { HttpClientModule, HttpClient, HttpHandler } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './sharepages/login/login.component';
import{AngularFireModule} from '@angular/fire/compat';
import { environment } from '../environments/environment';
import { SearchBarComponent } from './pages/search-bar/search-bar.component';
import { DashAdminComponent } from './pages/dash-admin/dash-admin.component';
import { MainContenuComponent } from './sharepages/main-contenu/main-contenu.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { DoctorDashboardComponent } from './pages/doctor-dashboard/doctor-dashboard.component';
import { SecretaireDashboardComponent } from './pages/secretaire-dashboard/secretaire-dashboard.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { PatientService } from './services/patient.service';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
/*import { provideCharts, withDefaultRegisterables } from 'ng2-charts';*/


const config: SocketIoConfig = { url: 'http://localhost:5000', options: {} };

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SearchBarComponent,
    DashAdminComponent,
    MainContenuComponent,
    DoctorDashboardComponent,
    SecretaireDashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireStorageModule,
    SocketIoModule.forRoot(config),


    
    

    

  ],
  providers: [
     PatientService,
    provideClientHydration(),
    /*provideCharts(withDefaultRegisterables())*/
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
