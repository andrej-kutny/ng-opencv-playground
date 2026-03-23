import { computed, signal } from "@angular/core";
import { Transformation } from "./transformations.model";
import { OpencvService } from "../../services/opencv.service";

export class HistogramEqualization implements Transformation {
    name = 'Histogram Equalization';
    enabled = signal(true);
    config = {
        strength: {
            min: -1,
            max: 1,
            step: 0.01,
            value: signal(1.0)
        }
    };
    
    constructor(private opencv: OpencvService) { }

    apply(src: any, dst: any) {
        const cv = this.opencv.cv();
        if (!cv) {
            return;
        }
        
        const strength = this.config.strength.value();
        
        if (src.channels() === 1) {
            // For grayscale images
            this.processGrayscaleImage(cv, src, dst, strength);
        } else {
            // For color images
            const ycrcb = new cv.Mat();
            cv.cvtColor(src, ycrcb, cv.COLOR_BGR2YCrCb);
            
            // Split channels
            const channels = new cv.MatVector();
            cv.split(ycrcb, channels);
            
            // Apply histogram equalization only to the luminance channel (Y)
            const equalized = new cv.Mat();
            this.processGrayscaleImage(cv, channels.get(0), equalized, strength);
            
            // Replace with equalized luminance
            channels.set(0, equalized);
            
            // Merge channels back
            cv.merge(channels, ycrcb);
            
            // Convert back to BGR
            cv.cvtColor(ycrcb, dst, cv.COLOR_YCrCb2BGR);
            
            // Clean up
            ycrcb.delete();
            channels.delete();
            equalized.delete();
        }
    }
    
    private processGrayscaleImage(cv: any, src: any, dst: any, strength: number) {
        if (strength >= 1.) {
            this.processFull(cv, src, dst);
        } else {
            this.processWeighted(cv, src, dst, strength);
        }
    }
    
    private processFull(cv: any, src: any, dst: any) {
        cv.equalizeHist(src, dst);
    }
    
    private processWeighted(cv: any, src: any, dst: any, strength: number) {
        const fullEqualized = new cv.Mat();
        cv.equalizeHist(src, fullEqualized);
        
        if (strength > 0.) {
            // Blend towards equalized image
            cv.addWeighted(src, 1.0 - strength, fullEqualized, strength, 0, dst);
        } else {
            // For negative values, create the opposite effect
            // Instead of blending towards equalization, enhance the difference between src and equalized
            const diff = new cv.Mat();
            cv.subtract(src, fullEqualized, diff);
            cv.addWeighted(src, 1.0, diff, -strength, 0, dst);
            diff.delete();
        }
        
        fullEqualized.delete();
    }
    
    clone() {
        const clone = new HistogramEqualization(this.opencv);
        clone.config.strength.value.set(this.config.strength.value());
        return clone;
    }
}
