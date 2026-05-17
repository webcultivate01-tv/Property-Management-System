import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { FullPageLoader } from '@/components/ui/Spinner';
import { ProtectedRoute } from '@/routes/ProtectedRoute';

const PublicLayout = lazy(() => import('@/layouts/PublicLayout'));
const AdminLayout = lazy(() => import('@/layouts/AdminLayout'));

const Home = lazy(() => import('@/pages/public/Home'));
const About = lazy(() => import('@/pages/public/About'));
const Services = lazy(() => import('@/pages/public/Services'));
const Properties = lazy(() => import('@/pages/public/Properties'));
const PropertyDetail = lazy(() => import('@/pages/public/PropertyDetail'));
const Contact = lazy(() => import('@/pages/public/Contact'));

const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'));

const Dashboard = lazy(() => import('@/pages/admin/Dashboard'));
const AdminProperties = lazy(() => import('@/pages/admin/Properties'));
const PropertyForm = lazy(() => import('@/pages/admin/PropertyForm'));
const Inquiries = lazy(() => import('@/pages/admin/Inquiries'));
const Reviews = lazy(() => import('@/pages/admin/Reviews'));
const Users = lazy(() => import('@/pages/admin/Users'));
const Settings = lazy(() => import('@/pages/admin/Settings'));
const Events = lazy(() => import('@/pages/admin/Events'));

const NotFound = lazy(() => import('@/pages/NotFound'));

export default function App() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<Services />} />
          <Route path="properties" element={<Properties />} />
          <Route path="properties/:id" element={<PropertyDetail />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />

        <Route
          path="admin"
          element={
            <ProtectedRoute roles={['super_admin', 'admin', 'agent']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="properties" element={<AdminProperties />} />
          <Route path="properties/new" element={<PropertyForm />} />
          <Route path="properties/:id/edit" element={<PropertyForm />} />
          <Route path="inquiries" element={<Inquiries />} />
          <Route path="events" element={<Events />} />
          <Route path="reviews" element={<Reviews />} />
          <Route
            path="users"
            element={
              <ProtectedRoute roles={['super_admin', 'admin']}>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
