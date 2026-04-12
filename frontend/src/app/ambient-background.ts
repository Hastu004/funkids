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
        [style.height.px]="item.size * 1.18"
        [style.--ambient-color]="item.color"
        [style.--ambient-opacity]="item.opacity"
        [style.--ambient-delay.s]="item.delay"
      >
        <span class="ambient-balloon__shine"></span>
        <span class="ambient-balloon__string"></span>
      </div>
    </div>
  `,
})
export class AmbientBackground implements AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);

  @ViewChildren('balloon') private readonly balloonElements!: QueryList<ElementRef<HTMLElement>>;

  protected readonly balloons: BalloonConfig[] = [
    { x: 6, y: 72, size: 52, speed: 0.22, sway: 18, delay: 0, color: 'rgba(248, 200, 95, 0.38)', opacity: 0.82 },
    { x: 18, y: 26, size: 62, speed: 0.18, sway: 14, delay: 0.6, color: 'rgba(91, 166, 216, 0.28)', opacity: 0.8 },
    { x: 81, y: 18, size: 72, speed: 0.2, sway: 20, delay: 0.2, color: 'rgba(234, 147, 184, 0.22)', opacity: 0.76 },
    { x: 91, y: 66, size: 58, speed: 0.16, sway: 16, delay: 0.9, color: 'rgba(151, 100, 154, 0.17)', opacity: 0.72 },
    { x: 68, y: 84, size: 48, speed: 0.12, sway: 12, delay: 0.35, color: 'rgba(91, 166, 216, 0.18)', opacity: 0.7 },
  ];

  ngAfterViewInit() {
    const elements = this.balloonElements.toArray().map((item) => item.nativeElement);
    let frameId = 0;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = (now - start) / 1000;

      elements.forEach((element, index) => {
        const config = this.balloons[index];
        const floatY = Math.sin(elapsed * config.speed + config.delay) * 18;
        const driftX = Math.cos(elapsed * (config.speed + 0.07) + config.delay) * config.sway;
        const rotate = Math.sin(elapsed * (config.speed + 0.04) + config.delay) * 2.4;
        const scale = 1 + Math.sin(elapsed * (config.speed + 0.02) + config.delay) * 0.02;

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
