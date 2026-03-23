import { signal } from "@angular/core";
import { Transformation } from "./transformations.model";
import { OpencvService } from "../../services/opencv.service";

export class OtsuBinarization implements Transformation {
    name = 'Otsu Binarization';
    enabled = signal(true);
    config = {
        maxValue: {
            min: 0,
            max: 255,
            step: 1,
            value: signal(255)
        },
        type: {
            options: ['THRESH_BINARY', 'THRESH_BINARY_INV'],
            value: signal('THRESH_BINARY')
        }
    }

    constructor(private opencv: OpencvService) { }

    apply(src: any, dst: any) {
        const cv = this.opencv.cv();
        if (!cv) {
            return;
        }
        const maxValue = this.config.maxValue.value();
        const type = this.config.type.value() === 'THRESH_BINARY' 
            ? cv.THRESH_BINARY 
            : cv.THRESH_BINARY_INV;
        
        // Otsu's method automatically finds the optimal threshold value
        // We combine THRESH_OTSU with the binary threshold type
        cv.threshold(src, dst, 0, maxValue, type + cv.THRESH_OTSU);
    }

    clone() {
        const clone = new OtsuBinarization(this.opencv);
        clone.config.maxValue.value.set(this.config.maxValue.value());
        clone.config.type.value.set(this.config.type.value());
        return clone;
    }
} 