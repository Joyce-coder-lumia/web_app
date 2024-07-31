import { Component, OnInit, ViewChild, ElementRef  } from '@angular/core';
import { DocteurService } from '../../services/docteur.service';
import { SocketService } from '../../services/socket.service';
import { StateService } from '../../services/state.service';
import { AuthService } from '../../services/auth.service';
import { PatientService } from '../../services/patient.service';
import { FormBuilder, FormGroup, Validators, FormArray  } from '@angular/forms';


@Component({
  selector: 'app-secretaire-dashboard',
  templateUrl: './secretaire-dashboard.component.html',
  styleUrl: './secretaire-dashboard.component.css'
})
export class SecretaireDashboardComponent implements OnInit {
  activeTab: string = 'agenda';  // Pour suivre l'onglet actif
  docteurs: any[] = [];
  daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']; 
  notifications: any[] = [];
  token: string | null = null;
  appointments: any[] = [];
  rescheduleForm!: FormGroup;
  selectedRendezvousId: string = '';

  editDoctorForm!: FormGroup;
  selectedDoctor: any;
  @ViewChild('rescheduleModal', { static: true }) rescheduleModal!: ElementRef;
  @ViewChild('editDoctorModal', { static: false }) editDoctorModal!: ElementRef;

  


  constructor( private fb: FormBuilder, private docteurService: DocteurService, private socketService: SocketService, private stateService: StateService, private authService: AuthService, private patientService: PatientService){this.socketService.notification.subscribe((notification: any) => {
    this.notifications.push(notification);
  });}

