import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AnalysisView } from './analysis-view/analysis-view';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,AnalysisView],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Task-WebAPP');
}
