import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private token: string | null = null;
  private userId: string | null = null;
  private role: string | null = null;



  constructor() { }
  setToken(token: string): void {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  setUser(userId: string, role: string): void {
    this.userId = userId;
    this.role = role;
  }

  getUserId(): string | null {
    return this.userId;
  }

  getRole(): string | null {
    return this.role;
  }
  
  clearUser(): void {
    this.userId = null;
    this.role = null;

  }
}
