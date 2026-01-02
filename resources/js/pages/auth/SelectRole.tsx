import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ShieldCheck, LogOut } from 'lucide-react';

interface SelectRoleProps {
    roles: string[];
    auth: {
        user: {
            name: string;
            email: string;
        }
    }
}

export default function SelectRole({ roles, auth }: SelectRoleProps) {
    const { data, setData, post, processing } = useForm({
        role: roles.length > 0 ? roles[0] : '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('role.switch'));
    };

    const handleLogout = () => {
        // Menggunakan router visit method 'post' untuk logout standar Laravel
        // Sesuaikan route('logout') dengan konfigurasi route auth Anda
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = route('logout');

        // CSRF Token
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (token) {
            const hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.name = '_token';
            hiddenInput.value = token;
            form.appendChild(hiddenInput);
        }

        document.body.appendChild(form);
        form.submit();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <Head title="Pilih Peran" />

            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center space-y-1">
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Selamat Datang, {auth.user.name}</CardTitle>
                    <CardDescription>
                        Akun Anda memiliki beberapa peran akses.<br/>
                        Silakan pilih peran untuk melanjutkan.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={submit} className="space-y-6">
                        <RadioGroup
                            defaultValue={data.role}
                            onValueChange={(val) => setData('role', val)}
                            className="grid gap-3"
                        >
                            {roles.map((role) => (
                                <div key={role}>
                                    <RadioGroupItem
                                        value={role}
                                        id={role}
                                        className="peer sr-only"
                                    />
                                    <Label
                                        htmlFor={role}
                                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                                    >
                                        <span className="font-semibold text-lg capitalize">
                                            {role}
                                        </span>
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>

                        <Button type="submit" className="w-full" disabled={processing}>
                            {processing ? 'Memproses...' : 'Masuk Dashboard'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={handleLogout}
                            className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-1 mx-auto transition-colors"
                        >
                            <LogOut className="w-4 h-4" /> Keluar / Logout
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
