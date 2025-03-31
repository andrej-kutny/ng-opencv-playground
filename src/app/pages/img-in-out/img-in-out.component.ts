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
              this.opencv.src.update(original => {
                original?.delete();
                return mat;
              });
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
    
    // Get cursor position
    const [clientX, clientY] = (e instanceof MouseEvent) ? 
        [e.clientX, e.clientY] : 
        [e.touches[0].clientX, e.touches[0].clientY];

    // Calculate the actual image dimensions and position within the canvas container
    const imageAspectRatio = canvas.width / canvas.height;
    const containerAspectRatio = rect.width / rect.height;
    
    let imageWidth, imageHeight, imageX, imageY;
    
    if (imageAspectRatio > containerAspectRatio) {
        // Image is constrained by width
        imageWidth = rect.width;
        imageHeight = rect.width / imageAspectRatio;
        imageX = 0;
        imageY = (rect.height - imageHeight) / 2;
    } else {
        // Image is constrained by height
        imageHeight = rect.height;
        imageWidth = rect.height * imageAspectRatio;
        imageX = (rect.width - imageWidth) / 2;
        imageY = 0;
    }

    // Get cursor position relative to the actual image
    const relativeX = clientX - rect.left - imageX;
    const relativeY = clientY - rect.top - imageY;

    // Check if cursor is within image bounds
    if (relativeX < 0 || relativeX > imageWidth || relativeY < 0 || relativeY > imageHeight) {
        magnifier.style.display = 'none';
        canvas.style.cursor = 'default';
        return;
    }
    canvas.style.cursor = 'none';

    // Calculate background position based on relative position within the actual image
    const bgX = (relativeX / imageWidth) * canvas.width;
    const bgY = (relativeY / imageHeight) * canvas.height;
    
    magnifier.style.left = Math.round(clientX - magnifier.clientWidth / 2) + "px";
    magnifier.style.top = Math.round(clientY - magnifier.clientHeight / 2) + "px";
    
    magnifier.style.display = 'inline';    
    const zoomFactor = this.zoomFactor();
    
    // Calculate maximum background positions
    const maxBgX = (canvas.width * zoomFactor) - magnifier.clientWidth;
    const maxBgY = (canvas.height * zoomFactor) - magnifier.clientHeight;
    
    // Ensure background position values stay within bounds (not negative and not exceeding max)
    const bgPosX = Math.min(maxBgX, Math.max(0, (bgX * zoomFactor) - magnifier.clientWidth / 2));
    const bgPosY = Math.min(maxBgY, Math.max(0, (bgY * zoomFactor) - magnifier.clientHeight / 2));
    
    magnifier.style.backgroundPosition = `-${bgPosX}px -${bgPosY}px`;
  }

  public leaveMagnifier() {
    const magnifier = document.getElementById('dst-magnifier') as HTMLDivElement;
    magnifier.style.display = 'none';
  }
}
