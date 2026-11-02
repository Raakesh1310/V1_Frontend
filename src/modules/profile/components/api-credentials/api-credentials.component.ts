import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { AuthService } from '@modules/auth/services';

@Component({
  selector: 'sbpro-api-credentials',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './api-credentials.component.pug',
  styleUrls: ['api-credentials.component.scss']
})
export class ApiCredentialsComponent implements OnInit {
  apiCredentialPresent = false;
  apiKey!: string;
  apiSecret!: string;
  credentialId!: string;

  constructor(
    private userService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.getCredentials();
  }

  getCredentials() {
    this.userService.getApiCredentials().subscribe(resp => {
      if (resp.success) {
        this.apiCredentialPresent = true;
        this.apiKey = resp.result.apiKey;
        this.apiSecret = resp.result.apiSecret;
        this.credentialId = resp.result.credentialId;
        this.cdr.detectChanges();
      }
    });
  }

  generateCredentials() {
    this.userService.generateApiCredentials().subscribe(resp => {
      if (resp.success) {
        this.apiCredentialPresent = true;
        this.apiKey = resp.result.apiKey;
        this.apiSecret = resp.result.apiSecret;
        this.credentialId = resp.result.credentialId;
        this.cdr.detectChanges();
      }
    });
  }

  deleteCredentials() {
    this.userService.deleteApiCredentials(this.credentialId).subscribe(resp => {
      if (resp.success) {
        this.apiCredentialPresent = false;
        this.apiKey = '';
        this.apiSecret = '';
        this.cdr.detectChanges();
      }
    });
  }
}
