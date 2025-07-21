import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  Calendar,
  MessageSquare,
  Image,
  Copy,
  Edit,
  Trash2,
  CheckCircle
} from "lucide-react";

export interface GeneratedContent {
  id: string;
  content: string;
  type: string;
  audience: string;
  tone: string;
  platforms: string[];
  keywords: string[];
  engagementScore: number;
  createdAt: Date;
  status: "draft" | "approved" | "scheduled" | "published";
  imageUrl?: string;
}

interface ContentLibraryProps {
  contents: GeneratedContent[];
  onSelectContent?: (content: GeneratedContent) => void;
  onEditContent?: (content: GeneratedContent) => void;
  onDeleteContent?: (id: string) => void;
  onApproveContent?: (id: string) => void;
  selectionMode?: boolean;
}

export function ContentLibrary({ 
  contents, 
  onSelectContent, 
  onEditContent, 
  onDeleteContent, 
  onApproveContent,
  selectionMode = false 
}: ContentLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredContents = contents.filter(content => {
    const matchesSearch = content.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === "all" || content.type === filterType;
    const matchesStatus = filterStatus === "all" || content.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const groupedContents = filteredContents.reduce((acc, content) => {
    const status = content.status;
    if (!acc[status]) acc[status] = [];
    acc[status].push(content);
    return acc;
  }, {} as Record<string, GeneratedContent[]>);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "secondary";
      case "approved": return "default";
      case "scheduled": return "outline";
      case "published": return "destructive";
      default: return "secondary";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Content Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="tweet">Tweet</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="thread">Thread</SelectItem>
              <SelectItem value="announcement">Announcement</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content Tabs by Status */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({filteredContents.length})</TabsTrigger>
          <TabsTrigger value="draft">Drafts ({groupedContents.draft?.length || 0})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({groupedContents.approved?.length || 0})</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled ({groupedContents.scheduled?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ContentGrid 
            contents={filteredContents} 
            onSelectContent={onSelectContent}
            onEditContent={onEditContent}
            onDeleteContent={onDeleteContent}
            onApproveContent={onApproveContent}
            selectionMode={selectionMode}
            getStatusColor={getStatusColor}
            formatDate={formatDate}
          />
        </TabsContent>

        {Object.entries(groupedContents).map(([status, contents]) => (
          <TabsContent key={status} value={status}>
            <ContentGrid 
              contents={contents} 
              onSelectContent={onSelectContent}
              onEditContent={onEditContent}
              onDeleteContent={onDeleteContent}
              onApproveContent={onApproveContent}
              selectionMode={selectionMode}
              getStatusColor={getStatusColor}
              formatDate={formatDate}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

interface ContentGridProps {
  contents: GeneratedContent[];
  onSelectContent?: (content: GeneratedContent) => void;
  onEditContent?: (content: GeneratedContent) => void;
  onDeleteContent?: (id: string) => void;
  onApproveContent?: (id: string) => void;
  selectionMode: boolean;
  getStatusColor: (status: string) => string;
  formatDate: (date: Date) => string;
}

function ContentGrid({ 
  contents, 
  onSelectContent, 
  onEditContent, 
  onDeleteContent, 
  onApproveContent,
  selectionMode,
  getStatusColor,
  formatDate
}: ContentGridProps) {
  if (contents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No content found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {contents.map((content) => (
        <Card 
          key={content.id} 
          className={`transition-all hover:shadow-md ${
            selectionMode ? 'cursor-pointer hover:border-primary' : ''
          }`}
          onClick={selectionMode ? () => onSelectContent?.(content) : undefined}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusColor(content.status) as any} className="text-xs">
                    {content.status}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {content.type}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(content.createdAt)}
                </div>
              </div>
              {!selectionMode && (
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon-sm" onClick={() => onEditContent?.(content)}>
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon-sm">
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => onDeleteContent?.(content.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm line-clamp-4 leading-relaxed">
              {content.content}
            </p>
            
            {content.imageUrl && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Image className="w-3 h-3" />
                Visual content attached
              </div>
            )}

            <div className="flex flex-wrap gap-1">
              {content.platforms.map((platform) => (
                <Badge key={platform} variant="secondary" className="text-xs">
                  {platform}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Engagement: {content.engagementScore}/10</span>
              <span>{content.audience}</span>
            </div>

            {!selectionMode && content.status === "draft" && (
              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => onApproveContent?.(content.id)}
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Approve
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {/* Schedule directly */}}
                >
                  <Calendar className="w-3 h-3 mr-1" />
                  Schedule
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}