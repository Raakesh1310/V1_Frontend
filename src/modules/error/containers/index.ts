import { Error401Component } from './error-401/error-401.component';
import { Error404GlitchComponent } from './error-404-glitch/error-404-glitch.component';
import { Error404Component } from './error-404/error-404.component';
import { Error500Component } from './error-500/error-500.component';
import { Error503Component } from './error-503/error-503.component';

export const containers = [
  Error401Component,
  Error404Component,
  Error500Component,
  Error503Component,
  Error404GlitchComponent
];

export * from './error-401/error-401.component';
export * from './error-404/error-404.component';
export * from './error-500/error-500.component';
export * from './error-503/error-503.component';
export * from './error-404-glitch/error-404-glitch.component';
