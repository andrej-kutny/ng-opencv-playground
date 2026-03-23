import { computed, effect, signal } from "@angular/core";
import { Transformation } from "./transformations.model";
import { OpencvService } from "../../services/opencv.service";

export class Contrast implements Transformation {
    name = 'Contrast';
    enabled = signal(true);
    config = {
        value: {
            min: -100,
            max: 300,
            step: 1,
            value: signal(0)
        }
    }

    active = computed(() => this.config.value.value() !== 0);
    constructor(private opencv: OpencvService) { }
    
    apply(src: any, dst: any) {
        const cv = this.opencv.cv();
        if (!cv || !this.active()) {
            return;
        }
        const value = 1. + Math.abs(this.config.value.value()) / 100;
        
        // Determine the appropriate floating point type based on channels
        const ch = src.channels();
        const floatType = ch === 1 ? cv.CV_32FC1 : 
                         ch === 3 ? cv.CV_32FC3 : cv.CV_32FC4;
        
        // Create a Mat with constant value for multiplication
        const multiplyMat = new cv.Mat(src.rows, src.cols, floatType, new cv.Scalar(value, value, value, value));
        
        // Convert src to floating point format
        const srcFloat = new cv.Mat();
        src.convertTo(srcFloat, floatType);
        
        cv.multiply(srcFloat, multiplyMat, srcFloat);
        
        // Convert back to original format
        srcFloat.convertTo(dst, src.type());
        
        // Clean up temporary Mats
        multiplyMat.delete();
        srcFloat.delete();
    }

    clone() {
        const clone = new Contrast(this.opencv);
        clone.config.value.value.set(this.config.value.value());
        return clone;
    }
}