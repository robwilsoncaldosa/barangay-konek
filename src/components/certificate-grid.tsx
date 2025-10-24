"use client";

import { useEffect, useState } from "react";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CertificateCard } from "./certificate-card";
import { getCertificates, createCertificate, updateCertificate, deleteCertificate } from "@/server/certificate";
import { Tables } from "../../database.types";

type Certificate = Tables<"mCertificate">;

interface CertificateGridProps {
  userRole?: "admin" | "official" | "resident";
  userId?: number;
  onRequestCertificate?: (certificate: Certificate) => void;
}

export function CertificateGrid({ 
  userRole = "resident", 
  userId,
  onRequestCertificate 
}: CertificateGridProps) {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    requirements: "",
    fee: 0,
  });

  const canManage = userRole === "admin" || userRole === "official";

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      // Residents should see all available certificates, not just their own
      // Only filter by resident_id for specific use cases (like viewing user's certificates in admin panel)
      const filters = {};
      const data = await getCertificates(filters);
      setCertificates(data);
    } catch (err) {
      console.error("Error fetching certificates:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCertificate) {
        const result = await updateCertificate(String(editingCertificate.id), formData);
        if (result.success) {
          fetchCertificates();
          resetForm();
        } else {
          alert(result.error || "Failed to update certificate");
        }
      } else {
        const result = await createCertificate(formData);
        if (result.success) {
          fetchCertificates();
          resetForm();
        } else {
          alert(result.error || "Failed to create certificate");
        }
      }
    } catch (err) {
      console.error("Error submitting certificate:", err);
      alert("An unexpected error occurred");
    }
  };

  const handleEdit = (certificate: Certificate) => {
    setEditingCertificate(certificate);
    setFormData({
      name: certificate.name || "",
      requirements: certificate.requirements || "",
      fee: certificate.fee || 0,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (certificate: Certificate) => {
    if (!confirm(`Are you sure you want to delete "${certificate.name}"?`)) return;
    
    try {
      const result = await deleteCertificate(String(certificate.id));
      if (result.success) {
        fetchCertificates();
      } else {
        alert(result.error || "Failed to delete certificate");
      }
    } catch (err) {
      console.error("Error deleting certificate:", err);
      alert("An unexpected error occurred");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", requirements: "", fee: 0 });
    setEditingCertificate(null);
    setIsDialogOpen(false);
  };

  useEffect(() => {
    fetchCertificates();
  }, [userRole, userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading certificates...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-3 flex-1">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {userRole === "resident" ? "Available Certificates" : "Certificate Management"}
            </h1>
            <p className="text-lg text-muted-foreground font-medium">
              {canManage 
                ? "Create, edit, and manage certificates in the system" 
                : userRole === "resident" 
                  ? "Browse and request official documents"
                  : "View available certificate types"
              }
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
              {certificates.length} {certificates.length === 1 ? 'Certificate' : 'Certificates'}
            </span>
            {userRole === "resident" && (
              <span className="text-xs">• Click &quot;Request&quot; to apply for any certificate</span>
            )}
          </div>
        </div>
        
        {canManage && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Certificate
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingCertificate ? "Edit Certificate" : "Add New Certificate"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCertificate 
                      ? "Update the certificate information below."
                      : "Fill in the details to create a new certificate."
                    }
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="fee" className="text-right">
                      Fee (₱)
                    </Label>
                    <Input
                      id="fee"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.fee}
                      onChange={(e) => setFormData({ ...formData, fee: parseFloat(e.target.value) || 0 })}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="requirements" className="text-right pt-2">
                      Requirements
                    </Label>
                    <Textarea
                      id="requirements"
                      value={formData.requirements}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                      className="col-span-3"
                      placeholder="Enter each requirement on a new line"
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingCertificate ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {certificates.length === 0 ? (
        <div className="text-center py-16">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
              <FileText className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                {userRole === "resident" 
                  ? "No certificates available" 
                  : "No certificates found"
                }
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {userRole === "resident" 
                  ? "There are currently no certificates available for request. Please check back later."
                  : canManage 
                    ? "Get started by creating your first certificate using the button above."
                    : "No certificates have been added to the system yet."
                }
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 auto-rows-fr">
          {certificates.map((certificate) => (
            <CertificateCard
              key={certificate.id}
              certificate={certificate}
              userRole={userRole}
              onRequest={onRequestCertificate}
              onEdit={canManage ? handleEdit : undefined}
              onDelete={canManage ? handleDelete : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}