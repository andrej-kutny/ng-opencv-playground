import { signal } from "@angular/core";
import { Transformation } from "./transformations.model";
import { OpencvService } from "../../services/opencv.service";

export class Threshold implements Transformation {
    name = 'Threshold';
    enabled = signal(true);
    config = {
        thresh: {
            min: 0,
            max: 255,
            step: 1,
            value: signal(127)
        },
        maxval: {
            min: 0,
            max: 255,
            step: 1,
            value: signal(255)
        },
        type: {
            options: ['THRESH_BINARY', 'THRESH_BINARY_INV', 'THRESH_TRUNC', 'THRESH_TOZERO', 'THRESH_TOZERO_INV'],
            value: signal('THRESH_BINARY')
        }
    }

    constructor(private opencv: OpencvService) { }
    apply (src: any, dst: any) {
        const cv = this.opencv.cv();
        if (!cv) {
            return;
        }
        const thresh = this.config.thresh.value();
        const maxval = this.config.maxval.value();
        const type = this.config.type.value();
        cv.threshold(src, dst, thresh, maxval, type);
    };

    clone () {
        let clone = new Threshold(this.opencv);
        clone.config.thresh.value.set(this.config.thresh.value());
        clone.config.maxval.value.set(this.config.maxval.value());
        clone.config.type.value.set(this.config.type.value());
        return clone;
    };
    
}