import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, FileCheck, AlertTriangle, Lock } from "lucide-react";

export default function Compliance() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Compliance & Security
          </h1>
          <p className="text-muted-foreground mt-2">
            Regulatory compliance for financial marketing content
          </p>
        </div>
        <Button variant="hero">
          <Shield className="w-4 h-4 mr-2" />
          Configure Rules
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5" />
              Content Approval
            </CardTitle>
            <CardDescription>
              Multi-stage review process for all content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="default">Active</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Risk Monitoring
            </CardTitle>
            <CardDescription>
              Automated flagging of compliance risks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="default">Active</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Audit Trail
            </CardTitle>
            <CardDescription>
              Complete logging for regulatory review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="default">Active</Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Regulatory Disclaimers</CardTitle>
          <CardDescription>
            Automated compliance text for financial content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted rounded-lg text-sm">
            <p className="font-medium mb-2">Standard Disclaimer:</p>
            <p className="text-muted-foreground">
              "This content is for informational purposes only and does not constitute investment advice. 
              Past performance does not guarantee future results. Please consult with a financial advisor 
              before making investment decisions. SilverCL is a regulated asset management firm in Israel."
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}