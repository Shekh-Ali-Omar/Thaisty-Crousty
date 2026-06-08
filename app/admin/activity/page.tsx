"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { createClient } from "@/lib/supabase/client";
import { History, User, Tag, Clock, Database, RefreshCw } from "lucide-react";
import { GlassCard } from "@/components/glass/GlassCard";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";

interface ActivityLog {
  id: string;
  admin_email: string;
  action_type: string;
  entity_type: string;
  description: string;
  created_at: string;
}

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (!error && data) {
      setLogs(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const columns: ColumnDef<ActivityLog>[] = [
    {
      accessorKey: "admin_email",
      header: "Admin",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="h-3 w-3 text-muted" />
          <span className="font-bold text-xs">{row.getValue("admin_email") || "System"}</span>
        </div>
      )
    },
    {
      accessorKey: "action_type",
      header: "Action",
      cell: ({ row }) => {
        const type = row.getValue("action_type") as string;
        return (
          <Badge variant="secondary" className={cn(
            "uppercase text-[8px] font-black tracking-widest",
            type === 'create' ? 'text-green-400' : 
            type === 'delete' ? 'text-red-400' : 
            type === 'login' ? 'text-blue-400' : 'text-primary'
          )}>
            {type}
          </Badge>
        );
      }
    },
    {
      accessorKey: "entity_type",
      header: "Target",
      cell: ({ row }) => (
        <span className="text-[10px] font-black uppercase text-muted/60">{row.getValue("entity_type")}</span>
      )
    },
    {
      accessorKey: "description",
      header: "Detail",
      cell: ({ row }) => (
        <p className="text-xs font-medium text-foreground/80 max-w-md truncate">{row.getValue("description")}</p>
      )
    },
    {
      accessorKey: "created_at",
      header: "Timestamp",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-[10px] text-muted font-bold">
          <Clock className="h-3 w-3" />
          {new Date(row.getValue("created_at")).toLocaleString()}
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-10">
      <AdminNav />

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gradient">Audit Trail</h1>
          <p className="text-muted font-medium mt-1">Immutable record of all administrative operations.</p>
        </div>
        <Button onClick={load} variant="glass" size="icon" className="h-12 w-12 rounded-xl">
          <RefreshCw className={cn("h-5 w-5", loading && "animate-spin")} />
        </Button>
      </header>

      {loading && logs.length === 0 ? (
        <div className="py-20 text-center glass rounded-[3rem]">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted font-black uppercase tracking-widest text-[10px]">Retrieving History...</p>
        </div>
      ) : (
        <DataTable columns={columns} data={logs} searchKey="description" placeholder="Search audit logs..." />
      )}
    </div>
  );
}
