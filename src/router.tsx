import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { C } from './lib/theme'

const Landing = lazy(() => import('./pages/Landing').then(m => ({ default: m.Landing })))
const Login = lazy(() => import('./pages/auth/Login').then(m => ({ default: m.Login })))
const Signup = lazy(() => import('./pages/auth/Signup').then(m => ({ default: m.Signup })))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword').then(m => ({ default: m.ForgotPassword })))
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword').then(m => ({ default: m.ResetPassword })))
const StudentHome = lazy(() => import('./pages/student/Home').then(m => ({ default: m.StudentHome })))
const CoursePlayer = lazy(() => import('./pages/student/Player').then(m => ({ default: m.CoursePlayer })))
const StudentTrail = lazy(() => import('./pages/student/Trail').then(m => ({ default: m.StudentTrail })))
const StudentStore = lazy(() => import('./pages/student/Store').then(m => ({ default: m.StudentStore })))
const StudentMyCourses = lazy(() => import('./pages/student/MyCourses').then(m => ({ default: m.StudentMyCourses })))
const StudentCertificates = lazy(() => import('./pages/student/Certificates').then(m => ({ default: m.StudentCertificates })))
const StudentCommunity = lazy(() => import('./pages/student/Community').then(m => ({ default: m.StudentCommunity })))
const StudentLibrary = lazy(() => import('./pages/student/Library').then(m => ({ default: m.StudentLibrary })))
const StudentMentorings = lazy(() => import('./pages/student/Mentorings').then(m => ({ default: m.StudentMentorings })))
const StudentProfile = lazy(() => import('./pages/student/Profile').then(m => ({ default: m.StudentProfile })))
const StudentAchievements = lazy(() => import('./pages/student/Achievements').then(m => ({ default: m.StudentAchievements })))
const OwnerDashboard = lazy(() => import('./pages/owner/Dashboard').then(m => ({ default: m.OwnerDashboard })))
const OwnerCourses = lazy(() => import('./pages/owner/Courses').then(m => ({ default: m.OwnerCourses })))
const OwnerStudents = lazy(() => import('./pages/owner/Students').then(m => ({ default: m.OwnerStudents })))
const OwnerLibrary = lazy(() => import('./pages/owner/Library').then(m => ({ default: m.OwnerLibrary })))
const OwnerMentorings = lazy(() => import('./pages/owner/Mentorings').then(m => ({ default: m.OwnerMentorings })))
const OwnerProducts = lazy(() => import('./pages/owner/Products').then(m => ({ default: m.OwnerProducts })))
const OwnerPayments = lazy(() => import('./pages/owner/Payments').then(m => ({ default: m.OwnerPayments })))
const OwnerCommunity = lazy(() => import('./pages/owner/Community').then(m => ({ default: m.OwnerCommunity })))
const OwnerAnalytics = lazy(() => import('./pages/owner/Analytics').then(m => ({ default: m.OwnerAnalytics })))
const OwnerSettings = lazy(() => import('./pages/owner/Settings').then(m => ({ default: m.OwnerSettings })))

function RouteLoading() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: C.bg, color: C.textMuted,
    }}>
      Carregando...
    </div>
  )
}

function page(element: ReactNode) {
  return <Suspense fallback={<RouteLoading />}>{element}</Suspense>
}

export const router = createBrowserRouter([
  { path: '/login', element: page(<Login />) },
  { path: '/cadastro', element: page(<Signup />) },
  { path: '/esqueci-senha', element: page(<ForgotPassword />) },
  { path: '/nova-senha', element: page(<ResetPassword />) },

  {
    element: <ProtectedRoute allowedRoles={['student', 'owner', 'admin']} />,
    children: [
      { path: '/dashboard', element: page(<StudentHome />) },
      { path: '/meus-cursos', element: page(<StudentMyCourses />) },
      { path: '/loja', element: page(<StudentStore />) },
      { path: '/curso/:courseId', element: page(<CoursePlayer />) },
      { path: '/trilha', element: page(<StudentTrail />) },
      { path: '/biblioteca', element: page(<StudentLibrary />) },
      { path: '/mentorias', element: page(<StudentMentorings />) },
      { path: '/comunidade', element: page(<StudentCommunity />) },
      { path: '/certificados', element: page(<StudentCertificates />) },
      { path: '/perfil', element: page(<StudentProfile />) },
      { path: '/conquistas', element: page(<StudentAchievements />) },
    ],
  },

  {
    element: <ProtectedRoute allowedRoles={['owner', 'admin']} />,
    children: [
      { path: '/admin', element: page(<OwnerDashboard />) },
      { path: '/admin/cursos', element: page(<OwnerCourses />) },
      { path: '/admin/biblioteca', element: page(<OwnerLibrary />) },
      { path: '/admin/mentorias', element: page(<OwnerMentorings />) },
      { path: '/admin/alunos', element: page(<OwnerStudents />) },
      { path: '/admin/produtos', element: page(<OwnerProducts />) },
      { path: '/admin/pagamentos', element: page(<OwnerPayments />) },
      { path: '/admin/comunidade', element: page(<OwnerCommunity />) },
      { path: '/admin/analytics', element: page(<OwnerAnalytics />) },
      { path: '/admin/configuracoes', element: page(<OwnerSettings />) },
    ],
  },

  { path: '/', element: page(<Landing />) },
  { path: '*', element: <Navigate to="/login" replace /> },
])
