import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Loader2, Trash2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";

interface CompRow {
  id: string;
  email: string;
  expires_at: string | null;
  notes: string | null;
  created_at: string;
}

export default function Admin() {
  const { isAdmin, loading } = useUserRole();
  const [email, setEmail] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [rows, setRows] = useState<CompRow[]>([]);
  const [loadingRows, setLoadingRows] = useState(true);

  const fetchRows = async () => {
    setLoadingRows(true);
    const { data, error } = await supabase
      .from("comp_access")
      .select("id,email,expires_at,notes,created_at")
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setRows((data as CompRow[]) ?? []);
    setLoadingRows(false);
  };

  useEffect(() => { if (isAdmin) fetchRows(); }, [isAdmin]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }
  if (!isAdmin) return <Navigate to="/" replace />;

  const handleGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      toast({ title: "Invalid email", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const payload: { email: string; expires_at: string | null; notes: string | null } = {
      email: trimmed,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      notes: notes.trim() || null,
    };
    const { error } = await supabase.from("comp_access").upsert(payload, { onConflict: "email" });
    setSubmitting(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Access granted", description: `${trimmed} now has free access.` });
    setEmail(""); setExpiresAt(""); setNotes("");
    fetchRows();
  };

  const handleRevoke = async (id: string, emailLabel: string) => {
    if (!confirm(`Revoke free access for ${emailLabel}?`)) return;
    const { error } = await supabase.from("comp_access").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Access revoked" });
    fetchRows();
  };

  return (
    <div className="pb-24">
      <PageHeader title="Admin" />

      <div className="px-4 space-y-4">
        <Card>
          <CardHeader><CardTitle className="text-lg">Grant free access</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleGrant} className="space-y-3">
              <div>
                <Label htmlFor="email">User email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" required />
              </div>
              <div>
                <Label htmlFor="expires">Expires on (optional, blank = lifetime)</Label>
                <Input id="expires" type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. friend, beta tester" />
              </div>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Grant access"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Users with free access</CardTitle></CardHeader>
          <CardContent>
            {loadingRows ? (
              <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
            ) : rows.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No users with free access yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium break-all">{r.email}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {r.expires_at ? new Date(r.expires_at).toLocaleDateString() : "Lifetime"}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleRevoke(r.id, r.email)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
