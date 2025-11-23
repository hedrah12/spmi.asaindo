import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { UserCircle } from "lucide-react"; // Opsional: Ikon untuk mempercantik

// Import komponen Select custom Anda
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface RoleSwitcherProps {
    roles: string[];
    activeRole: string;
}

export default function RoleSwitcher({ roles, activeRole }: RoleSwitcherProps) {
    // State lokal agar UI berubah instan saat diklik
    const [role, setRole] = useState(activeRole);

    // Handler saat user memilih role baru
    const handleValueChange = (newRole: string) => {
        setRole(newRole);

        router.post(
            "/switch-role",
            { role: newRole },
            {
                // Partial reload: Hanya refresh data 'auth' agar aplikasi terasa cepat
                onSuccess: () => {
                    router.reload({ only: ["auth"] });
                },
                // Jika gagal (misal validasi backend), kembalikan ke role semula
                onError: () => {
                    setRole(activeRole);
                }
            }
        );
    };

    // Jika user hanya punya 1 role, tampilkan sebagai teks biasa (badge)
    if (roles.length <= 1) {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground bg-muted/50 rounded-md">
                <UserCircle className="w-4 h-4" />
                <span>{activeRole}</span>
            </div>
        );
    }

    return (
        <Select value={role} onValueChange={handleValueChange}>
            <SelectTrigger className="w-[140px] h-9">
                <div className="flex items-center gap-2">
                    <UserCircle className="w-4 h-4 text-muted-foreground" />
                    <SelectValue placeholder="Pilih Role" />
                </div>
            </SelectTrigger>
            <SelectContent>
                {roles.map((r) => (
                    <SelectItem key={r} value={r}>
                        {/* Ubah huruf pertama jadi kapital agar rapi */}
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
