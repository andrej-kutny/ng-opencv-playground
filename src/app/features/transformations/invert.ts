import { signal } from "@angular/core";
import { Transformation } from "./transformations.model";
import { OpencvService } from "../../services/opencv.service";

export class Invert implements Transformation {
    name = 'Invert';
    enabled = signal(true);
    config = {};

    constructor(private opencv: OpencvService) { }

    apply(src: any, dst: any) {
        const cv = this.opencv.cv();
        if (!cv) {
            return;
        }

        cv.bitwise_not(src, dst);
    }

    clone() {
        return new Invert(this.opencv);
    }
}