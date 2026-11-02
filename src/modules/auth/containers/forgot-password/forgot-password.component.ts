import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'modules/auth/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'sb-forgot-password',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './forgot-password.component.pug',
  styleUrls: ['forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  @ViewChild('confirmationModal') confirmationModal!: TemplateRef<unknown>;
  private subscription: Subscription | undefined;
  key: string | null;
  valid = true;
  errors: Array<string> = [];
  isDone = false;
  email = '';
  linkExpired = false;
  isLoading = false;

  forgotPasswordForm = this.fb.group({
    email: [
      '',
      [
        Validators.required,
        Validators.pattern('[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]+')
      ]
    ]
  });

  resetForm = this.fb.group({
    pass: ['', [Validators.required, Validators.minLength(8)]],
    confirm: ['', [Validators.required]]
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.key = this.route.snapshot.paramMap.get('key');
    if (this.key) {
      this.validateResetKey();
    }
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  private validateResetKey() {
    this.isLoading = true;
    this.subscription = this.auth.validateKey(this.key!).subscribe(
      (resp: any) => {
        this.isLoading = false;
        if (resp.success) {
          this.valid = resp;
        } else {
          console.log(resp.error);
        }
        this.cdr.detectChanges();
      },
      error => {
        this.isLoading = false;
        this.linkExpired = true;
        this.cdr.detectChanges();
      }
    );
  }

  onSubmit() {
    this.errors = [];
    this.isDone = false;
    this.isLoading = true;
    
    // Mark all fields as touched
    Object.values(this.forgotPasswordForm.controls).forEach(control => {
      control.markAllAsTouched();
    });

    if (this.forgotPasswordForm.valid) {
      this.email = this.forgotPasswordForm.value.email || '';
      
      this.subscription = this.auth.forgotPassword(this.email).subscribe(
        (resp: any) => {
          this.isLoading = false;
          if (resp?.success) {
            this.isDone = true;
          } else {
            this.errors = resp?.errors || ['Failed to process your request.'];
          }
          this.cdr.detectChanges();
        },
        (error) => {
          this.isLoading = false;
          this.handleForgotPasswordError(error);
          this.cdr.detectChanges();
        }
      );
    } else {
      this.isLoading = false;
    }
  }

  private handleForgotPasswordError(error: any) {
    if (error.status === 403) {
      this.errors = ['Your account has been locked by an administrator. Please contact support.'];
    } else if (error.status === 400) {
      this.errors = error.error?.errors || ['Invalid request. Please check your email.'];
    } else {
      this.errors = error.error?.errors || ['An unexpected error occurred. Please try again.'];
    }
  }

  onReset() {
    this.errors = [];
    
    // Check password match
    if (this.resetForm.controls.pass.value !== this.resetForm.controls.confirm.value) {
      this.errors.push(`Confirm password didn't match!`);
      return;
    }
    
    if (this.resetForm.valid) {
      this.isLoading = true;
      this.subscription = this.auth
        .resetPassword(this.resetForm.controls.pass.value, this.key)
        .subscribe(
          () => {
            this.isLoading = false;
            this.router.navigate(['auth/login']);
          },
          (err) => {
            this.isLoading = false;
            this.errors = err.error?.errors || ['Failed to reset password.'];
            this.cdr.detectChanges();
          }
        );
    }
  }

  get emailControl() {
    return this.forgotPasswordForm.get('email') as FormControl;
  }

  get emailControlValid() {
    return this.emailControl.touched && !this.emailControlInvalid;
  }

  get emailControlInvalid() {
    return (
      this.emailControl.touched &&
      (this.emailControl.hasError('required') ||
        this.emailControl.hasError('pattern'))
    );
  }
}