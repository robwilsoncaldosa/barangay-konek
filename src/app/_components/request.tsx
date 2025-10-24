"use client";

import { useEffect, useState, useMemo } from "react";
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
} from "@tanstack/react-table";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Lucide Icons
import { ArrowUpDown, ChevronDown, MoreHorizontal, GripVertical, Loader2 } from "lucide-react";

// Assuming you are using these shared UI components now
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
import { Badge } from "@/components/ui/badge";

// Assuming these server and lib functions are available
import { connectWallet, addCertificateRequest } from "@/lib/blockchain";
import {
    getRequests,
    completeRequestWithFile,
    updateRequestStatus, // This will now handle payment_status updates as well
    deleteRequest as deleteRequestServer,
} from "@/server/request";


// --- TYPE DEFINITIONS ---
interface RequestData {
    id: number;
    mCertificateId: number | null;
    resident_id: number;
    purpose: string;
    document_type: string; // Keeping for compatibility, but the column will use certificate_name
    request_date: string; // ISO date string
    priority: string | null;
    status: string | null; // e.g., 'pending', 'completed', 'rejected'
    payment_status: string | null; // e.g., 'Unpaid', 'Paid'
    created_at: string | null;
    updated_at: string | null;
    tx_hash?: string | null;

    // NEW/UPDATED fields from the server action
    resident_name: string;      // The actual name 
    certificate_name: string;   // The actual certificate name 
    certificate_fee: number;    // The fee
}

type Request = RequestData; 

// --- BADGE COMPONENTS (No changes needed here) ---

const PaymentBadge: React.FC<{ status: Request['payment_status'] }> = ({ status }) => {
    const normalizedStatus = status?.toLowerCase().replace(/[\s-]/g, '');
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";

    switch (normalizedStatus) {
        case 'paid':
        case 'completed':
            variant = "default"; // Green/success
            break;
        case 'pending':
        case 'unpaid':
            variant = "secondary"; // Yellow/warning
            break;
    }

    return (
        <Badge
            variant={variant}
            className="capitalize text-xs font-semibold"
        >
            {status || 'N/A'}
        </Badge>
    );
};

const StatusBadge: React.FC<{ status: Request['status'] }> = ({ status }) => {
    const normalizedStatus = status?.toLowerCase().replace(/[\s-]/g, '');
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";

    switch (normalizedStatus) {
        case 'completed':
        case 'approved':
            variant = "default"; // Green
            break;
        case 'pending':
        case 'forconfirmation':
        case 'in-progress':
            variant = "secondary"; // Yellow/Amber
            break;
        case 'rejected':
        case 'cancelled':
            variant = "destructive"; // Red
            break;
    }

    return (
        <Badge
            variant={variant}
            className="capitalize text-xs font-semibold"
        >
            {status || 'Unknown'}
        </Badge>
    );
};


// --- SORTABLE ROW COMPONENT (No changes needed here) ---
function SortableRow({ row, children }: { row: { original: Request; getIsSelected: () => boolean; id: string }; children: React.ReactNode }) {
    const sortableId = row.original.id;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: sortableId.toString(),
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <TableRow
            ref={setNodeRef}
            style={style}
            data-state={row.getIsSelected() && "selected"}
            className={isDragging ? "relative z-50" : ""}
        >
            <TableCell className="w-[40px] flex items-center h-[52px]">
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab hover:cursor-grabbing p-1 hover:bg-muted rounded"
                >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
            </TableCell>
            {children}
        </TableRow>
    );
}


// --- MAIN COMPONENT ---

