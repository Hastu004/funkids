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
  drift: number;
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
        [style.--ambient-duration.s]="16 + item.delay * 2"
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
    { x: 8, y: 76, size: 84, speed: 0.2, sway: 28, delay: 0, color: 'rgba(248, 200, 95, 0.22)', opacity: 0.78, stringHeight: 138, blur: 0, drift: 28 },
    { x: 17, y: 20, size: 96, speed: 0.17, sway: 22, delay: 0.55, color: 'rgba(91, 166, 216, 0.24)', opacity: 0.76, stringHeight: 154, blur: 0, drift: 32 },
    { x: 34, y: 68, size: 68, speed: 0.19, sway: 18, delay: 1.1, color: 'rgba(234, 147, 184, 0.18)', opacity: 0.68, stringHeight: 120, blur: 1, drift: 24 },
    { x: 79, y: 16, size: 104, speed: 0.15, sway: 26, delay: 0.25, color: 'rgba(91, 166, 216, 0.18)', opacity: 0.72, stringHeight: 172, blur: 0, drift: 34 },
    { x: 90, y: 60, size: 82, speed: 0.18, sway: 20, delay: 0.95, color: 'rgba(151, 100, 154, 0.16)', opacity: 0.64, stringHeight: 142, blur: 1, drift: 26 },
    { x: 61, y: 84, size: 62, speed: 0.14, sway: 16, delay: 0.4, color: 'rgba(248, 200, 95, 0.14)', opacity: 0.54, stringHeight: 112, blur: 1, drift: 18 },
  ];

  ngAfterViewInit() {
    const elements = this.balloonElements.toArray().map((item) => item.nativeElement);
    const prefersReducedMotion =
      typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!elements.length || prefersReducedMotion) {
      return;
    }
    let frameId = 0;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = (now - start) / 1000;

      elements.forEach((element, index) => {
        const config = this.balloons[index];
        const floatY = Math.sin(elapsed * config.speed + config.delay) * config.drift;
        const driftX = Math.cos(elapsed * (config.speed + 0.07) + config.delay) * config.sway;
        const rotate = Math.sin(elapsed * (config.speed + 0.04) + config.delay) * 3.4;
        const scale = 1 + Math.sin(elapsed * (config.speed + 0.015) + config.delay) * 0.03;

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
