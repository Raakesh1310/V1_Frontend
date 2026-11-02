import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import EscrowPageWidgetComponent from '@modules/escrow-page-widgets/components/escrow-page-widget.class';
import { EscrowPageFieldWidget } from '@modules/escrow-page-widgets/models';
import { EscrowPageWidgetsService } from '@modules/escrow-page-widgets/services';

@Component({
  selector: 'sbpro-escrow-page-widgets-pan',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './escrow-page-widgets-pan.component.pug',
  styleUrls: ['escrow-page-widgets-pan.component.scss']
})
export class EscrowPageWidgetsPanComponent extends EscrowPageWidgetComponent
  implements OnInit {
  @ViewChild('defInput') defInput!: ElementRef;
  errors: string[] = [];
  panVerified = false;
  customerName = '';
  verifying = false;
  constructor(
    private escrowPageService: EscrowPageWidgetsService,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  @Input() placeholder!: string;

  ngOnInit() {}

  async informChanges(instance: EscrowPageFieldWidget) {
    console.log('instance updated: ' + JSON.stringify(instance));
    console.log(instance.value);
    if (
      instance.label === 'Customer Name' &&
      typeof instance.value === 'string'
    ) {
      console.log('name captured : ', instance.value);
      this.customerName = instance.value;
    }
  }

  onChange() {
    this.change.emit({
      value: this.defInput.nativeElement.value,
      label: 'PAN',
      required: this.required,
      verification: this.verification
    });
  }
  rmField() {
    this.remove.emit(true);
  }

  async validate() {
    this.errors = [];
    this.cdr.detectChanges();
    const re = /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/;

    /**
     * check for required field
     */
    if (this.required) {
      if (this.defInput.nativeElement.value.length === 0) {
        this.errors.push(this.label + ' is required.');
        this.cdr.detectChanges();
        return false;
      }
    }

    /**
     * field value validation
     */

    if (
      this.defInput.nativeElement.value &&
      !re.test(this.defInput.nativeElement.value)
    ) {
      this.errors.push('Please enter a valid PAN number.');
      this.cdr.detectChanges();
      return false;
    }

    /**
     * check for validation
     */

    if (this.verification) {
      console.log(
        'verifying --> ',
        this.defInput.nativeElement.value,
        this.customerName
      );
      if (this.defInput.nativeElement.value) {
        const resp: any = await this.escrowPageService
          .verifyPAN(this.defInput.nativeElement.value)
          .toPromise();
        console.log(resp);
        if (!resp.success) {
          this.errors.push('PAN verification failed. Please try again later.');
          this.cdr.detectChanges();
          return false;
        }
        const nameArray = this.defInput.nativeElement.value.split('');
        const firstName = nameArray[0];
        const lastName = nameArray.pop();
        if (
          resp.result.panDetails.first_name !== firstName ||
          resp.result.panDetails.last_name !== lastName
        ) {
          console.log(resp.result.panDetails.full_name, this.customerName);
          this.errors.push(
            'Name on PAN does not match the name entered. Please enter the correct name or PAN details'
          );
          this.cdr.detectChanges();
          return false;
        }
        this.panVerified = true;
      }
    }

    return true;
  }
}
