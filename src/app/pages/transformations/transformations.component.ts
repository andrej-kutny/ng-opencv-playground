import { Component, effect, inject, input, output, signal } from '@angular/core';
import { CheckboxField, MinMaxField, OptionsField, Transformation } from '../../features/transformations/transformations.model';
import { OpencvService } from '../../services/opencv.service';
import { GaussianBlur } from '../../features/transformations/gaussian-blur';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Threshold } from '../../features/transformations/threshold';
import { CvtColor } from '../../features/transformations/cvt-color';
import { Laplacian } from '../../features/transformations/laplacian';
import { Erode } from '../../features/transformations/erode';
import { Dilate } from '../../features/transformations/dilate';
import { Invert } from '../../features/transformations/invert';
import { HsvInRange } from '../../features/transformations/hsv-in-range';

@Component({
  selector: 'app-transformations',
  imports: [CommonModule, FormsModule],
  templateUrl: './transformations.component.html',
  styleUrl: './transformations.component.scss'
})
export class TransformationsComponent {
  private opencv = inject(OpencvService);
  public readonly availableTransformations: Transformation[] = [
    new GaussianBlur(this.opencv), 
    new Threshold(this.opencv), 
    new CvtColor(this.opencv), 
    new Laplacian(this.opencv), 
    new Erode(this.opencv), 
    new Dilate(this.opencv),
    new Invert(this.opencv),
    new HsvInRange(this.opencv),
  ];
  
  private _transformations = signal<Transformation[]>([]);

  public addingIndex = signal<number>(0);
  public addingTransformation = signal<Transformation>(this.availableTransformations[0]);

  constructor() {
    effect(() => {
      const process = () => {
        const cv = this.opencv.cv();
        if (!cv) {
          return;
        }
        const src = this.opencv.src();
        if (!src) {
          return;
        }
        let dst = new cv.Mat();
        src.copyTo(dst);
        const transformations = this.transformations();
        for (const transformation of transformations) {
          for (const [k, v] of Object.entries(transformation.config)) {
            v.value(); // this is just to trigger the effect when the value changes
          }
          if (transformation.enabled()) {
            try {
              transformation.apply(dst, dst);
            } catch (e) {
              console.error(e);
              dst.delete();
              process();
            }
          }
        }
        this.opencv.dst.update(original => {
          original?.delete();
          return dst;
        });
      }
      process();
    });
  }

  get transformations() {
    return this._transformations.asReadonly();
  }

  moveTransformation(index: number, newIndex: number) {
    if (index < 0) {
      index = 0;
    } else if (index >= this._transformations().length) {
      index = this._transformations().length - 1;
    }

    if (newIndex < 0) {
      newIndex = 0;
    } else if (newIndex >= this._transformations().length) {
      newIndex = this._transformations().length - 1;
    }

    if (index === newIndex) {
      return;
    }

    this._transformations.update(transformations => {
      const newArray = [...transformations];
      const transformation = newArray[index];
      newArray.splice(index, 1);
      newArray.splice(newIndex, 0, transformation);
      return newArray;
    });
  }

  removeTransformation(index: number) {
    if (index < 0 || index >= this._transformations().length) {
      return;
    }
    this._transformations.update(transformations => [...transformations.filter((_, i) => i !== index)]);
  }

  addTransformation() {
    const index = this.addingIndex();
    if (index <= 0) {
      this._transformations.update(transformations => [this.addingTransformation().clone(), ...transformations]);
    } else if (index >= this._transformations().length) {
      this._transformations.update(transformations => [...transformations, this.addingTransformation().clone()]);
    } else {
      this._transformations.update(transformations => [...transformations.slice(0, index), this.addingTransformation().clone(), ...transformations.slice(index)]);
    }
  }

  public isMinMaxField(value: any): value is MinMaxField {
    return 'min' in value && 'max' in value && 'step' in value;
  }

  public isOptionsField(value: any): value is OptionsField<any> {
    return 'options' in value;
  }

  public isCheckboxField(value: any): value is CheckboxField {
    return 'checked' in value;
  }

  public updateRangeField(field: MinMaxField, event: Event) {
    field.value.set(Number((event.target as HTMLInputElement).value));
  }
  public updateAddingTransformation($event: Event) {
    const name = ($event.target as HTMLSelectElement).value;
    const transformation = this.availableTransformations.find(t => t.name === name);
    if (transformation) {
      this.addingTransformation.set(transformation);
    }
  } 
}
