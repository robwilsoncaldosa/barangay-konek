"use client";

import { useEffect, useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
  Table as TanStackTable,
  Row,
  Column,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal, Upload, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getRequests, updateRequestStatus, deleteRequest, completeRequestWithFile } from "@/server/request";
import { Tables } from "../../database.types";

type Request = Tables<"mRequest">;

interface RequestWithUser extends Request {
  resident_email: string;
}

interface RequestTableProps {
  userRole?: "admin" | "official" | "resident";
  showActions?: boolean;
  userId?: number;
}

const RequestTable = ({ userRole = "resident", showActions = true, userId }: RequestTableProps) => {
  const [requests, setRequests] = useState<RequestWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestWithUser | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const canManage = userRole === "admin" || userRole === "official";

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "in_progress":
        return "secondary";
      case "pending":
        return "outline";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return "destructive";
      case "Normal":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getPaymentVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "default";
      case "unpaid":
        return "destructive";
      default:
        return "outline";
    }
  };

  const columns: ColumnDef<RequestWithUser>[] = [
    ...(showActions ? [{
      id: "select",
      header: ({ table }: { table: TanStackTable<RequestWithUser> }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }: { row: Row<RequestWithUser> }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    }] : []),

    ...(userRole !== "resident" ? [{
      accessorKey: "resident_email",
      header: ({ column }: { column: Column<RequestWithUser> }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Resident Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }: { row: Row<RequestWithUser> }) => <div className="lowercase">{row.getValue("resident_email")}</div>,
    }] : []),
    {
      accessorKey: "mCertificateId",
      header: "Certificate ID",
      cell: ({ row }) => <div>{row.getValue("mCertificateId")}</div>,
    },
    {
      accessorKey: "document_type",
      header: "Document Type",
      cell: ({ row }) => <div>{row.getValue("document_type") || "N/A"}</div>,
    },
    {
      accessorKey: "purpose",
      header: "Purpose",
      cell: ({ row }) => (
        <div className="max-w-xs truncate" title={row.getValue("purpose")}>
          {row.getValue("purpose")}
        </div>
      ),
    },
    {
      accessorKey: "request_date",
      header: ({ column }: { column: Column<RequestWithUser> }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Request Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("request_date"));
        return <div>{date.toLocaleDateString()}</div>;
      },
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => {
        const priority = row.getValue("priority") as string;
        return (
          <Badge variant={getPriorityVariant(priority)} className="capitalize">
            {priority}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={getStatusVariant(status)} className="capitalize">
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "payment_status",
      header: "Payment",
      cell: ({ row }) => {
        const paymentStatus = row.getValue("payment_status") as string;
        return (
          <Badge variant={getPaymentVariant(paymentStatus)} className="capitalize">
            {paymentStatus || "unpaid"}
          </Badge>
        );
      },
    },
    ...(showActions && canManage ? [{
      id: "actions",
      enableHiding: false,
      cell: ({ row }: { row: Row<RequestWithUser> }) => {
        const request = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(request.resident_email)}
              >
                Copy email
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {request.status === "pending" && (
                <>
                  <DropdownMenuItem
                    onClick={() => handleStatusUpdate(request.id, "in_progress")}
                    className="text-blue-600"
                  >
                    Mark In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleStatusUpdate(request.id, "rejected")}
                    className="text-red-600"
                  >
                    Reject Request
                  </DropdownMenuItem>
                </>
              )}
              {request.status === "in_progress" && (
                <DropdownMenuItem
                  onClick={() => handleCompleteRequest(request)}
                  className="text-green-600"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Complete Request
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => handleDelete(request.id)}
                className="text-red-600"
              >
                Delete Request
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    }] : []),
  ];

  const table = useReactTable({
    data: requests,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const filters = userRole === "resident" && userId ? { resident_id: String(userId) } : {};
      const data = await getRequests(filters);
      setRequests(data.map(item => ({
        ...item,
        resident_email: (item as { resident_email?: string }).resident_email || ""
      })));
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      const result = await updateRequestStatus(String(id), status);
      if (result.success) {
        fetchRequests();
      } else {
        alert(result.error || "Failed to update request status");
      }
    } catch (err) {
      console.error("Error updating request:", err);
      alert("An unexpected error occurred");
    }
  };

  const handleCompleteRequest = (request: RequestWithUser) => {
    setSelectedRequest(request);
    setIsUploadDialogOpen(true);
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRequest || !uploadFile) {
      alert("Please select a file to upload");
      return;
    }

    try {
      const result = await completeRequestWithFile({
        requestId: String(selectedRequest.id),
        email: selectedRequest.resident_email,
        file: uploadFile,
        tx_hash: ''
      });

      if (result.success) {
        fetchRequests();
        setIsUploadDialogOpen(false);
        setSelectedRequest(null);
        setUploadFile(null);
        alert("Request completed successfully!");
      } else {
        console.error("Request completion failed:", result.error);
        alert(`Failed to complete request: ${result.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error completing request:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      alert(`An unexpected error occurred: ${errorMessage}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this request?")) return;

    try {
      const result = await deleteRequest(String(id));
      if (result.success) {
        fetchRequests();
      } else {
        alert(result.error || "Failed to delete request");
      }
    } catch (err) {
      console.error("Error deleting request:", err);
      alert("An unexpected error occurred");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [userRole, userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading requests...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {userRole === "resident" ? "My Requests" : "Document Requests"}
          </h2>
          <p className="text-muted-foreground">
            {userRole === "resident"
              ? "View your submitted document requests."
              : "Manage document requests from residents."
            }
          </p>
        </div>
      </div>

      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by purpose..."
          value={(table.getColumn("purpose")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("purpose")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No requests found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleFileUpload}>
            <DialogHeader>
              <DialogTitle>Complete Request</DialogTitle>
              <DialogDescription>
                Upload the completed document for request #{selectedRequest?.id}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="file" className="text-right">
                    Document
                  </Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="col-span-3"
                    required
                  />
                </div>
              </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsUploadDialogOpen(false);
                  setSelectedRequest(null);
                  setUploadFile(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                <FileText className="mr-2 h-4 w-4" />
                Complete Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RequestTable;