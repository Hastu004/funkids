import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

type BalloonConfig = {
  x: number;
  size: number;
  duration: number;
  delay: number;
  sway: number;
  swayDuration: number;
  color: string;
  opacity: number;
  stringHeight: number;
  blur: number;
  mobileHidden: boolean;
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
        class="ambient-balloon-rise"
        [class.ambient-balloon-rise--mobile-hidden]="item.mobileHidden"
        *ngFor="let item of balloons"
        [style.left.%]="item.x"
        [style.--ambient-rise-duration.s]="item.duration"
        [style.--ambient-rise-delay.s]="item.delay"
      >
        <div
          class="ambient-balloon-sway"
          [style.--ambient-sway-distance.px]="item.sway"
          [style.--ambient-sway-duration.s]="item.swayDuration"
        >
          <div
            class="ambient-balloon ambient-balloon--stream"
            [style.width.px]="item.size"
            [style.height.px]="item.size * 1.28"
            [style.--ambient-color]="item.color"
            [style.--ambient-opacity]="item.opacity"
            [style.--ambient-string-height.px]="item.stringHeight"
            [style.--ambient-blur.px]="item.blur"
            [style.--ambient-duration.s]="item.swayDuration * 1.5"
          >
            <span class="ambient-balloon__halo"></span>
            <span class="ambient-balloon__shine"></span>
            <span class="ambient-balloon__knot"></span>
            <span class="ambient-balloon__string"></span>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AmbientBackground {
  protected readonly balloons: BalloonConfig[] = [
    {
      x: 6,
      size: 92,
      duration: 30,
      delay: -2,
      sway: 24,
      swayDuration: 7.8,
      color: 'rgba(255, 90, 85, 0.36)',
      opacity: 0.86,
      stringHeight: 142,
      blur: 0,
      mobileHidden: false,
    },
    {
      x: 14,
      size: 86,
      duration: 27,
      delay: -11,
      sway: 20,
      swayDuration: 7.2,
      color: 'rgba(36, 192, 176, 0.32)',
      opacity: 0.82,
      stringHeight: 136,
      blur: 0,
      mobileHidden: true,
    },
    {
      x: 24,
      size: 104,
      duration: 33,
      delay: -18,
      sway: 28,
      swayDuration: 8.8,
      color: 'rgba(44, 136, 234, 0.34)',
      opacity: 0.82,
      stringHeight: 160,
      blur: 0,
      mobileHidden: false,
    },
    {
      x: 38,
      size: 80,
      duration: 29,
      delay: -9,
      sway: 18,
      swayDuration: 7.1,
      color: 'rgba(255, 200, 39, 0.34)',
      opacity: 0.8,
      stringHeight: 130,
      blur: 0,
      mobileHidden: false,
    },
    {
      x: 50,
      size: 98,
      duration: 31,
      delay: -22,
      sway: 22,
      swayDuration: 8.1,
      color: 'rgba(249, 64, 154, 0.33)',
      opacity: 0.8,
      stringHeight: 150,
      blur: 0,
      mobileHidden: true,
    },
    {
      x: 62,
      size: 88,
      duration: 28,
      delay: -4,
      sway: 20,
      swayDuration: 7.5,
      color: 'rgba(36, 192, 176, 0.34)',
      opacity: 0.83,
      stringHeight: 140,
      blur: 0,
      mobileHidden: false,
    },
    {
      x: 74,
      size: 108,
      duration: 34,
      delay: -15,
      sway: 24,
      swayDuration: 9.2,
      color: 'rgba(255, 200, 39, 0.3)',
      opacity: 0.8,
      stringHeight: 166,
      blur: 1,
      mobileHidden: false,
    },
    {
      x: 84,
      size: 94,
      duration: 30,
      delay: -25,
      sway: 26,
      swayDuration: 8.5,
      color: 'rgba(44, 136, 234, 0.34)',
      opacity: 0.82,
      stringHeight: 150,
      blur: 0,
      mobileHidden: true,
    },
    {
      x: 93,
      size: 78,
      duration: 26,
      delay: -7,
      sway: 16,
      swayDuration: 6.8,
      color: 'rgba(255, 90, 85, 0.3)',
      opacity: 0.76,
      stringHeight: 124,
      blur: 0,
      mobileHidden: false,
    },
  ];
}
