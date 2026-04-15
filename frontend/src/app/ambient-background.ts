import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

type BalloonConfig = {
  x: number;
  y: number;
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
        [style.top.%]="item.y"
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
      y: 78,
      size: 92,
      duration: 18,
      delay: -2,
      sway: 24,
      swayDuration: 5.8,
      color: 'rgba(232, 95, 107, 0.82)',
      opacity: 0.96,
      stringHeight: 142,
      blur: 0,
      mobileHidden: false,
    },
    {
      x: 14,
      y: 70,
      size: 86,
      duration: 17,
      delay: -11,
      sway: 20,
      swayDuration: 5.2,
      color: 'rgba(30, 198, 176, 0.8)',
      opacity: 0.95,
      stringHeight: 136,
      blur: 0,
      mobileHidden: true,
    },
    {
      x: 24,
      y: 83,
      size: 104,
      duration: 21,
      delay: -18,
      sway: 28,
      swayDuration: 6.6,
      color: 'rgba(63, 149, 204, 0.84)',
      opacity: 0.95,
      stringHeight: 160,
      blur: 0,
      mobileHidden: false,
    },
    {
      x: 38,
      y: 74,
      size: 80,
      duration: 17,
      delay: -9,
      sway: 18,
      swayDuration: 5.1,
      color: 'rgba(248, 200, 95, 0.84)',
      opacity: 0.95,
      stringHeight: 130,
      blur: 0,
      mobileHidden: false,
    },
    {
      x: 50,
      y: 79,
      size: 98,
      duration: 19,
      delay: -22,
      sway: 22,
      swayDuration: 5.9,
      color: 'rgba(234, 147, 184, 0.84)',
      opacity: 0.95,
      stringHeight: 150,
      blur: 0,
      mobileHidden: true,
    },
    {
      x: 62,
      y: 72,
      size: 88,
      duration: 16,
      delay: -4,
      sway: 20,
      swayDuration: 5.4,
      color: 'rgba(91, 198, 216, 0.84)',
      opacity: 0.95,
      stringHeight: 140,
      blur: 0,
      mobileHidden: false,
    },
    {
      x: 74,
      y: 84,
      size: 108,
      duration: 22,
      delay: -15,
      sway: 24,
      swayDuration: 6.8,
      color: 'rgba(255, 183, 60, 0.84)',
      opacity: 0.94,
      stringHeight: 166,
      blur: 1,
      mobileHidden: false,
    },
    {
      x: 84,
      y: 68,
      size: 94,
      duration: 18,
      delay: -25,
      sway: 26,
      swayDuration: 6.1,
      color: 'rgba(91, 166, 216, 0.86)',
      opacity: 0.95,
      stringHeight: 150,
      blur: 0,
      mobileHidden: true,
    },
    {
      x: 93,
      y: 77,
      size: 78,
      duration: 16,
      delay: -7,
      sway: 16,
      swayDuration: 5,
      color: 'rgba(232, 95, 107, 0.8)',
      opacity: 0.93,
      stringHeight: 124,
      blur: 0,
      mobileHidden: false,
    },
  ];
}
