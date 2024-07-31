import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email : string = '';
  password : string = '';


  constructor(private auth : AuthService, private snackBar: MatSnackBar, private router: Router) {}

  ngOnInit(): void {
      
  }

  login(){
    if(this.email == ''){
      alert('Renseignez votre email')
      return;
    }

    if(this.password == ''){
      alert('Renseignez votre password')
      return;
    }

    this.auth.login(this.email,this.password);
      this.email = '';
      this.password = '';

  }

}
