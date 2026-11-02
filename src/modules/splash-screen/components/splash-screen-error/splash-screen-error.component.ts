import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit
} from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router
} from '@angular/router';

@Component({
  selector: 'sbpro-splash-screen-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './splash-screen-error.component.pug',
  styleUrls: ['splash-screen-error.component.scss']
})
export class SplashScreenErrorComponent implements OnInit {
  @Input() message!: string | null;

  constructor(private activatedRoute: ActivatedRoute, private router: Router) {
    this.message = this.router.getCurrentNavigation()?.extras?.state?.message;
    if (!this.message) {
      // activatedRoute.queryParams
      this.message = activatedRoute.snapshot.queryParamMap.get('message');
    }
  }

  ngOnInit() {}
}
