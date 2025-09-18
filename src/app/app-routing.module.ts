// src/app/app-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatComponent } from './components/chat/chat.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { HomeComponent } from './components/home/home.component';
import { AiChatComponent } from './components/ai-chat/ai-chat.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { ProfileComponent } from './components/profile/profile.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { CreateCourseComponent } from './components/courses/course-create.component';

export const routes: Routes = [
  // Default route
  { path: '', redirectTo: 'home', pathMatch: 'full' }, 

  // Home route
  { path: 'home', loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent) },

  // Chat route with AuthGuard to ensure the user is logged in
  { path: 'chat', loadComponent: () => import('./components/chat/chat.component').then(m => m.ChatComponent), canActivate: [AuthGuard] }, 

  // Login and Signup routes
  { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  { path: 'signup', loadComponent: () => import('./components/signup/signup.component').then(m => m.SignupComponent) },

  // AI Chat route (standalone, no guard)
  { path: 'ai-chat', loadComponent: () => import('./components/ai-chat/ai-chat.component').then(m => m.AiChatComponent) },

  // Profile route for user profile (standalone)
  { path: 'profile', loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent) },

  // Teacher dashboard route with RoleGuard to ensure role-based access
  { 
    path: 'teacher-dashboard', 
    loadChildren: () => import('./components/teacher-dashboard/teacher-dashboard.module')
      .then(m => m.TeacherDashboardModule),
    canActivate: [AuthGuard, RoleGuard], 
    data: { role: 'TEACHER' } 
  },

  // Student dashboard route with RoleGuard
  { 
    path: 'student-dashboard', 
    loadChildren: () => import('./components/student-dashboard/student-dashboard.module')
      .then(m => m.StudentDashboardModule),
    canActivate: [AuthGuard, RoleGuard], 
    data: { role: 'STUDENT' } 
  },

  // Admin dashboard route with RoleGuard
  { 
    path: 'admin-dashboard', 
    loadComponent: () => import('./components/admin-dashboard/admin-dashboard.component')
      .then(m => m.AdminDashboardComponent),
    canActivate: [AuthGuard, RoleGuard], 
    data: { role: 'ADMIN' } 
  },

  // Forgot password route
  { path: 'forgot-password', loadComponent: () => import('./forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },

  { path: 'teachers', loadComponent: () => import('./components/teachers/teachers.component').then(m => m.TeachersComponent), canActivate: [AuthGuard, RoleGuard], data: { role: 'ADMIN' } },

  { path: 'courses', loadComponent: () => import('./components/courses/courses.component').then(m => m.CoursesComponent), canActivate: [AuthGuard] },
  { path: 'create-course', loadComponent: () => import('./components/courses/course-create.component').then(m => m.CreateCourseComponent), canActivate: [AuthGuard, RoleGuard], data: { role: 'ADMIN' } },
  { path: 'subscriptions', loadComponent: () => import('./components/subscriptions/subscriptions.component').then(m => m.SubscriptionsComponent), canActivate: [AuthGuard] },
  { path: 'ai-conversations', loadComponent: () => import('./components/ai-conversations/ai-conversations.component').then(m => m.AiConversationsComponent), canActivate: [AuthGuard] },


  // Wildcard route to handle invalid paths
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
