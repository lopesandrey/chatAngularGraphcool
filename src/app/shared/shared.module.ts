import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import {
  MatButtonModule,
  MatCardModule,
  MatToolbarModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatLineModule,
  MatListModule,
  MatProgressSpinnerModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSidenavModule,
  MatTabsModule,



} from '@angular/material';

@NgModule({
  exports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatLineModule,
    MatListModule,
    MatToolbarModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatSidenavModule

  ]
})
export class SharedModule { }
