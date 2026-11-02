import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService } from '@modules/profile/services';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'sbpro-escrow-pages-form',
  templateUrl: './escrow-pages-form.component.pug',
  styleUrls: ['./escrow-pages-form.component.scss']
})
export class EscrowPagesFormComponent implements OnInit {
  escrowPagePG = false;
  pgSettlementAccount: string = '';

  modalRef?: NgbModalRef;

  @ViewChild('infoMessage', { static: true }) infoMessage?: ElementRef;
  constructor(
    private profileService: ProfileService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.profileService.getProfile(null, false).subscribe(
      resp => {
        console.log(resp);
        if (resp.result.escrowPagePG) {
          // Get Details for Payment
          this.escrowPagePG = true;
          this.pgSettlementAccount = resp.result.pgSettlementAccount ?? null;
          this.cdr.detectChanges();
        } else {
          this.modalRef = this.modalService.open(this.infoMessage, {
            backdrop: 'static',
            size: 'lg'
          });
          this.cdr.detectChanges();
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  closeModal() {
    this.modalRef?.close();
    this.router.navigate([`/dashboard`]);
  }
}
