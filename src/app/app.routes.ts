import { Routes } from '@angular/router';
import { ShedComponent } from './components/shed/shed.component';
import { UploadPageComponent } from './components/upload-page/upload-page.component';
import { TooldetailComponent } from './components/tooldetail/tooldetail.component';

export const routes: Routes = [
    { path: '', component: ShedComponent },
    { path: 'shed', component: ShedComponent },
    { path: 'upload', component: UploadPageComponent },
    { path: 'tooldetail/:id', component: TooldetailComponent},
    { path: '**', redirectTo: '' },
  ];