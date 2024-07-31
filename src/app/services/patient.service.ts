import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { StateService } from './state.service';

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  constructor(private http: HttpClient, private stateService: StateService) { }
  
  /*Pour la recuperation que le docteur fait*/
  getPatients(doctorId: string, token: string): Observable<any> {
    console.log(' patients affichage'); 
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get('http://127.0.0.1:5000/listerendezvous', {
      headers,
      params: {
        doctor_id: doctorId
      }
    }).pipe(
      tap(data => console.log('Response received:', data)), 
      catchError(error => {
        console.error('Error in getPatients:', error); 
        return throwError(error);
      })
    );
  }

  
  cancelAppointment(rendezvousId: string, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.patch(`http://127.0.0.1:5000/rendezvous/${rendezvousId}/annuler`, null, { headers });
  }

  confirmAppointment(rendezvousId: string, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.patch(`http://127.0.0.1:5000/rendezvous/${rendezvousId}/confirmer`, null, { headers })
      .pipe(
        tap(data => console.log('Appointment confirmed successfully:', data)),
        catchError(error => {
          console.error('Error in confirmAppointment:', error);
          return throwError(error);
        })
      );
  }
  
  rescheduleAppointment(rendezvousId: string, newDate: string, newStartTime: string, newEndTime: string): Observable<any> {
  const token = this.stateService.getToken(); 
  const body = { newDate, newStartTime, newEndTime };
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  console.log('Sending data:', body); 

  return this.http.patch(`http://127.0.0.1:5000/rendezvous/${rendezvousId}/decaler`, body, { headers });
}

/*Pour la recuperation que la secretaire fait secretaire  */
getAllAppointments(token: string): Observable<any> {
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.get(`http://127.0.0.1:5000/listepriserendezvous`, { headers }).pipe(
      tap(data => console.log('Response received:', data)),
      catchError(error => {
          console.error('Error in getAllAppointments:', error);
          return throwError(error);
      })
  );
}

sendReminder(rendezvousId: string, token: string): Observable<any> {
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.post(`http://127.0.0.1:5000/rendezvous/${rendezvousId}/rappel`, null, { headers })
    .pipe(
      tap(data => console.log('Reminder sent successfully:', data)),
      catchError(error => {
        console.error('Error in sendReminder:', error);
        return throwError(error);
      })
    );
}

cancelAppointmentBySecretary(rendezvousId: string, token: string): Observable<any> {
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.patch(`http://127.0.0.1:5000/rendezvous/${rendezvousId}/annuler_par_secretaire`, null, { headers })
    .pipe(
      tap(data => console.log('Appointment cancelled successfully by secretary:', data)),
      catchError(error => {
        console.error('Error in cancelAppointmentBySecretary:', error);
        return throwError(error);
      })
    );
  }

  confirmAppointmentBySecretary(rendezvousId: string, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.patch(`http://127.0.0.1:5000/rendezvous/${rendezvousId}/confirmer_par_secretaire`, null, { headers })
      .pipe(
        tap(data => console.log('Appointment confirmed successfully by secretary:', data)),
        catchError(error => {
          console.error('Error in confirmAppointmentBySecretary:', error);
          return throwError(error);
        })
      );
  }

  rescheduleAppointmentBySecretary(rendezvousId: string, newDate: string, newStartTime: string, newEndTime: string): Observable<any> {
    const token = this.stateService.getToken(); 
  const body = { newDate, newStartTime, newEndTime };
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  console.log('Sending data:', body); 

  return this.http.patch(`http://127.0.0.1:5000/rendezvous/${rendezvousId}/decaler_par_secretaire`, body, { headers });
  }

  /*deleteAppointment(rendezvousId: string, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`http://127.0.0.1:5000/rendezvous/${rendezvousId}/supprimer`, { headers })
      .pipe(
        tap(data => console.log('Appointment deleted:', data)),
        catchError(error => {
          console.error('Error deleting appointment:', error);
          return throwError(error);
        })
      );
  }*/

  archiveAppointment(rendezvousId: string): Observable<any> {
    const token = this.stateService.getToken(); 
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`http://127.0.0.1:5000/rendezvous/${rendezvousId}/archive`, {}, { headers });
  }

  /*action docteur */
  addConsultation(consultation: any): Observable<any> {
    const token = this.stateService.getToken(); 
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`http://127.0.0.1:5000/ajouter_consultation`, consultation, { headers });
  }

  getPatientJournal(appointmentId: string): Observable<any> {
    const token = this.stateService.getToken();
    console.log("Token from stateService: ", token);

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    console.log("Request headers: ", headers);

    return this.http.get(`http://127.0.0.1:5000/get-patient-journal/${appointmentId}`, { headers });
  }

  downloadPatientJournal(appointmentId: string): Observable<Blob> {
    const token = this.stateService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`http://127.0.0.1:5000/download-patient-journal/${appointmentId}`, { headers, responseType: 'blob' });
  }
  
  


}




