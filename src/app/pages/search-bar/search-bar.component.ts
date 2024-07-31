import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css'
})
export class SearchBarComponent {
  @Output() search = new EventEmitter<string>();

  onSearch(value: string): void {
    console.log('Recherche déclenchée avec la valeur :', value);

    this.search.emit(value);
  }

}
