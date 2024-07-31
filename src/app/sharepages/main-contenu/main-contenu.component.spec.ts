import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainContenuComponent } from './main-contenu.component';

describe('MainContenuComponent', () => {
  let component: MainContenuComponent;
  let fixture: ComponentFixture<MainContenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MainContenuComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MainContenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
