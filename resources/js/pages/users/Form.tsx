import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BreadcrumbItem } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';

// Interface Data
interface Role {
  id: number;
  name: string;
}

interface Departemen {
  id_departemen: number;
  nama_departemen: string;
}

interface User {
  id?: number;
  name: string;
  email: string;
  roles?: string[];
}

interface Props {
  user?: User;
  roles: Role[];
  currentRoles?: string[];
  departemens: Departemen[];        // <--- Data baru dari Controller
  currentDepartemens?: number[];    // <--- Data baru dari Controller
}

export default function UserForm({
  user,
  roles,
  currentRoles,
  departemens = [],
  currentDepartemens = []
}: Props) {

  const isEdit = !!user;

  const { data, setData, post, put, processing, errors } = useForm({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    roles: currentRoles || [],
    departemens: currentDepartemens || [], // <--- State untuk departemen
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    isEdit ? put(`/users/${user?.id}`) : post('/users');
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'User Management', href: '/users' },
    { title: isEdit ? 'Edit User' : 'Create User', href: '#' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={isEdit ? 'Edit User' : 'Create User'} />
      <div className="flex-1 p-4 md:p-6">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl font-bold tracking-tight">
              {isEdit ? 'Edit User' : 'Create New User'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {isEdit ? 'Update user data, roles, and departments' : 'Enter user data and set permissions'}
            </p>
          </CardHeader>

          <Separator />

          <CardContent className="pt-5">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <Label htmlFor="name" className="mb-2 block">Name</Label>
                  <Input
                    id="name"
                    placeholder="Full name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-sm text-red-500 mt-2">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="mb-2 block">Email</Label>
                  <Input
                    id="email"
                    placeholder="Email address"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && <p className="text-sm text-red-500 mt-2">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <Label htmlFor="password" className="mb-2 block">Password {isEdit ? '(Optional)' : ''}</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    className={errors.password ? 'border-red-500' : ''}
                  />
                  {errors.password && <p className="text-sm text-red-500 mt-2">{errors.password}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Roles Selection */}
                    <div>
                      <Label className="mb-3 block">Roles</Label>
                      <div className="space-y-3 border rounded-lg p-4 h-64 overflow-y-auto">
                        {roles.map((role) => (
                          <div key={role.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`role-${role.id}`}
                              checked={data.roles.includes(role.name)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setData('roles', [...data.roles, role.name]);
                                } else {
                                  setData('roles', data.roles.filter(r => r !== role.name));
                                }
                              }}
                            />
                            <Label htmlFor={`role-${role.id}`} className="text-sm font-normal cursor-pointer">
                              {role.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {errors.roles && <p className="text-sm text-red-500 mt-2">{errors.roles}</p>}
                    </div>

                    {/* Departments Selection (FITUR BARU) */}
                    <div>
                      <Label className="mb-3 block">Departemen</Label>
                      <div className="space-y-3 border rounded-lg p-4 h-64 overflow-y-auto bg-slate-50/50">
                        {departemens.length === 0 ? (
                           <p className="text-xs text-muted-foreground italic">Belum ada data departemen.</p>
                        ) : (
                          departemens.map((dept) => (
                            <div key={dept.id_departemen} className="flex items-center space-x-2">
                              <Checkbox
                                id={`dept-${dept.id_departemen}`}
                                checked={data.departemens.includes(dept.id_departemen)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setData('departemens', [...data.departemens, dept.id_departemen]);
                                  } else {
                                    setData('departemens', data.departemens.filter(id => id !== dept.id_departemen));
                                  }
                                }}
                              />
                              <Label htmlFor={`dept-${dept.id_departemen}`} className="text-sm font-normal cursor-pointer">
                                {dept.nama_departemen}
                              </Label>
                            </div>
                          ))
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Pilih departemen yang dikelola oleh user ini.
                      </p>
                      {errors.departemens && <p className="text-sm text-red-500 mt-2">{errors.departemens}</p>}
                    </div>
                </div>

              </div>

              <Separator />

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
                <Link href="/users" className="w-full sm:w-auto">
                  <Button type="button" variant="secondary" className="w-full">
                    Back
                  </Button>
                </Link>
                <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                  {processing
                    ? <span className="animate-pulse">Saving...</span>
                    : isEdit
                      ? 'Save Changes'
                      : 'Create User'
                  }
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
