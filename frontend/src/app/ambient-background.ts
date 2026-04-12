import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, DestroyRef, ElementRef, QueryList, ViewChildren, inject } from '@angular/core';

type BalloonConfig = {
  x: number;
  y: number;
  size: number;
  speed: number;
  sway: number;
  delay: number;
  color: string;
  opacity: number;
  stringHeight: number;
  blur: number;
};

@Component({
  selector: 'app-ambient-background',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ambient-background" aria-hidden="true">
      <div class="ambient-glow ambient-glow--left"></div>
      <div class="ambient-glow ambient-glow--right"></div>

      <div
        #balloon
        class="ambient-balloon"
        *ngFor="let item of balloons; let i = index"
        [style.left.%]="item.x"
        [style.top.%]="item.y"
        [style.width.px]="item.size"
        [style.height.px]="item.size * 1.3"
        [style.--ambient-color]="item.color"
        [style.--ambient-opacity]="item.opacity"
        [style.--ambient-delay.s]="item.delay"
        [style.--ambient-string-height.px]="item.stringHeight"
        [style.--ambient-blur.px]="item.blur"
      >
        <span class="ambient-balloon__halo"></span>
        <span class="ambient-balloon__shine"></span>
        <span class="ambient-balloon__knot"></span>
        <span class="ambient-balloon__string"></span>
      </div>
    </div>
  `,
})
export class AmbientBackground implements AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);

  @ViewChildren('balloon') private readonly balloonElements!: QueryList<ElementRef<HTMLElement>>;

  protected readonly balloons: BalloonConfig[] = [
    { x: 7, y: 74, size: 72, speed: 0.16, sway: 20, delay: 0, color: 'rgba(248, 200, 95, 0.18)', opacity: 0.72, stringHeight: 132, blur: 0 },
    { x: 16, y: 19, size: 86, speed: 0.13, sway: 18, delay: 0.55, color: 'rgba(91, 166, 216, 0.18)', opacity: 0.7, stringHeight: 150, blur: 0 },
    { x: 34, y: 65, size: 60, speed: 0.15, sway: 14, delay: 1.1, color: 'rgba(234, 147, 184, 0.14)', opacity: 0.62, stringHeight: 118, blur: 1 },
    { x: 78, y: 14, size: 92, speed: 0.12, sway: 22, delay: 0.25, color: 'rgba(91, 166, 216, 0.14)', opacity: 0.66, stringHeight: 164, blur: 0 },
    { x: 90, y: 58, size: 74, speed: 0.14, sway: 16, delay: 0.95, color: 'rgba(151, 100, 154, 0.12)', opacity: 0.58, stringHeight: 138, blur: 1 },
    { x: 62, y: 82, size: 56, speed: 0.11, sway: 12, delay: 0.4, color: 'rgba(248, 200, 95, 0.1)', opacity: 0.48, stringHeight: 110, blur: 1 },
  ];

  ngAfterViewInit() {
    const elements = this.balloonElements.toArray().map((item) => item.nativeElement);
    if (!elements.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    let frameId = 0;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = (now - start) / 1000;

      elements.forEach((element, index) => {
        const config = this.balloons[index];
        const floatY = Math.sin(elapsed * config.speed + config.delay) * 22;
        const driftX = Math.cos(elapsed * (config.speed + 0.07) + config.delay) * config.sway;
        const rotate = Math.sin(elapsed * (config.speed + 0.04) + config.delay) * 2.2;
        const scale = 1 + Math.sin(elapsed * (config.speed + 0.015) + config.delay) * 0.018;

        element.style.transform = `translate3d(${driftX}px, ${floatY}px, 0) rotate(${rotate}deg) scale(${scale})`;
      });

      frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);

    this.destroyRef.onDestroy(() => {
      window.cancelAnimationFrame(frameId);
    });
  }
}
