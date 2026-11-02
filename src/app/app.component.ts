import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ChildActivationEnd, Router } from '@angular/router';
import { AuthService } from '@modules/auth/services';
import { filter } from 'rxjs/operators';

// user idle timeout
// // import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
// import { Keepalive } from '@ng-idle/keepalive';
// import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
// import { environment } from 'environments/environment';
// import { IdleTimeOutComponent } from '@common/components';

@Component({
  selector: 'app-root',
  template: `
    <sbpro-toast-view
      class="ngb-toasts"
      aria-live="polite"
      aria-atomic="true"
      (loggedInEvent)="loggedInEvent($event)"
    >
    </sbpro-toast-view>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  // timer = false;
  // count = 0;
  // modalRef: NgbModalRef | null = null;
  // modelOpen = false;

  // idle toggles
  timedOut = false;
  lastPing?: Date | null = null;

  constructor(public router: Router, private titleService: Title) {
    this.router.events
      .pipe(filter(event => event instanceof ChildActivationEnd))
      .subscribe(event => {
        let snapshot = (event as ChildActivationEnd).snapshot;

        while (snapshot.firstChild !== null) {
          snapshot = snapshot.firstChild;
        }
        this.titleService.setTitle(snapshot.data.title || 'Castler');
      });

    /**
     * Code for Idle Time out
     *
     */
    //   // sets an idle timeout of 5 seconds, for testing purposes.
    //   idle.setIdle(environment.IDLE_TIMEOUT);
    //   // sets a timeout period of 5 seconds. after 10 seconds of inactivity, the user will be considered timed out.
    //   idle.setTimeout(environment.TIMER);
    //   // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
    //   idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    //   idle.watch();

    //   idle.onIdleEnd.subscribe(() => {
    //     this.modalRef?.close();
    //   });

    //   // handle on time out
    //   // basically close modal and logout
    //   idle.onTimeout.subscribe(() => {
    //     this.modalService.dismissAll();
    //     this.modalRef?.close();
    //     this.handleLogoutClick();
    //   });

    //   // open modal here when its idle start
    //   idle.onIdleStart.subscribe(() => {
    //     if (this.authService.getBearerToken()) {
    //       this.modalRef = this.modalService.open(IdleTimeOutComponent, {
    //         backdrop: 'static'
    //       });
    //       this.modalRef.componentInstance.doClose = this.modalRef;
    //       this.modalRef.componentInstance.passEntry.subscribe((resp: boolean) => {
    //         if (resp) {
    //           console.log('\n\n\nrestart watch...\n\n\n');
    //           this.reset();
    //         }
    //       });
    //     } else {
    //       this.reset();
    //     }
    //   });

    //   // handle count for idle timer
    //   idle.onTimeoutWarning.subscribe((countdown: number) => {
    //     if (this.modalRef) {
    //       this.modalRef.componentInstance.count = countdown;
    //     }
    //   });

    //   keepalive.interval(15);
    //   keepalive.onPing.subscribe(() => (this.lastPing = new Date()));
    // }

    // loggedInEvent($event: boolean) {
    //   console.log('recieved event : ', $event);
    //   if ($event) {
    //     this.idle.watch();
    //   }
    // }

    // reset() {
    //   this.idle.watch();
    //   this.timedOut = false;
    // }

    // handleLogoutClick() {
    //   this.authService.logOut().subscribe(resp => {
    //     if (resp.success) {
    //       return this.router.navigateByUrl('/auth');
    //     }
    //     console.log('Error Occurred Logged out');
    //   });
  }
}
