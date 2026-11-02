import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'sbpro-kyc-success',
  templateUrl: './kyc-success.component.pug',
  styleUrls: ['./kyc-success.component.scss']
})
export class KycSuccessComponent implements OnInit {
  kycCode = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.kycCode = this.route.snapshot.params.crnId;
  }

  copyCode(val: string) {
    // console.log(val);
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }
}
