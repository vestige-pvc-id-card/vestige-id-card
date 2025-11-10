import { MemberProvider } from '@/integrations';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ScrollToTop } from '@/lib/scroll-to-top';
import ErrorPage from '@/integrations/errorHandlers/ErrorPage';
import Layout from '@/components/Layout';
import HomePage from '@/components/pages/HomePage';
import ApplyPage from '@/components/pages/ApplyPage';
import AboutPage from '@/components/pages/AboutPage';
import PoliciesPage from '@/components/pages/PoliciesPage';
import ContactPage from '@/components/pages/ContactPage';
import AdminDashboard from '@/components/pages/AdminDashboard';
import StoreDashboard from '@/components/pages/StoreDashboard';
import AdminLoginPage from '@/components/pages/AdminLoginPage';
import StoreLoginPage from '@/components/pages/StoreLoginPage';
import PaymentPage from '@/components/pages/PaymentPage';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "apply",
        element: <ApplyPage />,
      },
      {
        path: "about",
        element: <AboutPage />,
      },
      {
        path: "policies",
        element: <PoliciesPage />,
      },
      {
        path: "policies/terms",
        element: <PoliciesPage />,
      },
      {
        path: "policies/privacy",
        element: <PoliciesPage />,
      },
      {
        path: "policies/shipping",
        element: <PoliciesPage />,
      },
      {
        path: "policies/refund",
        element: <PoliciesPage />,
      },
      {
        path: "contact",
        element: <ContactPage />,
      },
      {
        path: "payment",
        element: <PaymentPage />,
      },
      {
        path: "admin",
        element: <AdminDashboard />,
      },
      {
        path: "admin/login",
        element: <AdminLoginPage />,
      },
      {
        path: "store",
        element: <StoreDashboard />,
      },
      {
        path: "store/login",
        element: <StoreLoginPage />,
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
], {
  basename: import.meta.env.BASE_NAME,
});

export default function AppRouter() {
  return (
    <MemberProvider>
      <RouterProvider router={router} />
    </MemberProvider>
  );
}
