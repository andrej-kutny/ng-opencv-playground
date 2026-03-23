import { signal } from "@angular/core";
import { Transformation } from "./transformations.model";
import { OpencvService } from "../../services/opencv.service";

export class AdaptiveThreshold implements Transformation {
    name = 'Adaptive Threshold';
    enabled = signal(true);
    config = {
        maxValue: {
            min: 0,
            max: 255,
            step: 1,
            value: signal(255)
        },
        adaptiveMethod: {
            options: ['ADAPTIVE_THRESH_MEAN_C', 'ADAPTIVE_THRESH_GAUSSIAN_C'],
            value: signal('ADAPTIVE_THRESH_GAUSSIAN_C')
        },
        thresholdType: {
            options: ['THRESH_BINARY', 'THRESH_BINARY_INV'],
            value: signal('THRESH_BINARY')
        },
        blockSize: {
            min: 3,
            max: 99,
            step: 2,
            value: signal(11)
        },
        C: {
            min: -50,
            max: 50,
            step: 1,
            value: signal(2)
        }
    }

    constructor(private opencv: OpencvService) { }

    apply(src: any, dst: any) {
        const cv = this.opencv.cv();
        if (!cv) {
            return;
        }
        const maxValue = this.config.maxValue.value();
        const adaptiveMethod = this.config.adaptiveMethod.value() === 'ADAPTIVE_THRESH_MEAN_C' 
            ? cv.ADAPTIVE_THRESH_MEAN_C 
            : cv.ADAPTIVE_THRESH_GAUSSIAN_C;
        const thresholdType = this.config.thresholdType.value() === 'THRESH_BINARY' 
            ? cv.THRESH_BINARY 
            : cv.THRESH_BINARY_INV;
        const blockSize = this.config.blockSize.value();
        const C = this.config.C.value();

        cv.adaptiveThreshold(src, dst, maxValue, adaptiveMethod, thresholdType, blockSize, C);
    }

    clone() {
        const clone = new AdaptiveThreshold(this.opencv);
        clone.config.maxValue.value.set(this.config.maxValue.value());
        clone.config.adaptiveMethod.value.set(this.config.adaptiveMethod.value());
        clone.config.thresholdType.value.set(this.config.thresholdType.value());
        clone.config.blockSize.value.set(this.config.blockSize.value());
        clone.config.C.value.set(this.config.C.value());
        return clone;
    }
} 