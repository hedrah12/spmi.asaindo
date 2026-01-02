import React from "react";
import { useForm, usePage, router } from "@inertiajs/react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ShieldCheck, LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function RoleSelectionModal() {
    // Ambil props dari HandleInertiaRequests
    const { auth } = usePage<any>().props;

    // Logic: Hanya tampil jika must_select_role = true
    const showModal = auth.must_select_role;

    const { data, setData, post, processing } = useForm({
        // Default pilih role pertama jika ada
        role: auth.roles.length > 0 ? auth.roles[0] : "",
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("role.switch"), {
            onSuccess: () => {
                toast.success(`Berhasil masuk sebagai ${data.role}`);
                // Halaman akan reload, must_select_role jadi false, modal hilang
            },
            onError: () => {
                toast.error("Gagal mengganti role.");
            }
        });
    };

    if (!showModal) return null;

    return (
        <Dialog open={true} onOpenChange={() => {}}>
            {/* Prevent closing by clicking outside or pressing Escape */}
            <DialogContent
                className="sm:max-w-md"
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
                // Sembunyikan tombol close (X) via CSS jika perlu, atau biarkan non-aktif
            >
                <DialogHeader className="text-center items-center gap-2">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full w-fit">
                        <ShieldCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <DialogTitle>Pilih Peran Akses</DialogTitle>
                    <DialogDescription>
                        Halo, <b>{auth.user.name}</b>. Akun Anda memiliki beberapa akses.
                        Silakan pilih peran untuk melanjutkan ke Dashboard.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-6 mt-2">
                    <RadioGroup
                        value={data.role}
                        onValueChange={(val) => setData("role", val)}
                        className="grid gap-3"
                    >
                        {auth.roles.map((role: string) => (
                            <div key={role} className="relative">
                                <RadioGroupItem
                                    value={role}
                                    id={role}
                                    className="peer sr-only"
                                />
                                <Label
                                    htmlFor={role}
                                    className="flex items-center justify-between p-4 rounded-lg border-2 border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                                >
                                    <span className="font-semibold capitalize flex items-center gap-2">
                                        {role}
                                    </span>
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>

                    <div className="flex flex-col gap-3">
                        <Button type="submit" className="w-full" disabled={processing}>
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Masuk Dashboard
                        </Button>

                        <Button
                            type="button"
                            variant="ghost"
                            className="text-xs text-muted-foreground hover:text-red-500"
                            onClick={() => router.post(route('logout'))}
                        >
                            <LogOut className="w-3 h-3 mr-1" /> Keluar / Logout
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
