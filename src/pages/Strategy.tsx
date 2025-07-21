import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Edit, Save, Eye } from "lucide-react";

export default function Strategy() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Marketing Strategy
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage global marketing strategy and content guidelines
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button variant="hero">
            <Edit className="w-4 h-4 mr-2" />
            Edit Strategy
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            SmartETH Fundraising Strategy
          </CardTitle>
          <CardDescription>
            Comprehensive marketing approach for $50M fundraising campaign
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Target Audience</h3>
            <p className="text-sm text-muted-foreground">
              Crypto holders, institutional investors, and family offices interested in regulated ETH strategies.
            </p>
          </div>
          
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Key Messaging</h3>
            <p className="text-sm text-muted-foreground">
              Regulated, professional asset management with innovative Smart ETH strategy yielding superior returns.
            </p>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Content Themes</h3>
            <p className="text-sm text-muted-foreground">
              Market analysis, regulatory updates, strategy performance, thought leadership, and investor education.
            </p>
          </div>

          <div className="flex justify-end">
            <Button>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}