import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Edit, Trash2, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import { format } from "date-fns";

interface ScheduledPost {
  id: string;
  content: string;
  scheduledTime: Date;
  platforms: string[];
  status: "scheduled" | "published" | "failed";
  imageUrl?: string;
}

interface ScheduledPostCardProps {
  post: ScheduledPost;
  onEdit: (post: ScheduledPost) => void;
  onDelete: (id: string) => void;
}

const platformIcons = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
};

const statusColors = {
  scheduled: "bg-blue-500/20 text-blue-700 border-blue-500/30",
  published: "bg-green-500/20 text-green-700 border-green-500/30",
  failed: "bg-red-500/20 text-red-700 border-red-500/30",
};

export function ScheduledPostCard({ post, onEdit, onDelete }: ScheduledPostCardProps) {
  return (
    <Card className="border-border/50 hover:border-primary/30 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {format(post.scheduledTime, "MMM d, yyyy 'at' h:mm a")}
            </span>
          </div>
          <Badge className={statusColors[post.status]}>
            {post.status}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          {post.platforms.map((platform) => {
            const Icon = platformIcons[platform as keyof typeof platformIcons];
            return Icon ? (
              <Icon key={platform} className="w-4 h-4 text-muted-foreground" />
            ) : null;
          })}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-4 line-clamp-3">{post.content}</p>
        {post.imageUrl && (
          <img 
            src={post.imageUrl} 
            alt="Post media" 
            className="w-full h-32 object-cover rounded-md mb-4"
          />
        )}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(post)}
            className="h-8"
          >
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(post.id)}
            className="h-8 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}