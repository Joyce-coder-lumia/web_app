import { Component, ViewChild, Renderer2, AfterViewInit } from '@angular/core';
import { MainContenuComponent } from '../../sharepages/main-contenu/main-contenu.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dash-admin',
  templateUrl: './dash-admin.component.html',
  styleUrl: './dash-admin.component.css'
})
export class DashAdminComponent {
  constructor(private authService: AuthService, private renderer: Renderer2) {}

  currentView: string = 'home';  // ici je definie la vue par défaut
  @ViewChild(MainContenuComponent) mainContenu!: MainContenuComponent;

  setView(view: string): void {
    this.currentView = view;



    if (view === 'home') {
      this.loadActivities();
    }
    
  }

  ngAfterViewInit() {}

  expandMenu() {
    const mainMenu = document.querySelector('.main-menu') as HTMLElement;
    if (mainMenu) {
      this.renderer.addClass(mainMenu, 'expanded');
    }
  }

  collapseMenu() {
    const mainMenu = document.querySelector('.main-menu') as HTMLElement;
    if (mainMenu) {
      this.renderer.removeClass(mainMenu, 'expanded');
    }
  }

  

  

  

  

  utilisateurs: any[] = [];
  filteredUtilisateurs: any[] = [];

  onSearch(value: string): void {
    console.log('Recherche reçue avec la valeur :', value);
    this.mainContenu.onSearch(value);
  }

  loadActivities(): void {
    this.mainContenu.loadActivities();
  }

  onLogout() {
    console.log('Déconnexion déclenchée'); 
    this.authService.logout();
  }

}
