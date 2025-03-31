import { WritableSignal } from "@angular/core";

export interface TransformationConfigField<T> {
    value: WritableSignal<T>;
}

export interface MinMaxField extends TransformationConfigField<number> {
    min: number;
    max: number;
    step: number;
}

export interface OptionsField<T> extends TransformationConfigField<T> {
    options: T[];
}

export interface CheckboxField extends TransformationConfigField<boolean> { }

export interface Transformation {
    name: string;
    enabled: WritableSignal<boolean>;
    config: {
        [key: string]: TransformationConfigField<any>;
    };
    apply: (src: any, dst: any) => void;
    clone: () => Transformation;
};
