import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable  } from 'rxjs';
import { User } from '../models/user.model';
import { AuthService } from './auth.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { finalize } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';

import { StateService } from './state.service';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  

  constructor(private http: HttpClient, private authService: AuthService, private storage: AngularFireStorage, private afAuth: AngularFireAuth, private stateService: StateService) {}

  updateDoctorDetails(doctorDetails: any): Observable<any> {
    const token = this.stateService.getToken();
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.post(`http://127.0.0.1:5000/update-doctor`, doctorDetails, { headers });
  }

  

  getDoctorInfo(): Observable<any> {
    const token = this.stateService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get('http://127.0.0.1:5000/get-doctor-info', { headers });
  }
  

  

  uploadImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      this.afAuth.currentUser.then(user => {
        if (user) {
          const userId = user.uid;  // Obtenir l'UID de l'utilisateur actuel
          const filePath = `users/${userId}/${file.name}`;  // Chemin de stockage avec l'UID de l'utilisateur
          const fileRef = this.storage.ref(filePath);
          const uploadTask = this.storage.upload(filePath, file);

          uploadTask.snapshotChanges().pipe(
            finalize(async () => {
              try {
                const imageUrl = await fileRef.getDownloadURL().toPromise();
                // Mise à jour l'URL de l'image dans MongoDB
                const headers = new HttpHeaders({ 'Authorization': `Bearer ${await user.getIdToken()}` });
                await this.http.patch(`http://127.0.0.1:5000/doctors/${userId}`, { profileImageUrl: imageUrl }, { headers }).toPromise();
                resolve(imageUrl);  
              } catch (error) {
                reject(error); 
              }
            })
          ).subscribe();
        } else {
          reject('User not authenticated');  
        }
      }).catch(error => reject(error));  
    });
  }

  /* recuperation de tous les utilsateurs secre et docteur pour l'admin */
  /*getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`http://127.0.0.1:5000/users`);
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`http://127.0.0.1:5000/users/${userId}`);
  }

  updateUser(userId: string, user: User): Observable<any> {
    return this.http.put(`http://127.0.0.1:5000/users/${userId}`, user);
  }*/

  
  getUsers(): Observable<any[]> {
    return this.authService.getToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
        return this.http.get<any[]>(`http://127.0.0.1:5000/users`, { headers });
      })
    );
  }

  deleteUser(userId: string): Observable<any> {
    return this.authService.getToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
        return this.http.delete(`http://127.0.0.1:5000/users/${userId}`, { headers });
      })
    );
  }


  updateUser(userId: string, user: User): Observable<any> {
    return this.authService.getToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
        return this.http.put(`http://127.0.0.1:5000/users/${userId}`, user, { headers });
      })
    );
  }

  getUserRoleCounts(): Observable<any> {
    return this.http.get(`http://127.0.0.1:5000/users/role_counts`);
  }

  
  getActivities(): Observable<any[]> {
    return this.http.get<any[]>(`http://127.0.0.1:5000/activities`);
  }


  /*statistiq admin */
  getStatisRendezvous(): Observable<any[]> {
    const token = this.stateService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`http://127.0.0.1:5000/statistique-rendez-vous`, { headers });
  }

  


  

}
