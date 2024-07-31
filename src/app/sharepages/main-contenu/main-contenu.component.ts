import { Component, OnInit, Input  } from '@angular/core';
import { NgForm } from '@angular/forms';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { ChangeDetectorRef } from '@angular/core';
import { ViewChild } from '@angular/core';
import { UserService } from '../../services/user.service';
/*import { ChartOptions, ChartType, ChartData } from 'chart.js';*/



@Component({
  selector: 'app-main-contenu',
  templateUrl: './main-contenu.component.html',
  styleUrl: './main-contenu.component.css',

})
export class MainContenuComponent implements OnInit{
  @Input() currentView: string = 'home';  // Définir la vue par défaut
  filteredUtilisateurs: User[] = [];
  activities: any[] = [];
  utilisateurs: User[] = [];
  selectedUser: User = { uid: '' } as User; // Utilisation de l'interface User
  roleCounts: { [key: string]: number } = {};
  roles: string[] = ['Admin', 'Secretaire', 'Docteur'];

  /*pagination */
  paginatedUsers: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 3;
  totalPages: number = 1;
  totalPagesArray: number[] = [];

  /*pagination activités */
  paginatedActivities: any[] = [];
  currentActivityPage: number = 1;
  activitiesPerPage: number = 10;
  totalActivityPages: number = 1;
  totalActivityPagesArray: number[] = [];

  /*chart */
  

  user: User = {
    uid: '', 
    nom: '',
    prenom: '',
    email: '',
    password: '',
    phoneNumber: '',
    dateNaissance: undefined,
    role: '',
    specialite: ''
  };
  constructor(private authService: AuthService, private cdr: ChangeDetectorRef, private userService: UserService) { }

  @ViewChild('userForm', { static: false }) userForm!: NgForm;

  register(form: NgForm) {
    this.authService.register(this.user)
      .then(res => {
        console.log('Inscription réussie', res);
        alert("Inscription reussie");
        if (this.userForm) {
          this.userForm.resetForm();
        }
        this.user = { 
          uid: '', 
          nom: '',
          prenom: '',
          email: '',
          password: '',
          phoneNumber: '',
          dateNaissance: undefined,
          role: '',
          specialite: ''
        };
      })
      .catch(err => {
        console.error('Erreur lors de l\'inscription', err);
        alert("erreur");
      });
  }

  /* code pour recuperation des utilsa secre et docteurs */
  ngOnInit(): void {
    this.loadUsers();
    this.getUserRoleCounts();


  }

  
  loadUsers(): void {
    this.userService.getUsers().subscribe((users: User[]) => {
      this.utilisateurs = users;
      this.filteredUtilisateurs = users;
      this.setupPagination();
      // Met à jour les utilisateurs paginés
      this.updatePaginatedUsers();
    });
  }

  updatePaginatedUsers(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedUsers = this.filteredUtilisateurs.slice(startIndex, endIndex);
  }
  
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePaginatedUsers();
    console.log(`Navigated to page users ${page}`);
  }
  

  setupPagination(): void {
    this.totalPages = Math.ceil(this.filteredUtilisateurs.length / this.itemsPerPage);
    this.totalPagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.updatePaginatedUsers();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedUsers();
      console.log('Navigated to previous page');

    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedUsers();
      console.log('Navigated to next page');

    }
  }







  deleteUser(userId: string): void {
    this.userService.deleteUser(userId).subscribe(
      response => {
        alert('Utilisateur supprime avec succes');

        console.log('Utilisateur supprimé avec succès', response);
        this.loadUsers(); 
      },
      error => {
        console.error('Erreur lors de la suppression de l\'utilisateur', error);
      }
    );
  }

  editUser(user: User): void {
    console.log('User to edit:', user); 

    this.selectedUser = { ...user };

  }

  updateUser(): void {
    this.userService.updateUser(this.selectedUser.uid, this.selectedUser).subscribe(
      () => {
        this.loadUsers(); 
        alert('Utilisateur mis à jour avec succès !');

      },
      (error) => {
        console.error('Erreur lors de la mise à jour de l\'utilisateur', error);
        alert('Erreur lors de la mise à jour de l\'utilisateur.');

      }
    );
  }

  /*pour la bare de recherche */
  onSearch(value: string): void {
    console.log('Recherche reçue avec la valeur :', value);
    if (value) {
      this.filteredUtilisateurs = this.utilisateurs.filter(user => 
        (user.nom?.toLowerCase().includes(value.toLowerCase()) || 
        user.prenom?.toLowerCase().includes(value.toLowerCase())) ?? false
      );
    } else {
      this.filteredUtilisateurs = this.utilisateurs;
    }
    this.totalPages = Math.ceil(this.filteredUtilisateurs.length / this.itemsPerPage);
    this.totalPagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.updatePaginatedUsers();
    console.log('Utilisateurs filtrés :', this.filteredUtilisateurs);
  }

  
  

  


  /*affichage des card  */
  getUserRoleCounts(): void {
    this.userService.getUserRoleCounts().subscribe(
      (data) => {
        this.roleCounts = data;
      },
      (error) => {
        console.error('Erreur lors de la récupération des comptes par rôle', error);
      }
    );
  }

  getIconClass(role: string): string {
    switch (role) {
      case 'Admin':
        return 'bi-key';
      case 'Secretaire':
        return 'bi-person-lines-fill';
      case 'Docteur':
        return 'bi-person';
      default:
        return 'bi-person';
    }
  }

  loadActivities(): void {
    console.log('Loading activities...'); 

    this.userService.getActivities().subscribe(
      (activities: any[]) => {
        this.activities = activities;
        this.setupActivityPagination();

        console.log('Activities loaded:', this.activities); 

      },
      (error) => {
        console.error('Erreur lors du chargement des activités', error);
      }
    );
  }

  setupActivityPagination(): void {
    this.totalActivityPages = Math.ceil(this.activities.length / this.activitiesPerPage);
    this.totalActivityPagesArray = Array.from({ length: this.totalActivityPages }, (_, i) => i + 1);
    this.updatePaginatedActivities();
  }

  updatePaginatedActivities(): void {
    const startIndex = (this.currentActivityPage - 1) * this.activitiesPerPage;
    const endIndex = startIndex + this.activitiesPerPage;
    this.paginatedActivities = this.activities.slice(startIndex, endIndex);
  }

  goToActivityPage(page: number): void {
    if (page < 1 || page > this.totalActivityPages) return;
    this.currentActivityPage = page;
    this.updatePaginatedActivities();
    console.log(`Navigated to activity page ${page}`);
  }

  previousActivityPage(): void {
    if (this.currentActivityPage > 1) {
      this.currentActivityPage--;
      this.updatePaginatedActivities();
      console.log('Navigated to previous activity page');
    }
  }

  nextActivityPage(): void {
    if (this.currentActivityPage < this.totalActivityPages) {
      this.currentActivityPage++;
      this.updatePaginatedActivities();
      console.log('Navigated to next activity page');
    }
  }

  /*statisque */
  

}
