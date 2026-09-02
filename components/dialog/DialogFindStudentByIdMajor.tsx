import { useGetBetterAuthWithoutUserData } from "@/app/(hooks)/hooks/Users/useBetterAuthWithoutUserData";
import { Search, User } from "lucide-react";
import Image from "next/image";
import React from "react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { BetterAuthUser } from "./DialogUser";

export function StudentSelectorByIdMajor({ onSelect, selecteduserId, disabled = false }: { onSelect: (betterAuth: BetterAuthUser | null) => void; selecteduserId?: string; disabled?: boolean }) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const { data: betterAuths = [], isLoading: betterAuthsLoading } = useGetBetterAuthWithoutUserData();

  const filteredbetterAuths = React.useMemo(() => {
    if (!searchTerm) return betterAuths;

    return betterAuths.filter((user: BetterAuthUser) => {
      const fullName = `${user.name}`.toLowerCase();
      const email = user?.email?.toLowerCase() || "";
      return fullName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
    });
  }, [betterAuths, searchTerm]);

  const selectedUser = React.useMemo(() => {
    if (!selecteduserId) return null;
    return betterAuths.find((user: BetterAuthUser) => user.id === selecteduserId);
  }, [betterAuths, selecteduserId]);

  const handleSelect = (betterAuth: BetterAuthUser) => {
    onSelect(betterAuth);
    setOpen(false);
    setSearchTerm("");
  };

  const handleClear = () => {
    onSelect(null);
    setSearchTerm("");
  };

  return (
    <div className="space-y-2">
      <Label>Betterauth User (Opsional)</Label>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => setOpen(true)} disabled={disabled || betterAuthsLoading} className="flex-1 justify-start">
          {betterAuthsLoading ? "Loading..." : selectedUser ? `${selectedUser.name} (${selectedUser.email})` : "Pilih Betterauth User"}
        </Button>
        {selectedUser && (
          <Button type="button" variant="outline" size="sm" onClick={handleClear} disabled={disabled}>
            Clear
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pilih Betterauth User</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cari nama atau email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {betterAuthsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : filteredbetterAuths.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">{searchTerm ? "Tidak ada user yang cocok dengan pencarian" : "Tidak ada Betterauth user tersedia"}</div>
              ) : (
                filteredbetterAuths.map((user: BetterAuthUser) => (
                  <div key={user.id} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted cursor-pointer" onClick={() => handleSelect(user)}>
                    <div className="flex">
                      {user.image ? (
                        <Image src={user.image} alt={`${user.name}`} width={20} height={20} className="h-10 w-10 rounded-full" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{user.email || "No email"}</p>
                    </div>
                    {selecteduserId === user.id && (
                      <div className="flex">
                        <Badge variant="default">Selected</Badge>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
