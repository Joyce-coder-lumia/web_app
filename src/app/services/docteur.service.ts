import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StateService } from './state.service';

@Injectable({
  providedIn: 'root'
})
export class DocteurService {
  constructor(private http: HttpClient, private stateService: StateService) {}

  getDocteurs(): Observable<any[]> {
    return this.http.get<any[]>('http://127.0.0.1:5000/doctors');
  }

  upDoctor(doctorId: string, doctorData: any): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.stateService.getToken()}`);
    return this.http.put(`http://127.0.0.1:5000/docteur/${doctorId}`, doctorData, { headers });
  }

  

}
