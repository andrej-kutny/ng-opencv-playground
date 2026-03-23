import { computed, signal } from "@angular/core";
import { Transformation } from "./transformations.model";
import { OpencvService } from "../../services/opencv.service";

export class IntensityClamp implements Transformation {
    name = 'Intensity Clamp';
    enabled = signal(true);
    config = {
        lower: {
            min: 0,
            max: 255,
            step: 1,
            value: signal(0)
        },
        upper: {
            min: 0,
            max: 255,
            step: 1,
            value: signal(255)
        }
    }

    active = computed(() => this.config.lower.value() !== 0 || this.config.upper.value() !== 255);

    constructor(private opencv: OpencvService) { }

    apply(src: any, dst: any) {
        const cv = this.opencv.cv();
        if (!cv || !this.active()) {
            return;
        }
        let lower = this.config.lower.value();
        let upper = this.config.upper.value();

        if (lower >= upper) {
            upper = lower + 1;
        }

        // Clamp: max(lower, min(upper, val))
        const lowerMat = new cv.Mat(src.rows, src.cols, src.type(), new cv.Scalar(lower, lower, lower, lower));
        const upperMat = new cv.Mat(src.rows, src.cols, src.type(), new cv.Scalar(upper, upper, upper, upper));

        cv.max(src, lowerMat, dst);
        cv.min(dst, upperMat, dst);

        // Normalize [lower, upper] -> [0, 255] using convertTo: dst = (src - lower) * (255 / (upper - lower))
        const alpha = 255.0 / (upper - lower);
        const beta = -lower * alpha;
        dst.convertTo(dst, -1, alpha, beta);

        lowerMat.delete();
        upperMat.delete();
    }

    clone() {
        const clone = new IntensityClamp(this.opencv);
        clone.config.lower.value.set(this.config.lower.value());
        clone.config.upper.value.set(this.config.upper.value());
        return clone;
    }
}
