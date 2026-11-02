import { ManageTeamOverviewComponent } from './manage-team-overview/manage-team-overview.component';
import { ProfileDocUpload } from './profile-documents/profile-document.component';
import { ProfileOverviewComponent } from './profile-overview/profile-overview.component';
import { ProfileSettingsComponent } from './profile-settings/profile-settings.component';
import { ProfileComponent } from './profile/profile.component';
import { UserKycDetailsComponent } from './user-kyc-details/user-kyc-details.component';
import { UserKycComponent } from './user-kyc/user-kyc.component';

export const containers = [
  ProfileComponent,
  ProfileOverviewComponent,
  ProfileSettingsComponent,
  ProfileDocUpload,
  UserKycComponent,
  UserKycDetailsComponent,
  ManageTeamOverviewComponent
];

export * from './profile/profile.component';
export * from './profile-overview/profile-overview.component';
export * from './profile-documents/profile-document.component';
export * from './profile-settings/profile-settings.component';
export * from './user-kyc/user-kyc.component';
export * from './user-kyc-details/user-kyc-details.component';
export * from './manage-team-overview/manage-team-overview.component';
