import { signal } from "@angular/core";
import { Transformation } from "./transformations.model";
import { OpencvService } from "../../services/opencv.service";

export class HsvInRange implements Transformation {
    name = 'HSV inRange';
    enabled = signal(true);
    config = {
        h_lower: {
            value: signal(0),
            min: 0,
            max: 179,
            step: 1
        },
        h_upper: {
            value: signal(179),
            min: 0,
            max: 179,
            step: 1
        },
        s_lower: {
            value: signal(0),
            min: 0,
            max: 255,
            step: 1
        },
        s_upper: {
            value: signal(255),
            min: 0,
            max: 255,
            step: 1
        },
        v_lower: {
            value: signal(0),
            min: 0,
            max: 255,
            step: 1
        },
        v_upper: {
            value: signal(255),
            min: 0,
            max: 255,
            step: 1
        }
    }
    constructor(private opencv: OpencvService) { }

    apply(src: any, dst: any) {
        const cv = this.opencv.cv();
        if (!cv) {
            return;
        }
        const h_lower = this.config.h_lower.value();
        const h_upper = this.config.h_upper.value();
        const s_lower = this.config.s_lower.value();
        const s_upper = this.config.s_upper.value();
        const v_lower = this.config.v_lower.value();
        const v_upper = this.config.v_upper.value();
        if (h_lower <= h_upper) {
            const lower = new cv.Mat(src.rows, src.cols, src.type(), [h_lower, s_lower, v_lower, 255]);
            const upper = new cv.Mat(src.rows, src.cols, src.type(), [h_upper, s_upper, v_upper, 255]);
            cv.inRange(src, lower, upper, dst);
            lower.delete();
            upper.delete();
        } else {
            let tmp_mat = new cv.Mat();
            const lower1 = new cv.Mat(src.rows, src.cols, src.type(), [h_lower, s_lower, v_lower, 255]);
            const upper1 = new cv.Mat(src.rows, src.cols, src.type(), [179, s_upper, v_upper, 255]);
            cv.inRange(src, lower1, upper1, tmp_mat);
            const lower2 = new cv.Mat(src.rows, src.cols, src.type(), [0, s_lower, v_lower, 255]);
            const upper2 = new cv.Mat(src.rows, src.cols, src.type(), [h_upper, s_upper, v_upper, 255]);
            cv.inRange(src, lower2, upper2, dst);
            cv.bitwise_or(dst, tmp_mat, dst);
            lower1.delete();
            upper1.delete();
            lower2.delete();
            upper2.delete();
            tmp_mat.delete();
        }
    }

    clone() {
        let clone = new HsvInRange(this.opencv);
        clone.config.h_lower.value.set(this.config.h_lower.value());
        clone.config.h_upper.value.set(this.config.h_upper.value());
        clone.config.s_lower.value.set(this.config.s_lower.value());
        clone.config.s_upper.value.set(this.config.s_upper.value());
        clone.config.v_lower.value.set(this.config.v_lower.value());
        clone.config.v_upper.value.set(this.config.v_upper.value());
        return clone;
    }
};