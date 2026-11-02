import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { UserProfile } from '@modules/profile/models';
import { ProfileAdminService } from '@modules/profile/services';
import { Observable } from 'rxjs/internal/Observable';

@Component({
  selector: 'sbpro-user-kyc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-kyc.component.pug',
  styleUrls: ['user-kyc.component.scss']
})
export class UserKycComponent implements OnInit {
  @Input() pageSize = 10;
  userProfiles$!: Observable<UserProfile[]>;
  total$!: Observable<number>;

  constructor(
    private profileAdminService: ProfileAdminService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.profileAdminService.pageSize = this.pageSize;
    this.userProfiles$ = this.profileAdminService.userProflies$;
    this.total$ = this.profileAdminService.total$;
    this.loadData();
  }

  loadData() {
    this.profileAdminService.performSearch();
  }

  submitSearchForm() {
    console.log('Submitting Search Form');
    // Reload the data
    this.profileAdminService.retrieveData();
  }

  showDetails(userProflie: UserProfile) {
    // console.log(user);
    // this.userService.userObject = user;
    // this.router.navigate(['/users', {}]);
    this.router.navigateByUrl('/profile/user-kyc-details', {
      state: { profile: userProflie, isUpdate: true }
    });
  }
}
