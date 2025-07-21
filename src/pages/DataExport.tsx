import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Download, Github, Package } from "lucide-react";

export default function DataExport() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Data Export & Backup
          </h1>
          <p className="text-muted-foreground mt-2">
            Export data and application code for backup or migration
          </p>
        </div>
        <Button variant="hero">
          <Download className="w-4 h-4 mr-2" />
          Schedule Export
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Data Export
            </CardTitle>
            <CardDescription>
              Export all content, analytics, and user data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Analytics Data</span>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Content Library</span>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export JSON
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">User Data</span>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="w-5 h-5" />
              GitHub Export
            </CardTitle>
            <CardDescription>
              Export complete application codebase
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-3">
                Export the entire SmartEth application as a production-ready repository with:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Complete frontend and backend code</li>
                <li>• Database schema and migrations</li>
                <li>• Deployment configurations</li>
                <li>• Documentation and setup guide</li>
              </ul>
            </div>
            <Button className="w-full">
              <Package className="w-4 h-4 mr-2" />
              Export to GitHub
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Automated Backups</CardTitle>
          <CardDescription>
            Configure regular data backups for business continuity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Daily Backup</p>
              <p className="text-sm text-muted-foreground">Last backup: 2 hours ago</p>
            </div>
            <Badge variant="default">Enabled</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}