import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-non-trouvee',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './page-non-trouvee.html',
  styleUrls: ['./page-non-trouvee.component.css']
})
export class PageNonTrouveeComponent {}
