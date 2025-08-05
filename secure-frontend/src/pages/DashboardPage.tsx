import { useQuery } from '@tanstack/react-query';
import { UserService } from '../services/api';
import { User } from '../types';

export function DashboardPage() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['user'],
    queryFn: () => UserService.getProfile(),
  });

  if (isLoading) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-700">Failed to load user profile</div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-base font-semibold leading-6 text-gray-900">User Profile</h3>
        <div className="mt-5">
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                {user.email}
              </dd>
            </div>

            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">Role</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                {user.role}
              </dd>
            </div>

            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">Member Since</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                {new Date(user.createdAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
