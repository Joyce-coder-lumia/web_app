import { Injectable } from '@angular/core';
import{AngularFireAuth} from '@angular/fire/compat/auth'
import { AngularFirestore } from '@angular/fire/compat/firestore';  
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { from, Observable, of, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { StateService } from './state.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private fireauth : AngularFireAuth, private firestore: AngularFirestore, private router : Router, private http: HttpClient,     private stateService: StateService
  ) { }

  //login method
  login(email: string, password: string) {
  this.fireauth.signInWithEmailAndPassword(email, password).then(res => {
    if (res.user) {
      res.user.getIdToken().then(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        this.http.get('http://127.0.0.1:5000/user-info', { headers: headers }).subscribe({
          next: (userInfo: any) => {
            console.log('Informations utilisateur reçues :', userInfo.role);
            this.stateService.setToken(token);
            this.stateService.setUser(userInfo._id, userInfo.role);

            
            const redirectPath = this.getRedirectPath(userInfo.role);
            console.log('Chemin de redirection:', redirectPath); 
            alert('connexion reussie');

            this.router.navigate([redirectPath]);
          },
          error: (error) => {
            console.error("Erreur lors de la récupération des informations de l'utilisateur", error);
            this.router.navigate(['/login']);
          }
        });
      }).catch(err => {
        console.error("Erreur lors de la récupération du token d'authentification", err);
        this.router.navigate(['/login']);
      });
    } else {
      console.error('Aucun utilisateur trouvé');
      this.router.navigate(['/login']);
    }
  }).catch(err => {
    alert(err.message);
    this.router.navigate(['/login']);
  });
}
getRedirectPath(role: string): string {
  switch (role) {
    case 'Admin': return '/admin';
    case 'Docteur': return '/doctor';
    case 'Secretaire': return '/secretaire';
    default: return '/login';
  }
}


    // register method
    register(user: User) {
      return new Promise<void>((resolve, reject) => {
        if (!user.email || !user.password) {
          reject("Email is missing");
          return;
        }  
        this.fireauth.createUserWithEmailAndPassword(user.email, user.password)
          .then(res => {
            if (res.user) {
              res.user.getIdToken().then(token => {
                // Préparation les en-têtes pour l'authentification à l'API
                const headers = { 'Authorization': `Bearer ${token}` };
                // Exclur l'email et le mot de passe des données envoyées à Flask
                const userDetails: Partial<User> = {
                  uid: res.user!.uid,
                  nom: user.nom,
                  prenom: user.prenom,
                  phoneNumber: user.phoneNumber,
                  dateNaissance: user.dateNaissance,
                  role: user.role
                };
                if (user.role === 'Docteur' && user.specialite) {
                  userDetails.specialite = user.specialite;
                }
                this.http.post(`http://127.0.0.1:5000/create-user`, userDetails, { headers })
                  .subscribe({
                    next: () => {
                      alert('Inscription réussie');
                      resolve();
                    },
                    error: (err) => {
                      console.error('Erreur lors de l\'inscription:', err);
                      alert(`Inscription échouée: ${err.error.message}`);
                      reject(err);
                    }
                  });
              });
            }
          })
          .catch(error => {
            console.error('Erreur de création de l\'utilisateur Firebase:', error);
            alert(`Erreur de création de l'utilisateur: ${error.message}`);
            reject(error);
          });
      });
    }
    
    //sign out
    logout(){
      this.fireauth.signOut().then(() => {
        console.log('User successfully logged out'); 

        this.stateService.clearUser();
        this.router.navigate(['/login']);
  
    }, err => {
      alert(err.message);
  
    })
    }

    getToken(): Observable<string> {
      return from(this.fireauth.idToken).pipe(
        switchMap(token => {
          if (token) {
            return of(token);
          } else {
            return throwError('No token found');
          }
        })
      );
    }
    

  

  
  
}
