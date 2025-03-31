import { signal } from "@angular/core";
import { Transformation } from "./transformations.model";
import { OpencvService } from "../../services/opencv.service";

export class Laplacian implements Transformation {
    name = 'Laplacian';
    enabled = signal(true);
    config = {
        ksize: {
            min: 1,
            max: 7,
            step: 2,
            value: signal(1)
        }, 
        scale: {
            min: 1,
            max: 10,
            step: 1,
            value: signal(1)
        },
        delta: {
            min: 0,
            max: 10,
            step: 1,
            value: signal(0)
        },
        borderType: {
            options: ['CV_8U', 'CV_8UC1', 'CV_8UC2', 'CV_8UC3', 'CV_8UC4'],
            value: signal('CV_8U')
        },
        ddepth: {
            options: ['CV_8U', 'CV_8UC1', 'CV_8UC2', 'CV_8UC3', 'CV_8UC4'],
            value: signal('CV_8U')
        }
    }
    
    constructor(private opencv: OpencvService) { }

    getType(key: typeof this.config.borderType.options[number]) {
        const cv = this.opencv.cv();
        if (!cv) {
            return;
        }
        switch (key) {
            case 'CV_8U':
                return cv.CV_8U;
            case 'CV_8UC1':
                return cv.CV_8UC1;
            case 'CV_8UC2':
                return cv.CV_8UC2;
            case 'CV_8UC3':
                return cv.CV_8UC3;
            case 'CV_8UC4':
                return cv.CV_8UC4;
            default:
                return cv.CV_8U;
        }
    }

    apply(src: any, dst: any) {
        const cv = this.opencv.cv();
        if (!cv) {
            return;
        }
        const ksize = this.config.ksize.value();
        const scale = this.config.scale.value();
        const delta = this.config.delta.value();
        const borderType = this.getType(this.config.borderType.value());
        const ddepth = this.getType(this.config.ddepth.value());
        
        cv.Laplacian(src, dst, ddepth, ksize, scale, delta, borderType);
    }

    clone() {
        const clone = new Laplacian(this.opencv);
        clone.config.ksize.value.set(this.config.ksize.value());
        clone.config.scale.value.set(this.config.scale.value());
        clone.config.delta.value.set(this.config.delta.value());
        clone.config.borderType.value.set(this.config.borderType.value());
        clone.config.ddepth.value.set(this.config.ddepth.value());
        return clone;
    }
}