"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createRequest } from "@/server/request";
import { Tables } from "../../database.types";

type Certificate = Tables<"mCertificate">;

interface RequestCertificateDialogProps {
  certificate: Certificate | null;
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  onSuccess?: () => void;
}

export function RequestCertificateDialog({
  certificate,
  isOpen,
  onClose,
  userId,
  onSuccess
}: RequestCertificateDialogProps) {
  const [formData, setFormData] = useState({
    purpose: "",
    priority: "normal" as "low" | "normal" | "high"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!certificate) return;

    setIsSubmitting(true);
    
    try {
      const result = await createRequest({
        mCertificateId: certificate.id,
        resident_id: userId,
        purpose: formData.purpose,
        document_type: certificate.name,
        request_date: new Date().toISOString(),
        priority: formData.priority
      });

      if (result.success) {
        alert("Certificate request submitted successfully!");
        resetForm();
        onClose();
        onSuccess?.();
      } else {
        alert(result.error || "Failed to submit request");
      }
    } catch (err) {
      console.error("Error submitting request:", err);
      alert("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      purpose: "",
      priority: "normal"
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Request Certificate</DialogTitle>
            <DialogDescription>
              Submit a request for {certificate?.name}. Fee: ₱{certificate?.fee}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="purpose" className="text-right">
                Purpose
              </Label>
              <Textarea
                id="purpose"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="col-span-3"
                placeholder="Enter the purpose for this certificate"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">
                Priority
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value: "low" | "normal" | "high") => 
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {certificate?.requirements && (
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Requirements</Label>
                <div className="col-span-3 text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
                  {certificate.requirements.split('\n').map((req, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{req.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}