const RequestListPage = () => {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    // State for Modals/Processing
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [hasMetaMask, setHasMetaMask] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);


    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // --- COLUMN DEFINITIONS ---
    const columns: ColumnDef<Request>[] = useMemo(() => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "id",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    ID
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
        },
        {
            accessorKey: "resident_name",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Resident Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div className="capitalize">{row.getValue("resident_name")}</div>,
        },
        {
            accessorKey: "certificate_name",
            header: "Document Type",
            cell: ({ row }) => <div>{row.getValue("certificate_name")}</div>,
        },
        {
            accessorKey: "purpose",
            header: "Purpose",
            cell: ({ row }) => <div>{row.getValue("purpose")}</div>,
        },
        {
            accessorKey: "certificate_fee", 
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Fee
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const fee = parseFloat(String(row.getValue("certificate_fee")));
                return <div className="text-right font-medium">₱{fee.toFixed(2)}</div>;
            },
        },
        {
            accessorKey: "request_date",
            header: "Date",
            cell: ({ row }) => <div>{String(row.getValue("request_date")).split('T')[0]}</div>,
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <StatusBadge status={row.original.status} />,
        },
        {
            accessorKey: "payment_status",
            header: "Payment Status",
            cell: ({ row }) => <PaymentBadge status={row.original.payment_status} />,
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const req = row.original;
                const statusLower = req.status?.toLowerCase();
                const paymentStatusLower = req.payment_status?.toLowerCase();
                
                const isPending = statusLower === 'pending';
                const isCompleted = statusLower === 'completed';
                // Check if payment is explicitly 'paid'
                const isPaid = paymentStatusLower === 'paid'; 
                // Check if payment is explicitly 'unpaid' or 'pending'
                const isUnpaid = paymentStatusLower === 'unpaid' || paymentStatusLower === 'pending'; 


                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" disabled={isProcessing}>
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>

                            {/* Action to Mark as Paid (Visible if Pending AND Unpaid) */}
                            {isPending && isUnpaid && (
                                <DropdownMenuItem
                                    onClick={() => handleUpdatePaymentStatus(req.id, 'Paid')}
                                    className="text-blue-600 font-medium"
                                    disabled={isProcessing}
                                >
                                    Mark as Paid
                                </DropdownMenuItem>
                            )}
                            
                            {/* Action to Complete (Visible only if Pending AND Paid) */}
                            {isPending && isPaid && (
                                <DropdownMenuItem
                                    onClick={() => openModal(req)}
                                    className="text-teal-600 font-medium"
                                    disabled={isProcessing}
                                >
                                    Complete Request
                                </DropdownMenuItem>
                            )}

                            {/* Reject Action (Available if pending) */}
                            {isPending && (
                                <DropdownMenuItem
                                    onClick={() => handleApproveReject(req.id, 'rejected')}
                                    className="text-red-600"
                                    disabled={isProcessing}
                                >
                                    Reject
                                </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />
                                
                            {/* View Tx Hash (If it exists and is Completed) */}
                            {req.tx_hash && isCompleted && (
                                <>
                                    <DropdownMenuItem
                                        onClick={() => window.open(`https://sepolia-blockscout.lisk.com/tx/${req.tx_hash}`, '_blank')}
                                        className="text-blue-600"
                                    >
                                        View Tx Hash
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                </>
                            )}

                            {/* Delete Action */}
                            <DropdownMenuItem
                                onClick={() => handleDelete(req.id)}
                                className="text-red-700"
                                disabled={isProcessing}
                            >
                                Delete
                            </DropdownMenuItem>

                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ], [isProcessing]); // Recreate columns if isProcessing changes

    // --- TABLE HOOK (No changes needed here) ---
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

    // --- DATA & HANDLERS ---

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await getRequests(); 
            setRequests(data || []); 
        } catch (err) {
            console.error("Error fetching requests:", err);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (req: Request) => {
        // Double-check the payment status before opening the modal
        if (req.payment_status?.toLowerCase() !== 'paid') {
            setMessage("❌ Cannot complete: Payment status must be 'Paid'. Use the 'Mark as Paid' action first.");
            return;
        }

        if (req.status?.toLowerCase() === 'completed') {
            setMessage("This request is already completed.");
            return;
        }
        setSelectedRequest(req);
        setFile(null);
        setMessage("");
        setModalOpen(true);
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected && selected.type !== "application/pdf") {
            alert("Only PDF files are allowed");
            e.target.value = "";
            return;
        }
        setFile(selected || null);
    };

    const handleSubmit = async () => {
        if (!file || !selectedRequest || isProcessing) return

        // NOTE: Still using placeholder for email based on previous code.
        const email = "placeholder@example.com" 

        if (!email) {
            setMessage("❌ Resident email not found!")
            return
        }

        setIsProcessing(true);
        setMessage("");

        try {
            let tx_hash = ""
            // --- Blockchain/Server Logic ---
            if (hasMetaMask) {
                await connectWallet()
                tx_hash = await addCertificateRequest(
                    Number(selectedRequest.mCertificateId),
                    Number(selectedRequest.resident_id),
                    selectedRequest.certificate_name, 
                    selectedRequest.purpose,
                    selectedRequest.priority as string
                )
                // Set status to 'for confirmation' immediately after blockchain TX
                await updateRequestStatus(selectedRequest.id.toString(), "for confirmation", selectedRequest.certificate_name)
            }

            // The completeRequestWithFile function will update the status to 'completed'
            const { success, error } = await completeRequestWithFile({
                requestId: selectedRequest.id.toString(),
                email, 
                file,
                tx_hash,
            })

            if (!success) {
                setMessage(`❌ Upload failed: ${error}`)
                return
            }

            setMessage("✅ Request completed and document sent!")
            setModalOpen(false)
            fetchRequests()
        } catch (err) {
            console.error("Unexpected error:", err)
            setMessage("❌ Unexpected error occurred. Check console/MetaMask.")
        } finally {
            setIsProcessing(false);
        }
    }


    const handleApproveReject = async (requestId: number, newStatus: 'approved' | 'rejected') => {
        if (isProcessing) return;
        setIsProcessing(true);
        setMessage("");
        try {
            // This calls the updateRequestStatus with only the 'status' change
            const { success, error } = await updateRequestStatus(requestId.toString(), newStatus);
            if (success) {
                setMessage(`✅ Request status set to ${newStatus.toUpperCase()} successfully!`);
                fetchRequests();
            } else {
                setMessage(`❌ Failed to update status: ${error}`);
            }
        } catch (err) {
            console.error("Error updating status:", err);
            setMessage(`❌ An unexpected error occurred while setting status to ${newStatus}.`);
        } finally {
            setIsProcessing(false);
        }
    };
    
    // --- NEW HANDLER FOR PAYMENT STATUS ---
    const handleUpdatePaymentStatus = async (requestId: number, newPaymentStatus: 'Paid' | 'Unpaid') => {
        if (isProcessing) return;
        setIsProcessing(true);
        setMessage("");
        try {
            // Call the shared updateRequestStatus function, passing only the new paymentStatus
            const { success, error } = await updateRequestStatus(requestId.toString(), 'pending', undefined, newPaymentStatus); 
            
            if (success) {
                setMessage(`✅ Request marked as ${newPaymentStatus.toUpperCase()} successfully!`);
                fetchRequests();
            } else {
                setMessage(`❌ Failed to update payment status: ${error}`);
            }
        } catch (err) {
            console.error("Error updating payment status:", err);
            setMessage(`❌ An unexpected error occurred while setting payment status to ${newPaymentStatus}.`);
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleDelete = async (requestId: number) => {
        if (!confirm("Are you sure you want to delete this request (soft delete)?")) return;
        if (isProcessing) return;
        setIsProcessing(true);
        setMessage("");
        try {
            const { success, error } = await deleteRequestServer(requestId.toString());
            if (success) {
                setMessage("✅ Request deleted successfully (soft delete).");
                fetchRequests();
            } else {
                setMessage(`❌ Failed to delete request: ${error}`);
            }
        } catch (err) {
            console.error("Error deleting request:", err);
            setMessage("❌ An unexpected error occurred during deletion.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setRequests((items) => {
                const activeIdNum = Number(active.id);
                const overIdNum = Number(over?.id);

                const oldIndex = items.findIndex((item) => item.id === activeIdNum);
                const newIndex = items.findIndex((item) => item.id === overIdNum);

                if (oldIndex === -1 || newIndex === -1) return items;

                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    // --- EFFECTS (No changes needed here) ---

    useEffect(() => {
        fetchRequests();
        if (typeof window !== "undefined" && (window as any).ethereum) setHasMetaMask(true);
    }, []);


    // --- RENDER ---

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 text-teal-600 animate-spin mr-2" />
                <div className="text-muted-foreground">Loading requests...</div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-4">

            {/* HEADER */}
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Requests</h2>
                <p className="text-muted-foreground">
                    Review and manage document requests from residents.
                </p>
                {!hasMetaMask && <p className="text-blue-600 mt-2 text-sm">⚠️ MetaMask not detected. Blockchain features (Tx Hash) might be limited.</p>}
                {message && <p className={`mt-2 text-sm font-medium ${message.startsWith('❌') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
            </div>

            {/* FILTER & COLUMNS */}
            <div className="flex items-center py-4">
                <Input
                    placeholder="Filter resident name..."
                    value={(table.getColumn("resident_name")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("resident_name")?.setFilterValue(event.target.value)
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
                                        {column.id.replace(/_/g, ' ')}
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* TABLE */}
            <div className="rounded-md border">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    <TableHead className="w-[40px]">
                                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                                    </TableHead>
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
                            <SortableContext
                                items={requests.map((req) => req.id.toString())}
                                strategy={verticalListSortingStrategy}
                            >
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <SortableRow key={row.id} row={row as any}>
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </TableCell>
                                            ))}
                                        </SortableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length + 1}
                                            className="h-24 text-center"
                                        >
                                            No results.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </SortableContext>
                        </TableBody>
                    </Table>
                </DndContext>
            </div>

            {/* PAGINATION */}
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

            {/* --- MODAL FOR UPLOAD (Complete Request) --- */}
            {modalOpen && selectedRequest && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded shadow-xl w-96 text-gray-900 relative">

                        {/* PROCESSING OVERLAY */}
                        {isProcessing && (
                            <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center rounded z-20">
                                <Loader2 className="h-8 w-8 text-teal-600 animate-spin" />
                                <p className="mt-4 text-base font-semibold text-gray-700">Processing Request...</p>
                                <p className="text-xs text-gray-500 mt-1">Please wait for the transaction to complete.</p>
                            </div>
                        )}

                        <h2 className="text-xl font-bold mb-4">Complete Request #{selectedRequest.id}</h2>

                        <p className="mb-2 text-sm text-gray-600">
                            Current Status: <StatusBadge status={selectedRequest.status} />
                        </p>

                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileChange}
                            disabled={isProcessing}
                            className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-gray-300 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 disabled:opacity-50"
                        />

                        <div className="flex justify-end space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => setModalOpen(false)}
                                disabled={isProcessing}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="default"
                                onClick={handleSubmit}
                                disabled={!file || isProcessing}
                            >
                                Submit Document
                            </Button>
                        </div>

                        {message && <p className={`mt-2 text-sm font-medium text-center ${message.startsWith('❌') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RequestListPage;