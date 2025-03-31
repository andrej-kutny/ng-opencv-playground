import { signal } from "@angular/core";
import { Transformation } from "./transformations.model";
import { OpencvService } from "../../services/opencv.service";

export class Erode implements Transformation {
    name = 'Erode';
    enabled = signal(true);
    config = {
        kernel_width: {
            min: 1,
            max: 20,
            step: 2,
            value: signal(3)
        },
        kernel_height : {
            min: 1,
            max: 20,
            step: 2,
            value: signal(3)
        },
        kernel_shape: {
            options: ['CV_SHAPE_RECT', 'CV_SHAPE_CROSS', 'CV_SHAPE_ELLIPSE'],
            value: signal('CV_SHAPE_RECT')
        },
        iterations: {
            min: 1,
            max: 10,
            step: 1,
            value: signal(1)
        },
        anchor_x: {
            min: -10,
            max: 10,
            step: 1,
            value: signal(-1)
        },
        anchor_y: {
            min: -10,
            max: 10,
            step: 1,
            value: signal(-1)
        }
    }

    constructor(private opencv: OpencvService) { }

    getShape(key: typeof this.config.kernel_shape.options[number]) {
        const cv = this.opencv.cv();
        if (!cv) {
            return;
        }
        switch (key) {
            case 'CV_SHAPE_RECT':
                return cv.MORPH_RECT;
            case 'CV_SHAPE_CROSS':
                return cv.MORPH_CROSS;
            case 'CV_SHAPE_ELLIPSE':
                return cv.MORPH_ELLIPSE;
        }
        return cv.MORPH_RECT;
    }
    apply(src: any, dst: any) {
        const cv = this.opencv.cv();
        if (!cv) {
            return;
        }
        const kernel = cv.getStructuringElement(this.getShape(this.config.kernel_shape.value()), new cv.Size(this.config.kernel_width.value(), this.config.kernel_height.value()));
        const iterations = this.config.iterations.value();
        const anchor = new cv.Point(this.config.anchor_x.value(), this.config.anchor_y.value());
        cv.erode(src, dst, kernel, anchor, iterations);
    }

    clone() {
        const clone = new Erode(this.opencv);
        clone.config.kernel_width.value.set(this.config.kernel_width.value());
        clone.config.kernel_height.value.set(this.config.kernel_height.value());
        clone.config.kernel_shape.value.set(this.config.kernel_shape.value());
        clone.config.iterations.value.set(this.config.iterations.value());
        clone.config.anchor_x.value.set(this.config.anchor_x.value());
        clone.config.anchor_y.value.set(this.config.anchor_y.value());
        return clone;
    }
}