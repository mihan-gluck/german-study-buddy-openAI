//main.ts

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app/app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { MaterialModule } from './app/shared/material.module';
//import { provideAnimations } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      HttpClientModule,
      MaterialModule,  // ✅ Wrap in importProvidersFrom
      BrowserAnimationsModule,
    ),
    provideRouter(routes, withComponentInputBinding()),
    provideAnimations(),
  ]
}).catch(err => console.error(err));
