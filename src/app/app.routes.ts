import { Routes } from '@angular/router';
import { ShedComponent } from './components/shed/shed.component';
import { UploadPageComponent } from './components/upload-page/upload-page.component';

export const routes: Routes = [
    { path: '', component: ShedComponent },
    { path: 'shed', component: ShedComponent },
    { path: 'upload', component: UploadPageComponent },
    { path: '**', redirectTo: '' },
  ];