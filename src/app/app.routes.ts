import { Routes } from '@angular/router';
import { ShedComponent } from './components/shed/shed.component';
import { UploadPageComponent } from './components/upload-page/upload-page.component';
import { TooldetailComponent } from './components/tooldetail/tooldetail.component';
import { ProfilePageComponent } from './components/profile-page/profile-page.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { AuthGuard } from './auth.guard';
export const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'shed', component: ShedComponent, canActivate: [AuthGuard] }, 
    { path: 'upload', component: UploadPageComponent, canActivate: [AuthGuard] }, 
    { path: 'tooldetail/:id', component: TooldetailComponent, canActivate: [AuthGuard] }, 
    { path: 'profilepage', component: ProfilePageComponent, canActivate: [AuthGuard] },  
    { path: 'signup', component: SignupComponent },
    { path: '**', redirectTo: '' },
];
