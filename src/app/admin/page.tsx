
import { redirect } from 'next/navigation';

export default function AdminPage() {
  // Redirect to the login page by default.
  // In a real app, you would check for an active session here.
  redirect('/admin/login');
}
