import { computed, effect, signal } from "@angular/core";
import { Transformation } from "./transformations.model";
import { OpencvService } from "../../services/opencv.service";

export class Brightness implements Transformation {
    name = 'Brightness';
    enabled = signal(true);
    config = {
        value: {
            min: -255,
            max: 255,
            step: 1,
            value: signal(10)
        }
    }

    active = computed(() => this.config.value.value() !== 0);
    constructor(private opencv: OpencvService) { }

    apply(src: any, dst: any) {
        const cv = this.opencv.cv();
        if (!cv || !this.active()) {
            return;
        }
        const value = this.config.value.value();
        const v = Math.abs(value);
        const addMat = new cv.Mat(src.rows, src.cols, src.type(), new cv.Scalar(v, v, v, v));
        if (value > 0) {
            cv.add(src, addMat, dst);
        } else {
            cv.subtract(src, addMat, dst);
        }
        addMat.delete();
    }
    
    clone() {
        const clone = new Brightness(this.opencv);
        clone.config.value.value.set(this.config.value.value());
        return clone;
    }
}