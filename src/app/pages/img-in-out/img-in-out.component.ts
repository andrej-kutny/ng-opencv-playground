import { Component, effect, input, signal, untracked } from '@angular/core';
import { OpencvService } from '../../services/opencv.service';

@Component({
  selector: 'app-img-in-out',
  imports: [],
  templateUrl: './img-in-out.component.html',
  styleUrl: './img-in-out.component.scss'
})
export class ImgInOutComponent {
  public imageUploaded = signal(false);
  public zoomFactor = signal(2);
  private useMagnifier = false;

  constructor(private opencv: OpencvService) {
    effect(() => {
      const src = this.src();
      const cv = untracked(() => this.opencv.cv());
      const canvas = document.getElementById('image-src-canvas') as HTMLCanvasElement;
      if (src) {
        canvas.width = src.width;
        canvas.height = src.height;
        cv.imshow(canvas, src);
      } else {
        canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
      }
    });

    effect(() => {
      const dst = this.opencv.dst();
      const cv = untracked(() => this.opencv.cv());
      const canvas = document.getElementById('image-dst-canvas') as HTMLCanvasElement;
      const bounds = canvas.getBoundingClientRect();
      if (dst) {
        canvas.width = dst.width;
        canvas.height = dst.height;
        cv.imshow(canvas, dst);
        this.useMagnifier = canvas.width > bounds.width || canvas.height > bounds.height;
      } else {
        canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
        this.useMagnifier = false;
      }

      const magnifier = document.getElementById('dst-magnifier') as HTMLDivElement;
      if (this.useMagnifier) {
        canvas.style.cursor = 'none'; //'crosshair';
        const zoomFactor = this.zoomFactor();
        magnifier.style.backgroundSize = (canvas.width * zoomFactor) + "px " + (canvas.height * zoomFactor) + "px";
        magnifier.style.backgroundImage = `url(${canvas.toDataURL()})`;
      } else {
        canvas.style.cursor = 'default';
        magnifier.style.cursor = 'default';
      }
    });
  }
  onImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      console.log(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Create a canvas to draw the image
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          console.log(canvas);

          // Draw image on canvas
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            // Get image data from canvas
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            console.log(imgData);
            // Convert to cv.Mat
            const mat = this.opencv.cv().matFromImageData(imgData);
            if (mat) {
              this.opencv.src.set(mat);
              this.imageUploaded.set(true);
            }
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
  
  public get src() {
    return this.opencv.src.asReadonly();
  }

  public clearImage() {
    console.log('clearImage');
    this.opencv.src.set(null);
  }

  public moveMagnifier(e: MouseEvent | TouchEvent) {
    e.preventDefault();

    if (!this.useMagnifier) {
      return;
    }
    
    const canvas = e.target as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();

    const magnifier = document.getElementById('dst-magnifier') as HTMLDivElement;
    const [x, y] = (e instanceof MouseEvent) ? [e.clientX, e.clientY] : [e.touches[0].clientX, e.touches[0].clientY];

    // Update background position based on cursor position
    const bgX = x * (canvas.width / rect.width);
    const bgY = y * (canvas.height / rect.height);
    
    magnifier.style.left = Math.round(x - magnifier.clientWidth / 2) + "px";
    magnifier.style.top = Math.round(y - magnifier.clientHeight / 2) + "px";
      
    magnifier.style.display = 'inline';    
    const zoomFactor = this.zoomFactor();
    magnifier.style.backgroundPosition = `-${(bgX * zoomFactor) - magnifier.clientWidth / 2}px -${(bgY * zoomFactor) - magnifier.clientHeight / 2}px`;
  }

  public leaveMagnifier() {
    const magnifier = document.getElementById('dst-magnifier') as HTMLDivElement;
    magnifier.style.display = 'none';
  }
}
