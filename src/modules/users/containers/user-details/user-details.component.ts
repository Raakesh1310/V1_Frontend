import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@modules/auth/services';
import { environment } from 'environments/environment';

@Component({
  selector: 'sbpro-user-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-details.component.pug',
  styleUrls: ['user-details.component.scss']
})
export class UserDetailsComponent implements OnInit {
  userId = '';
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {
    this.activatedRoute.paramMap.subscribe(resp => {
      try {
        if (!resp.get('userId') || resp.get('userId') === '') {
          this.goBack();
        }
        this.userId = resp.get('userId') || '';
      } catch (e) {
        console.error(e);
        this.goBack();
      }
    });
    console.log(this.userId);
  }
  ngOnInit() {}

  goBack() {
    this.router.navigate([environment.urlAdminPrefix + '/all-users']);
  }
}
