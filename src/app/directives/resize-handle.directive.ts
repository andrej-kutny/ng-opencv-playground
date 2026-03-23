import { Directive, ElementRef, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output } from '@angular/core';

export type ResizeDirection = 'horizontal' | 'vertical';

@Directive({
  selector: '[appResizeHandle]',
  standalone: true,
})
export class ResizeHandleDirective implements OnInit, OnDestroy {
  @Input('appResizeHandle') direction: ResizeDirection = 'vertical';
  @Output() resized = new EventEmitter<number>();

  private dragging = false;
  private startPos = 0;
  private startSize = 0;

  private mouseMoveHandler = (e: MouseEvent) => this.onMouseMove(e);
  private mouseUpHandler = () => this.onMouseUp();

  constructor(
    private el: ElementRef<HTMLElement>,
    private zone: NgZone
  ) {}

  ngOnInit() {
    const handle = this.el.nativeElement;
    handle.style.cursor = this.direction === 'vertical' ? 'row-resize' : 'col-resize';
    handle.style.userSelect = 'none';

    handle.addEventListener('mousedown', (e: MouseEvent) => {
      e.preventDefault();
      this.dragging = true;

      const target = this.getTargetElement();
      if (!target) return;

      this.startPos = this.direction === 'vertical' ? e.clientY : e.clientX;
      this.startSize = this.direction === 'vertical' ? target.getBoundingClientRect().height : target.getBoundingClientRect().width;

      this.zone.runOutsideAngular(() => {
        document.addEventListener('mousemove', this.mouseMoveHandler);
        document.addEventListener('mouseup', this.mouseUpHandler);
      });

      document.body.style.cursor = this.direction === 'vertical' ? 'row-resize' : 'col-resize';
      document.body.style.userSelect = 'none';
    });
  }

  ngOnDestroy() {
    document.removeEventListener('mousemove', this.mouseMoveHandler);
    document.removeEventListener('mouseup', this.mouseUpHandler);
  }

  private getTargetElement(): HTMLElement | null {
    return this.el.nativeElement.previousElementSibling as HTMLElement | null;
  }

  private onMouseMove(e: MouseEvent) {
    if (!this.dragging) return;

    const currentPos = this.direction === 'vertical' ? e.clientY : e.clientX;
    const delta = currentPos - this.startPos;
    const newSize = Math.max(50, this.startSize + delta);

    const target = this.getTargetElement();
    if (!target) return;

    if (this.direction === 'vertical') {
      target.style.height = newSize + 'px';
      target.style.maxHeight = 'none';
      target.style.flex = 'none';
    } else {
      target.style.width = newSize + 'px';
      target.style.flex = 'none';
    }

    this.zone.run(() => this.resized.emit(newSize));
  }

  private onMouseUp() {
    this.dragging = false;
    document.removeEventListener('mousemove', this.mouseMoveHandler);
    document.removeEventListener('mouseup', this.mouseUpHandler);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }
}
