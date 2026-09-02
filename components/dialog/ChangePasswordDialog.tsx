"use client";

import { getErrorMessage } from "@/app/(types)";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/authClients";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
}

export function ChangePasswordDialog({ open, onOpenChange, userId, userName }: ChangePasswordDialogProps) {
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi
    if (!newPassword || !confirmPassword) {
      toast.error("Semua field harus diisi");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password minimal 8 karakter");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Password tidak cocok");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await authClient.admin.setUserPassword({
        userId: userId,
        newPassword: newPassword,
      });

      if (error) {
        toast.error(error.message || "Gagal mengubah password");
        return;
      }

      toast.success(`Password untuk ${userName} berhasil diubah`);

      // Reset form dan tutup dialog
      setNewPassword("");
      setConfirmPassword("");
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setNewPassword("");
      setConfirmPassword("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Ubah Password User</DialogTitle>
            <DialogDescription>
              Ubah password untuk <strong>{userName}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-password">Password Baru</Label>
              <Input id="new-password" type="password" placeholder="Masukkan password baru" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={isLoading} required minLength={8} />
              <p className="text-xs text-muted-foreground">Minimal 8 karakter</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Konfirmasi Password</Label>
              <Input id="confirm-password" type="password" placeholder="Konfirmasi password baru" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading} required minLength={8} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ubah Password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
