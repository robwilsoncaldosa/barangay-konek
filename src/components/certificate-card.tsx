"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { NeumorphEyebrow } from '@/components/ui/neumorph-eyebrow'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Clock, DollarSign } from 'lucide-react'
import { Tables } from "../../database.types";

type Certificate = Tables<"mCertificate">;

interface CertificateCardProps {
  certificate: Certificate
  userRole?: "admin" | "official" | "resident"
  onRequest?: (certificate: Certificate) => void
  onEdit?: (certificate: Certificate) => void
  onDelete?: (certificate: Certificate) => void
}

export function CertificateCard({ 
  certificate, 
  userRole = "resident", 
  onRequest, 
  onEdit, 
  onDelete 
}: CertificateCardProps) {
  const canManage = userRole === "admin" || userRole === "official";
  const canRequest = userRole === "resident";

  return (
    <Card className="bg-gradient-to-br from-card via-card to-primary/5 dark:from-card dark:via-card dark:to-primary/10 shadow-sm hover:shadow-lg transition-all duration-300 border-0 ring-1 ring-border/50 hover:ring-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl font-bold leading-tight text-foreground mb-1 line-clamp-2">
                {certificate.name}
              </CardTitle>
              <CardDescription className="text-sm font-medium text-muted-foreground/80">
                Official document for various purposes
              </CardDescription>
            </div>
          </div>
          <NeumorphEyebrow intent="primary" className="flex-shrink-0">
            Certificate
          </NeumorphEyebrow>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-0">
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2.5">
              <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-semibold text-foreground">Fee:</span>
            </div>
            <Badge variant="secondary" className="font-bold text-sm px-3 py-1">
              ₱{certificate.fee}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-foreground">Processing:</span>
            </div>
            <span className="text-sm font-medium text-muted-foreground">1-2 days</span>
          </div>
        </div>

        {certificate.requirements && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span className="w-1 h-4 bg-primary rounded-full"></span>
              Requirements
            </h4>
            <div className="bg-gradient-to-br from-muted/40 to-muted/60 border border-border/50 p-4 rounded-xl space-y-2">
              {certificate.requirements.split('\n').map((req, index) => (
                <div key={index} className="flex items-start gap-3 text-sm">
                  <span className="flex-shrink-0 w-1.5 h-1.5 bg-primary rounded-full mt-2"></span>
                  <span className="text-foreground/90 leading-relaxed">{req.trim()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          {canRequest && onRequest && (
            <Button 
              onClick={() => onRequest(certificate)}
              className="flex-1 font-semibold shadow-sm hover:shadow-md transition-all duration-200"
              size="lg"
            >
              Request Certificate
            </Button>
          )}
          
          {canManage && (
            <div className="flex gap-2 flex-1">
              {onEdit && (
                <Button 
                  variant="outline" 
                  onClick={() => onEdit(certificate)}
                  className="flex-1 font-medium"
                  size="lg"
                >
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button 
                  variant="destructive" 
                  onClick={() => onDelete(certificate)}
                  className="flex-1 font-medium"
                  size="lg"
                >
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}