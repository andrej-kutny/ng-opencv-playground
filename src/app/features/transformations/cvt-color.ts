import { inject, signal } from "@angular/core";
import { Transformation } from "./transformations.model";
import { OpencvService } from "../../services/opencv.service";

export class CvtColor implements Transformation {
    name = 'CvtColor';
    enabled = signal(true);
    config = {
        code: {
            options: ['CV_BGR2GRAY', 'CV_BGR2HSV', 'CV_BGR2RGB', 'CV_BGR2YUV', 'CV_GRAY2BGR', 'CV_HSV2BGR', 'CV_RGB2BGR', 'CV_YUV2BGR'],
            value: signal('CV_BGR2GRAY')
        }
    }

    constructor(private opencv: OpencvService) { }

    apply (src: any, dst: any) {
        const cv = this.opencv.cv();
        if (!cv) {
            return;
        }
        const code = this.config.code.value();
        switch (code) {
            case 'CV_BGR2GRAY':
                cv.cvtColor(src, dst, cv.COLOR_BGR2GRAY);
                break;
            case 'CV_BGR2HSV':
                cv.cvtColor(src, dst, cv.COLOR_BGR2HSV);
                break;
            case 'CV_BGR2RGB':
                cv.cvtColor(src, dst, cv.COLOR_BGR2RGB);
                break;
            case 'CV_BGR2YUV':
                cv.cvtColor(src, dst, cv.COLOR_BGR2YUV);
                break;
            case 'CV_GRAY2BGR':
                cv.cvtColor(src, dst, cv.COLOR_GRAY2BGR);
                break;
            case 'CV_HSV2BGR':
                cv.cvtColor(src, dst, cv.COLOR_HSV2BGR);
                break;
            case 'CV_RGB2BGR':
                cv.cvtColor(src, dst, cv.COLOR_RGB2BGR);
                break;
            case 'CV_YUV2BGR':
                cv.cvtColor(src, dst, cv.COLOR_YUV2BGR);
                break;
        }
    }

    clone () {
        let clone = new CvtColor(this.opencv);
        clone.config.code.value.set(this.config.code.value());
        return clone;
    }
}