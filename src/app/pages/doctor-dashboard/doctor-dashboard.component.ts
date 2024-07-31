import { Component, OnInit, ViewChild, ElementRef  } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { PatientService } from '../../services/patient.service';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';
import { StateService } from '../../services/state.service';


@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './doctor-dashboard.component.html',
  styleUrl: './doctor-dashboard.component.css'
})
export class DoctorDashboardComponent implements OnInit {
  activeTab: string = 'listepatients';  
  message: any = null;  
  imageUrl: string | ArrayBuffer | null = null;
  token: string = ''; 
  doctorId: string = ''; 
  patients: any[] = [];
  paginatedPatients: any[] = [];

  notifications: any[] = []; 
  rescheduleForm!: FormGroup;
  consultationForm!: FormGroup;
  workingDays: any[] = [];
  doctorInfo: any; 
  journalEntries: any[] = [];
  selectedPatientId: string = '';

  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 1;
  pages: number[] = [];


  selectedRendezvousId: string = '';
  @ViewChild('rescheduleModal', { static: true }) rescheduleModal!: ElementRef;
  @ViewChild('consultationModal', { static: true }) consultationModal!: ElementRef;
  @ViewChild('journalModal', { static: true }) journalModal!: ElementRef;

  doctorDetailsForm!: FormGroup;
  daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  constructor(private fb: FormBuilder,
     private userService: UserService,
     private patientService: PatientService,
     private authService: AuthService,
     private socketService: SocketService,
     private stateService: StateService

    ) {this.socketService.notification.subscribe((notification: any) => {
      this.notifications.push(notification);
    });}

  ngOnInit(): void{
    this.initializeForm();
    this.initializeConsultationForm();
    this.fetchDoctorInfo();

    


    const token = this.stateService.getToken();
    const doctorId = this.stateService.getUserId();

    if (token && doctorId) {
      this.token = token;
      this.doctorId = doctorId;
      console.log('Recovered Doctor ID:', this.doctorId);
      this.fetchAppointments();
    } else {
      console.error('Token or Doctor ID not available');
    }

    

    console.log('Doctor Dashboard Initialized');
    this.socketService.notification.subscribe((data: any) => {
      console.log('Notification received:', data);
      this.notifications.push(data);
    });

    this.rescheduleForm = this.fb.group({
      newDate: ['', Validators.required],
      newStartTime: ['', Validators.required],
      newEndTime: ['', Validators.required]
    });

  }

  fetchDoctorInfo(): void {
    this.userService.getDoctorInfo().subscribe({
      next: (data: any) => {
        this.doctorInfo = data;
        this.workingDays = this.daysOfWeek.filter((day, index) => data.joursTravail[index]);
      },
      error: error => {
        console.error('Error fetching doctor info:', error);
      }
    });
  }

  

  


  
  initializeForm(): void {
    this.doctorDetailsForm = this.fb.group({
      joursTravail: this.buildDaysControls(),
      heuresDebut: [''],
      heuresFin: [''],
      description: ['']
    });
  }
  
  

  initializeConsultationForm(): void {
    this.consultationForm = this.fb.group({
      rendezvous_id: [''],
      diagnostics: ['', Validators.required],
      prescriptions: ['', Validators.required],
      advice: ['', Validators.required],
      additional_notes: ['']
    });
  }

  fetchAppointments(): void {
    console.log('Fetching appointments'); 

    this.patientService.getPatients(this.doctorId, this.token).subscribe({
      next: (data: any) => {
        console.log('Appointments data received:', data); 
        this.patients = data;
        this.setupPagination();
        console.log('Patients:', this.patients);
      console.log('Total pages:', this.totalPages);
      console.log('Paginated Patients:', this.paginatedPatients);

      },
      error: (error) => {
        console.error('Error fetching appointments', error);
      }
    });
  }

  setupPagination(): void {
    this.totalPages = Math.ceil(this.patients.length / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.updatePaginatedPatients();
    console.log('Pagination setup complete:', this.pages);

  }

  updatePaginatedPatients(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    
    this.paginatedPatients = this.patients.slice(startIndex, endIndex);
    console.log('Updated paginated patients:', this.paginatedPatients);

  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePaginatedPatients();
    console.log(`Navigated to page ${page}`);

  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedPatients();
      console.log('Navigated to previous page');

    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedPatients();
      console.log('Navigated to next page');

    }
  }

  

  buildDaysControls(): FormArray {
    const controls = this.daysOfWeek.map(day => this.fb.control(false));
    return this.fb.array(controls);
  }

