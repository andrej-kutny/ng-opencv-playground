import { CommonModule } from '@angular/common';
import { Component, effect, OnInit, signal, Signal } from '@angular/core';
import { ImgInOutComponent } from "./pages/img-in-out/img-in-out.component";
import { TransformationsComponent } from "./pages/transformations/transformations.component";

@Component({
  selector: 'app-root',
  imports: [CommonModule, ImgInOutComponent, TransformationsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'ng-opencv-playground';

  constructor() {
  }

  ngOnInit() {
    
  }
}
