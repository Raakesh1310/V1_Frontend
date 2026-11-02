import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { helpdeskService } from '@modules/helpdesk/services';

interface uploadFile {
  name: string;
  file: File;
}

@Component({
  selector: 'sbpro-helpdesk-form',
  templateUrl: './helpdesk-form.component.pug',
  styleUrls: ['./helpdesk-form.component.scss']
})
export class HelpdeskFormComponent implements OnInit {
  natures = [
    'Account Activation',
    'Documents upload',
    'Account Creation',
    'Account - Payee linking',
    'Addition of Payee',
    'Transfer Funds request',
    'Reports'
  ];
  attachments: Array<uploadFile> = [];
  errors: Array<string> = [];

  helpForm: FormGroup;

  constructor(
    public helpdeskService: helpdeskService,
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.helpForm = this.formBuilder.group({
      nature: ['Account Activation', Validators.required],
      message: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  fileChangedHandler(fileEvent: Array<uploadFile>) {
    this.attachments = fileEvent;
  }

  onSubmit() {
    if (
      !this.helpForm.controls.message.value &&
      this.attachments.length === 0
    ) {
      this.errors = ['Please provide either message or a file.'];
      this.cdr.detectChanges();
      setTimeout(() => {
        this.errors = [];
        this.cdr.detectChanges();
      }, 8000);
      return;
    }

    const formData = new FormData();
    formData.set('nature', this.helpForm.controls.nature.value);
    formData.set('message', this.helpForm.controls.message.value);
    this.attachments.forEach((file: uploadFile) => {
      formData.set(file.name, file.file);
    });
    this.helpdeskService.makeRequest(formData).subscribe((resp: any) => {
      if (resp.success) {
        this.router.navigate(['helpdesk/track']);
      } else {
        console.log('error while submitting .. ');
      }
    });
  }
}
