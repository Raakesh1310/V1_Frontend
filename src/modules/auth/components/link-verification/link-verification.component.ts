import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AuthService } from '@modules/auth/services/auth.service';

@Component({
  selector: 'sbpro-link-verification',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './link-verification.component.pug',
  styleUrls: ['link-verification.component.scss']
})
export class LinkVerificationComponent implements OnInit {
  constructor(private auth: AuthService) {}
  ngOnInit() {}
}
