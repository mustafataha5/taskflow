import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-not-found',
  styleUrl: './not-found.css',
  templateUrl: './not-found.html',
})
export class NotFound {

  private readonly location = inject(Location);

  goBack(): void {
    this.location.back();
  }
}
