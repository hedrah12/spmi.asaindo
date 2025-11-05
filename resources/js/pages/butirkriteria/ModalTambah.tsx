import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ModalTambahProps {
  open: boolean;
  onClose: () => void;
}

export default function ModalTambah({ open, onClose }: ModalTambahProps) {
  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-3xl bg-white dark:bg-gray-900 rounded-xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Tambah Butir Kriteria
          </DialogTitle>
        </DialogHeader>

        {/* FORM */}
        <div className="space-y-4 mt-4">
          <div>
            <Label>Element / Pernyataan Standar</Label>
            <Input placeholder="C1. Visi Misi" />
          </div>

          <div>
            <Label>Indikator</Label>
            <Textarea
              placeholder="Tuliskan indikator di sini..."
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label>Prodi</Label>
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-200">
              <label className="flex items-center gap-2">
                <input type="radio" name="prodi" /> Universitas (Seluruh Prodi)
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="prodi" /> S1 Teknologi Informasi
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="prodi" /> S2 Manajemen
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="prodi" /> S1 Teknologi Pangan
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="prodi" /> S1 Manajemen
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="prodi" /> D3 Perhotelan
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="prodi" /> S1 Akuntansi
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="prodi" /> D3 Usaha Perjalanan Wisata
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="prodi" /> S1 Sistem Informasi
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="prodi" /> D1 Perhotelan
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Lingkup</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Lingkup" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rektor">Rektor</SelectItem>
                  <SelectItem value="wakilrektor">Wakil Rektor</SelectItem>
                  <SelectItem value="dekan">Dekan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Auditor</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Nama Auditor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auditor1">Auditor 1</SelectItem>
                  <SelectItem value="auditor2">Auditor 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Auditee</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Nama Auditee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auditee1">Auditee 1</SelectItem>
                  <SelectItem value="auditee2">Auditee 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Siklus</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Siklus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="penetapan">Penetapan</SelectItem>
                  <SelectItem value="pelaksanaan">Pelaksanaan</SelectItem>
                  <SelectItem value="evaluasi">Evaluasi</SelectItem>
                  <SelectItem value="pengendalian">Pengendalian</SelectItem>
                  <SelectItem value="peningkatan">Peningkatan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Kembali</Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
