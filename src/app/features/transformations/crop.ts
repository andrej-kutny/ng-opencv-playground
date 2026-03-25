import { computed, signal } from "@angular/core";
import { Transformation } from "./transformations.model";
import { OpencvService } from "../../services/opencv.service";

export class Crop implements Transformation {
    name = 'Crop';
    enabled = signal(true);
    config = {
        left: {
            min: 0,
            max: 100,
            step: 1,
            value: signal(100)
        },
        right: {
            min: 0,
            max: 100,
            step: 1,
            value: signal(100)
        },
        top: {
            min: 0,
            max: 100,
            step: 1,
            value: signal(100)
        },
        bottom: {
            min: 0,
            max: 100,
            step: 1,
            value: signal(100)
        },
        leftToRight: {
            checked: true,
            value: signal(true)
        },
        topToBottom: {
            checked: true,
            value: signal(true)
        }
    }

    active = computed(() =>
        this.config.left.value() !== 100 ||
        this.config.right.value() !== 100 ||
        this.config.top.value() !== 100 ||
        this.config.bottom.value() !== 100
    );

    constructor(private opencv: OpencvService) { }

    apply(src: any, dst: any) {
        const cv = this.opencv.cv();
        if (!cv || !this.active()) {
            return;
        }

        const width = src.cols;
        const height = src.rows;

        const leftPct = this.config.left.value() / 100;
        const rightPct = this.config.right.value() / 100;
        const topPct = this.config.top.value() / 100;
        const bottomPct = this.config.bottom.value() / 100;
        const ltr = this.config.leftToRight.value();
        const ttb = this.config.topToBottom.value();

        let x0: number, x1: number;
        if (ltr) {
            // left first, then right: left=50 keeps left 50% [0, w*0.5],
            // then right=50 keeps right 50% of that [w*0.25, w*0.5]
            x0 = 0;
            x1 = width * leftPct;
            const regionWidth = x1 - x0;
            x0 = x1 - regionWidth * rightPct;
        } else {
            // right first, then left: right=50 keeps right 50% [w*0.5, w],
            // then left=50 keeps left 50% of that [w*0.5, w*0.75]
            x0 = width * (1 - rightPct);
            x1 = width;
            const regionWidth = x1 - x0;
            x1 = x0 + regionWidth * leftPct;
        }

        let y0: number, y1: number;
        if (ttb) {
            // top first, then bottom
            y0 = 0;
            y1 = height * topPct;
            const regionHeight = y1 - y0;
            y0 = y1 - regionHeight * bottomPct;
        } else {
            // bottom first, then top
            y0 = height * (1 - bottomPct);
            y1 = height;
            const regionHeight = y1 - y0;
            y1 = y0 + regionHeight * topPct;
        }

        // Clamp to valid pixel range
        x0 = Math.max(0, Math.round(x0));
        x1 = Math.min(width, Math.round(x1));
        y0 = Math.max(0, Math.round(y0));
        y1 = Math.min(height, Math.round(y1));

        if (x1 <= x0 || y1 <= y0) {
            return;
        }

        const rect = new cv.Rect(x0, y0, x1 - x0, y1 - y0);
        const cropped = src.roi(rect);
        cropped.copyTo(dst);
        cropped.delete();
    }

    clone() {
        const clone = new Crop(this.opencv);
        clone.config.left.value.set(this.config.left.value());
        clone.config.right.value.set(this.config.right.value());
        clone.config.top.value.set(this.config.top.value());
        clone.config.bottom.value.set(this.config.bottom.value());
        clone.config.leftToRight.value.set(this.config.leftToRight.value());
        clone.config.topToBottom.value.set(this.config.topToBottom.value());
        return clone;
    }
}
