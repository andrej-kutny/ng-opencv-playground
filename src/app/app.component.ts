import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ImgInOutComponent } from "./pages/img-in-out/img-in-out.component";
import { TransformationsComponent } from "./pages/transformations/transformations.component";
import { ResizeHandleDirective } from './directives/resize-handle.directive';
import { StorageService } from './services/storage.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, ImgInOutComponent, TransformationsComponent, ResizeHandleDirective],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'ng-opencv-playground';
  imgSectionHeight: number | undefined;

  private storage = inject(StorageService);

  ngOnInit() {
    const layout = this.storage.loadLayout();
    this.imgSectionHeight = layout.imgSectionHeight;
  }

  onImgSectionResized(height: number) {
    this.imgSectionHeight = height;
    this.storage.saveLayout({ imgSectionHeight: height });
  }
}
