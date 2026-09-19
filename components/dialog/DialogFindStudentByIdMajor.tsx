import { useGetBetterAuthWithoutUserData } from "@/app/(hooks)/hooks/Users/useBetterAuthWithoutUserData";
import { Search, User } from "lucide-react";
import Image from "next/image";
import React from "react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { type BetterAuthUser } from "./DialogUser";

export function StudentSelectorByIdBranch({
  onSelect,
  selecteduserId,
  disabled = false,
  foundationId,
}: {
  onSelect: (betterAuth: BetterAuthUser | null) => void;
  selecteduserId?: string;
  disabled?: boolean;
  foundationId?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const { data: betterAuths = [], isLoading: betterAuthsLoading } =
    useGetBetterAuthWithoutUserData(foundationId);

  const filteredbetterAuths = React.useMemo(() => {
    if (!searchTerm) return betterAuths;

    return betterAuths.filter((user: BetterAuthUser) => {
      const fullName = `${user.name}`.toLowerCase();
      const email = user?.email?.toLowerCase() || "";
      return (
        fullName.includes(searchTerm.toLowerCase()) ||
        email.includes(searchTerm.toLowerCase())
      );
    });
  }, [betterAuths, searchTerm]);

  const selectedUser = React.useMemo(() => {
    if (!selecteduserId) return null;
    return betterAuths.find(
      (user: BetterAuthUser) => user.id === selecteduserId,
    );
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
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen(true)}
          disabled={disabled || betterAuthsLoading}
          className="flex-1 justify-start"
        >
          {betterAuthsLoading
            ? "Loading..."
            : selectedUser
              ? `${selectedUser.name} (${selectedUser.email})`
              : "Pilih Betterauth User"}
        </Button>
        {selectedUser && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={disabled}
          >
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
              <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
              <Input
                placeholder="Cari nama atau email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <div className="max-h-96 space-y-2 overflow-y-auto">
              {betterAuthsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="border-primary h-6 w-6 animate-spin rounded-full border-b-2"></div>
                </div>
              ) : filteredbetterAuths.length === 0 ? (
                <div className="text-muted-foreground p-8 text-center">
                  {searchTerm
                    ? "Tidak ada user yang cocok dengan pencarian"
                    : "Tidak ada Betterauth user tersedia"}
                </div>
              ) : (
                filteredbetterAuths.map((user: BetterAuthUser) => (
                  <div
                    key={user.id}
                    className="hover:bg-muted flex cursor-pointer items-center space-x-3 rounded-lg border p-3"
                    onClick={() => handleSelect(user)}
                  >
                    <div className="flex">
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={`${user.name}`}
                          width={20}
                          height={20}
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
                          <User className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {user.name}
                      </p>
                      <p className="text-muted-foreground truncate text-sm">
                        {user.email || "No email"}
                      </p>
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
