import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ViewFacultyComponent } from './view-faculty/view-faculty.component';
import { EditFacultyComponent } from './edit-faculty/edit-faculty.component';

const routes: Routes = [
  { path: '', component: ViewFacultyComponent },
  { path: 'edit-faculty', component: EditFacultyComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
