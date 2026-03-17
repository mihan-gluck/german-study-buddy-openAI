import { Injectable } from '@angular/core';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  roles: string[];
}

export interface NavGroup {
  group: string;
  roles: string[];
  items: NavItem[];
}

@Injectable({ providedIn: 'root' })
export class NavService {

  private readonly ALL_NAV: NavGroup[] = [
    {
      group: '🏠 Main', roles: ['ADMIN', 'TEACHER', 'TEACHER_ADMIN', 'STUDENT'],
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: '🏠', route: '__dashboard__', roles: ['ADMIN', 'TEACHER', 'TEACHER_ADMIN', 'STUDENT'] }
      ]
    },
    {
      group: '👥 People', roles: ['ADMIN', 'TEACHER_ADMIN'],
      items: [
        { id: 'students', label: 'Students', icon: '🎓', route: '/admin-dashboard', roles: ['ADMIN', 'TEACHER_ADMIN'] },
        { id: 'teachers', label: 'Teachers', icon: '🧑‍🏫', route: '/teachers', roles: ['ADMIN', 'TEACHER_ADMIN'] },
        { id: 'userroles', label: 'User Roles', icon: '🔑', route: '/user-roles', roles: ['ADMIN', 'TEACHER_ADMIN'] }
      ]
    },
    {
      group: '📚 Learning', roles: ['ADMIN', 'TEACHER', 'TEACHER_ADMIN', 'STUDENT'],
      items: [
        { id: 'modules', label: 'Learning Modules', icon: '🤖', route: '/learning-modules', roles: ['ADMIN', 'TEACHER', 'TEACHER_ADMIN', 'STUDENT'] },
        { id: 'exercises', label: 'Digital Exercises', icon: '🏋️', route: '/digital-exercises', roles: ['STUDENT'] },
        { id: 'exercises-admin', label: 'Digital Exercises', icon: '🏋️', route: '/admin/digital-exercises', roles: ['ADMIN', 'TEACHER', 'TEACHER_ADMIN'] },
        { id: 'admin-modules', label: 'Module Management', icon: '📖', route: '/admin-modules', roles: ['ADMIN', 'TEACHER', 'TEACHER_ADMIN'] },
        { id: 'courses', label: 'Courses', icon: '📖', route: '/courses', roles: ['ADMIN', 'TEACHER_ADMIN'] },
        { id: 'materials', label: 'Materials', icon: '📂', route: '/view-course-materials', roles: ['ADMIN', 'TEACHER_ADMIN'] }
      ]
    },
    {
      group: '📝 Assignments', roles: ['TEACHER', 'TEACHER_ADMIN'],
      items: [
        { id: 'assignments', label: 'Assignments', icon: '📝', route: '/teacher/assignments', roles: ['TEACHER', 'TEACHER_ADMIN'] }
      ]
    },
    {
      group: '🎥 Classes & Meetings', roles: ['ADMIN', 'TEACHER', 'TEACHER_ADMIN', 'STUDENT'],
      items: [
        { id: 'meetings-teacher', label: 'My Meetings', icon: '🎥', route: '/teacher/meetings', roles: ['ADMIN', 'TEACHER', 'TEACHER_ADMIN'] },
        { id: 'meetings-student', label: 'My Classes', icon: '🎥', route: '/student/meetings', roles: ['STUDENT'] },
        { id: 'zoom-reports', label: 'Zoom Reports', icon: '📊', route: '/admin/zoom-reports', roles: ['ADMIN', 'TEACHER_ADMIN'] }
      ]
    },
    {
      group: '📊 Performance', roles: ['ADMIN', 'TEACHER_ADMIN', 'STUDENT'],
      items: [
        { id: 'analytics', label: 'Analytics', icon: '📈', route: '/admin-analytics', roles: ['ADMIN', 'TEACHER_ADMIN'] },
        { id: 'performance', label: 'Performance History', icon: '🏆', route: '/performance-history', roles: ['STUDENT'] },
        { id: 'student-progress', label: 'Student Progress', icon: '📈', route: '/student-progress', roles: ['STUDENT'] }
      ]
    },
    {
      group: '💡 Insights', roles: ['ADMIN', 'TEACHER_ADMIN', 'TEACHER', 'STUDENT'],
      items: [
        { id: 'documents-admin', label: 'Documents', icon: '📁', route: '/admin/document-verification', roles: ['ADMIN'] },
        { id: 'documents-student', label: 'My Documents', icon: '📁', route: '/student-documents', roles: ['STUDENT'] },
        { id: 'timetable-admin', label: 'Timetable', icon: '📅', route: '/time-table-view-admin', roles: ['ADMIN', 'TEACHER_ADMIN'] },
        { id: 'timetable-teacher', label: 'Timetable', icon: '📅', route: '/time-table-view-teacher', roles: ['TEACHER', 'TEACHER_ADMIN'] },
        { id: 'timetable-student', label: 'Timetable', icon: '📅', route: '/time-table-view-student', roles: ['STUDENT'] },
        { id: 'feedback', label: 'Feedback', icon: '💬', route: '/feedback', roles: ['STUDENT'] },
        { id: 'feedback-list', label: 'Feedback', icon: '💬', route: '/feedback-list', roles: ['ADMIN', 'TEACHER_ADMIN'] },
        { id: 'student-logs', label: 'Student Logs', icon: '📋', route: '/student-logs', roles: ['ADMIN', 'TEACHER_ADMIN'] },
        { id: 'trash', label: 'Trash', icon: '🗑️', route: '/admin-trash', roles: ['ADMIN', 'TEACHER_ADMIN'] }
      ]
    }
  ];

  getNavForRole(role: string): NavGroup[] {
    return this.ALL_NAV
      .filter(g => g.roles.includes(role))
      .map(g => ({
        ...g,
        items: g.items.filter(i => i.roles.includes(role))
      }))
      .filter(g => g.items.length > 0);
  }

  getDashboardRoute(role: string): string {
    const map: Record<string, string> = {
      ADMIN: '/admin-dashboard',
      TEACHER_ADMIN: '/admin-dashboard',
      TEACHER: '/teacher-dashboard',
      STUDENT: '/student-dashboard'
    };
    return map[role] || '/home';
  }
}
