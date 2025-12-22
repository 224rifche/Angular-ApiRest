import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pied-de-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './pied-de-page.html',
  styleUrls: ['./pied-de-page.css']
})
export class PiedDePageComponent {
  currentYear: number = new Date().getFullYear();
}
