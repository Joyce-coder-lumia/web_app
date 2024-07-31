import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './sharepages/login/login.component';
import { DashAdminComponent } from './pages/dash-admin/dash-admin.component';
import { DoctorDashboardComponent } from './pages/doctor-dashboard/doctor-dashboard.component';
import { SecretaireDashboardComponent } from './pages/secretaire-dashboard/secretaire-dashboard.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {path:'login',component:LoginComponent},
  {path:'admin',component:DashAdminComponent},
  {path:'doctor',component:DoctorDashboardComponent},
  {path:'secretaire',component:SecretaireDashboardComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