  ngOnInit(): void {
    this.docteurService.getDocteurs().subscribe(data => {
      this.docteurs = data;
    });

    this.token = this.stateService.getToken();
    if (this.token) {
      this.fetchAllAppointments();
    } else {
      console.error('No token available');
    }

    this.fetchAllAppointments();

    this.rescheduleForm = this.fb.group({
      newDate: ['', Validators.required],
      newStartTime: ['', Validators.required],
      newEndTime: ['', Validators.required]
    });

    this.editDoctorForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      heuresDebut: ['', Validators.required],
      heuresFin: ['', Validators.required],
      joursTravail: this.fb.array(this.daysOfWeek.map(() => this.fb.control(false))),
      
      specialite:['', Validators.required],
      description:['', Validators.required]
    });

    
    console.log('Secretary Dashboard Initialized');
    this.socketService.notification.subscribe((data: any) => {
      console.log('Notification received:', data);
      this.notifications.push(data);
    });
    
  }

  fetchAllAppointments(): void {
    if (this.token) {
      this.patientService.getAllAppointments(this.token).subscribe({
        next: (data: any) => {
          this.appointments = data;
          console.log('Appointments data:', data); 
        },
        error: (error) => {
          console.error('Error fetching appointments', error);
        }
      });
    }
  }

  openTab(tab: string): void {
    this.activeTab = tab;
  }

  sendReminder(rendezvousId: string): void {
    if (this.token) {
      this.patientService.sendReminder(rendezvousId, this.token).subscribe({
        next: (response: any) => {
          console.log('Reminder sent successfully', response);
          alert('Rappel envoyé avec succès');
        },
        error: (error: any) => {
          console.error('Error sending reminder', error);
          alert('Erreur lors de l\'envoi du rappel');
        }
      });
    } else {
      console.error('No token available for sending reminder');
    }
  }

  cancelAppointmentBySecretary(rendezvousId: string): void {
    if (this.token) {
      this.patientService.cancelAppointmentBySecretary(rendezvousId, this.token).subscribe({
        next: (response: any) => {
          console.log('Appointment cancelled successfully', response);
          this.fetchAllAppointments(); 
          alert('Rendez-vous annulé avec succès');
        },
        error: (error: any) => {
          console.error('Error cancelling appointment', error);
          alert('Erreur lors de l\'annulation du rendez-vous');
        }
      });
    } else {
      console.error('No token available for cancelling appointment');
    }
  }

  confirmAppointmentBySecretary(rendezvousId: string): void {
    if (this.token) {
      this.patientService.confirmAppointmentBySecretary(rendezvousId, this.token).subscribe({
        next: (response: any) => {
          console.log('Appointment confirmed successfully', response);
          this.fetchAllAppointments(); 
          alert('Rendez-vous confirmé avec succès');
        },
        error: (error: any) => {
          console.error('Error confirming appointment', error);
          alert('Erreur lors de la confirmation du rendez-vous');
        }
      });
    } else {
      console.error('No token available for confirming appointment');
    }
  }

  openRescheduleModal(rendezvousId: string): void {
    this.selectedRendezvousId = rendezvousId;
    const modalElement = this.rescheduleModal.nativeElement;
    const modal = new (window as any).bootstrap.Modal(modalElement);
    modal.show();
  }

  rescheduleAppointmentBySecretary(): void {
    const newDate = this.rescheduleForm.get('newDate')?.value;
    const newStartTime = this.rescheduleForm.get('newStartTime')?.value;
    const newEndTime = this.rescheduleForm.get('newEndTime')?.value;

    this.patientService.rescheduleAppointmentBySecretary(this.selectedRendezvousId, newDate, newStartTime, newEndTime)
      .subscribe({
        next: (response: any) => {
          console.log('Rendez-vous décalé avec succès', response);
          this.fetchAllAppointments(); 
          alert('Rendez-vous décalé avec succès');
        },
        error: (error: any) => {
          console.error('Erreur lors du décalage du rendez-vous', error);
        }
      });
  }

  /*deleteAppointment(rendezvousId: string): void {
    if (this.token) {
    this.patientService.deleteAppointment(rendezvousId, this.token).subscribe({
      next: (response: any) => {
        console.log('Rendez-vous supprimé avec succès', response);
        alert('Rendez-vous supprimé avec succès');
        this.fetchAllAppointments(); 
      },
      error: (error: any) => {
        console.error('Erreur lors de la suppression du rendez-vous', error);
        alert('Erreur lors de la suppression du rendez-vous');
      }
    });
    } else {
    console.error('No token available for confirming appointment');
    }
  }*/
  archiveAppointment(rendezvousId: string): void {
    if (this.token) {
      this.patientService.archiveAppointment(rendezvousId).subscribe({
        next: (response: any) => {
          console.log('Rendez-vous archivé avec succès', response);
          this.fetchAllAppointments();
          alert('Rendez-vous archivé avec succès');
        },
        error: (error: any) => {
          console.error('Erreur lors de l\'archivage du rendez-vous', error);
          alert('Erreur lors de l\'archivage du rendez-vous');
        }
      });
    } else {
      console.error('No token available for archiving appointment');
    }
  }

  openEditDoctorModal(doctor: any): void {
    console.log('Doctor data:', doctor);  

    this.selectedDoctor = doctor;
    this.editDoctorForm.patchValue({
      nom: doctor.nom,
      prenom: doctor.prenom,
      phoneNumber: doctor.phoneNumber,
      heuresDebut: doctor.heuresDebut,
      heuresFin: doctor.heuresFin,
      /*joursTravail: doctor.joursTravail,*/
      specialite: doctor.specialite,  
      description: doctor.description 
    });

    const joursTravailArray = this.editDoctorForm.get('joursTravail') as FormArray;
    joursTravailArray.clear();  // on Vide le FormArray existant

    doctor.joursTravail.forEach((day: boolean) => {
      joursTravailArray.push(this.fb.control(day));
    });
    console.log('Form value:', this.editDoctorForm.value);  

    

    const modalElement = this.editDoctorModal.nativeElement;
    const modal = new (window as any).bootstrap.Modal(modalElement);
    modal.show();
  }

  

  upDoctor(): void {
    const doctorData = this.editDoctorForm.value;
    const joursTravailArray = this.editDoctorForm.get('joursTravail') as FormArray;
    doctorData.joursTravail = joursTravailArray.value;

    if (this.selectedDoctor && this.selectedDoctor._id) {
      const doctorId = this.selectedDoctor._id.$oid ? this.selectedDoctor._id.$oid : this.selectedDoctor._id.toString();
      console.log('Doctor ID:', doctorId);  
      console.log('Doctor data to update:', doctorData);  


      this.docteurService.upDoctor(doctorId, doctorData).subscribe({
        next: (response: any) => {
          console.log('Doctor updated successfully', response);
          alert('Informations du docteur mises à jour avec succès');
          const modalElement = this.editDoctorModal.nativeElement;
          const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
          modal.hide();
          this.docteurService.getDocteurs().subscribe(data => {
            this.docteurs = data;
          });
        },
        error: (error: any) => {
          console.error('Error updating doctor', error);
          alert('Erreur lors de la mise à jour des informations du docteur');
        }
      });
    } else {
      console.error('No doctor selected or missing doctor ID');
    }
  }

  //pour se deconnecter
  onLogout() {
    console.log('Déconnexion déclenchée');
    this.authService.logout();
  }
  

  


}