  get joursTravailArray() {
    return this.doctorDetailsForm?.get('joursTravail') as FormArray;
  }

  onSubmit(): void {
    if (this.doctorDetailsForm?.valid) {
      console.log('Formulaire soumis:', this.doctorDetailsForm.value.joursTravail); 

      this.userService.updateDoctorDetails(this.doctorDetailsForm.value).subscribe({
        next: response => console.log('Mise à jour réussie', response),
        error: error => console.error('Erreur lors de la mise à jour', error)
      });
    }
  }


  openTab(tab: string): void {
    this.activeTab = tab;
  }

  /* Pour patient */
  onCancel(rendezvousId: string): void {
    this.patientService.cancelAppointment(rendezvousId, this.token).subscribe({
      next: (response: any) => {
        console.log('Appointment cancelled successfully', response);
        this.fetchAppointments();
        alert('Rendez-vous annulé avec succès');

      },
      error: (error: any) => {
        console.error('Error cancelling appointment', error);
      }
    });
  }

  onSubmitConsultation(): void {
    if (this.consultationForm.valid) {
      this.consultationForm.patchValue({ rendezvous_id: this.selectedRendezvousId });
      console.log('Consultation Formulaire soumis:', this.consultationForm.value);
      this.patientService.addConsultation(this.consultationForm.value).subscribe({
        next: response => {
          console.log('Consultation ajoutée avec succès', response);
          alert('Consultation ajoutée avec succès');
          this.fetchAppointments(); 
          const modalElement = this.consultationModal.nativeElement;
          const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();
          }
        },
        error: error => {
          console.error('Erreur lors de l\'ajout de la consultation', error);
          alert('Erreur lors de l\'ajout de la consultation');
        }
      });
    }
  }



  onConfirme(rendezvousId: string): void {
    this.patientService.confirmAppointment(rendezvousId, this.token).subscribe({
      next: (response: any) => {
        console.log('Appointment confirmation successfully', response);
        this.fetchAppointments();
        alert('Rendez-vous confirmé avec succès');
      },
      error: (error: any) => {
        console.error('Error confirming appointment', error);
      }
    });
  }

  openConsultationModal(rendezvousId: string): void {
    this.selectedRendezvousId = rendezvousId;
    const modalElement = this.consultationModal.nativeElement;
    const modal = new (window as any).bootstrap.Modal(modalElement);
    modal.show();
  }

  openRescheduleModal(rendezvousId: string): void {
    this.selectedRendezvousId = rendezvousId;
    const modalElement = this.rescheduleModal.nativeElement;
    const modal = new (window as any).bootstrap.Modal(modalElement);
    modal.show();
  }

  rescheduleAppointment(): void {
    const newDate = this.rescheduleForm.get('newDate')?.value;
    const newStartTime = this.rescheduleForm.get('newStartTime')?.value;
    const newEndTime = this.rescheduleForm.get('newEndTime')?.value;

    this.patientService.rescheduleAppointment(this.selectedRendezvousId, newDate, newStartTime, newEndTime)
      .subscribe({
        next: (response: any) => {
          console.log('Rendez-vous décalé avec succès', response);
          alert('Rendez-vous décalé avec succès');
          this.fetchAppointments();
          const modalElement = this.rescheduleModal.nativeElement;
          const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();
          }
        },
        error: (error: any) => {
          console.error('Erreur lors du décalage du rendez-vous', error);
        }
      });
  }

  openJournalModal(patientId: string): void {
    this.selectedPatientId = patientId;
    this.patientService.getPatientJournal(patientId).subscribe({
      next: (data: any) => {
        console.log("Journal entries received: ", data.entries);

        this.journalEntries = data.entries;
        const modalElement = this.journalModal.nativeElement;
        const modal = new (window as any).bootstrap.Modal(modalElement);
        modal.show();
      },
      error: (error) => {
        console.error('Error fetching journal entries', error);
      }
    });
  }

  downloadJournal(): void {
    this.patientService.downloadPatientJournal(this.selectedPatientId).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'journal.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    });
  }

  //mettre photo de profile
  uploadFile(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageUrl = e.target.result;  
      };
      reader.readAsDataURL(file);
      this.userService.uploadImage(file).then(url => {
        console.log('Image URL:', url); 
        this.imageUrl = url; 
      }).catch(error => {
        console.error('Error uploading image:', error);
      });
    }
  }

  //pour se deconnecter
  onLogout() {
    console.log('Déconnexion déclenchée'); 
    this.authService.logout();
  }

}
