import { inject, signal } from "@angular/core";
import { Transformation } from "./transformations.model";
import { OpencvService } from "../../services/opencv.service";

export class GaussianBlur implements Transformation {
    name = 'Gaussian Blur';
    enabled = signal(true);
    config = {
        kernelSize: {
            min: 3,
            max: 20,
            step: 2,
            value: signal(3)
        },
        sigmaX: {
            min: 0,
            max: 10,
            step: 0.5,
            value: signal(0)
        },
        sigmaY: {
            min: 0,
            max: 10,
            step: 0.5,
            value: signal(0)
        },
        borderType: {
            options: ['BORDER_DEFAULT', 'BORDER_REPLICATE', 'BORDER_REFLECT', 'BORDER_WRAP'],
            value: signal('BORDER_DEFAULT')
        }
    }

    constructor(private opencv: OpencvService) { 
        
    }

    apply (src: any, dst: any) {
        //  cv.GaussianBlur (src, dst, ksize, sigmaX, sigmaY = 0, borderType = cv.BORDER_DEFAULT)
        const cv = this.opencv.cv();
        if (!cv) {
            return;
        }
        let borderType;
        switch (this.config.borderType.value()) {
            case 'BORDER_DEFAULT':
                borderType = cv.BORDER_DEFAULT;
                break;
            case 'BORDER_REPLICATE':
                borderType = cv.BORDER_REPLICATE;
                break;
            case 'BORDER_REFLECT':
                borderType = cv.BORDER_REFLECT;
                break;
            case 'BORDER_WRAP':
                borderType = cv.BORDER_WRAP;
                break;
            default:
                borderType = cv.BORDER_DEFAULT;
                break;
        }
        const kernelSize = this.config.kernelSize.value();
        const sigmaX = this.config.sigmaX.value();
        const sigmaY = this.config.sigmaY.value();
        cv.GaussianBlur(src, dst, new cv.Size(kernelSize, kernelSize), sigmaX, sigmaY, borderType);
    }

    clone() {
        // Create a new instance but don't initialize the cv property yet
        const clone = new GaussianBlur(this.opencv);
        
        // Copy the configuration values
        clone.config.kernelSize.value.set(this.config.kernelSize.value());
        clone.config.sigmaX.value.set(this.config.sigmaX.value());
        clone.config.sigmaY.value.set(this.config.sigmaY.value());
        clone.config.borderType.value.set(this.config.borderType.value());
        
        return clone;
    }
}