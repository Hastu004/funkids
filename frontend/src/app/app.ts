import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AmbientBackground } from './ambient-background';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, AmbientBackground],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
