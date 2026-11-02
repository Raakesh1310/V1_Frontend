import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SplashScreenDataModel } from '@modules/splash-screen/models/splash-screen-data.model';

import { environment } from '../../../../environments/environment';

@Component({
  selector: 'sbpro-splash-screen-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './splash-screen-page.component.pug',
  styleUrls: ['splash-screen-page.component.scss']
})
export class SplashScreenPageComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    /**
     * Redirect to the Url
     * from environment
     */
    this.handleRedirect();
  }

  handleRedirect() {
    if (!environment.defaultUrl) {
      this.router.navigate(['/start/error'], {
        replaceUrl: true,
        state: {
          message: 'No Default Url found in environment file'
        } as SplashScreenDataModel
      });
      return;
    }

    this.router.navigate([environment.defaultUrl], { replaceUrl: true });
  }
}
