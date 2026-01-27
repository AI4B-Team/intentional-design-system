import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Pencil, Trash2, MoreHorizontal, Pin, StickyNote } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  author: {
    name: string;
    initials: string;
  };
  isPinned?: boolean;
}

const sampleNotes: Note[] = [
  {
    id: "1",
    content: "Owner mentioned he's relocating to Florida in March. Very motivated to sell before then. Wife is on board but wants to see $290K minimum.",
    createdAt: "Today, 2:45 PM",
    author: { name: "Brian", initials: "B" },
    isPinned: true,
  },
  {
    id: "2",
    content: "Property has been vacant for 6 months. Neighbor confirmed owner moved out after divorce. Some cosmetic damage but structure looks solid.",
    createdAt: "Yesterday, 11:30 AM",
    author: { name: "Brian", initials: "B" },
  },
  {
    id: "3",
    content: "Contractor estimate: $28-32K for full rehab. Main items are roof ($8.5K), kitchen cabinets/counters ($12K), and bathrooms ($5.5K). Can be ready in 4-6 weeks.",
    createdAt: "Jan 24, 2026",
    author: { name: "Brian", initials: "B" },
  },
  {
    id: "4",
    content: "Title search came back clean. No liens or encumbrances. Clear to proceed with closing.",
    createdAt: "Jan 20, 2026",
    author: { name: "Brian", initials: "B" },
  },
];

export function NotesTab() {
  const [notes, setNotes] = React.useState(sampleNotes);
  const [isAdding, setIsAdding] = React.useState(false);
  const [newNote, setNewNote] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editContent, setEditContent] = React.useState("");

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    const note: Note = {
      id: Date.now().toString(),
      content: newNote.trim(),
      createdAt: "Just now",
      author: { name: "You", initials: "Y" },
    };
    
    setNotes([note, ...notes]);
    setNewNote("");
    setIsAdding(false);
  };

  const handleEditNote = (id: string) => {
    if (!editContent.trim()) return;
    
    setNotes(notes.map(n => 
      n.id === id ? { ...n, content: editContent.trim(), updatedAt: "Just now" } : n
    ));
    setEditingId(null);
    setEditContent("");
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const handleTogglePin = (id: string) => {
    setNotes(notes.map(n => 
      n.id === id ? { ...n, isPinned: !n.isPinned } : n
    ));
  };

  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  // Sort: pinned first, then by date
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  return (
    <div className="p-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-lg">
        <div>
          <h3 className="text-h3 font-medium text-foreground">Notes</h3>
          <p className="text-small text-muted-foreground">
            {notes.length} notes
          </p>
        </div>
        {!isAdding && (
          <Button variant="primary" size="sm" icon={<Plus />} onClick={() => setIsAdding(true)}>
            Add Note
          </Button>
        )}
      </div>

      {/* Add Note Form */}
      {isAdding && (
        <Card variant="default" padding="md" className="mb-lg border-accent">
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Write a note..."
            rows={4}
            autoFocus
            className="mb-3"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => { setIsAdding(false); setNewNote(""); }}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddNote} disabled={!newNote.trim()}>
              Save Note
            </Button>
          </div>
        </Card>
      )}

      {notes.length === 0 && !isAdding ? (
        <Card variant="default" padding="lg" className="text-center">
          <StickyNote className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h4 className="text-h3 font-medium text-foreground mb-2">No notes yet</h4>
          <p className="text-small text-muted-foreground mb-4">
            Add notes about conversations, property conditions, or deal progress
          </p>
          <Button variant="secondary" size="sm" icon={<Plus />} onClick={() => setIsAdding(true)}>
            Add First Note
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedNotes.map((note) => (
            <Card
              key={note.id}
              variant="default"
              padding="md"
              className={cn(
                "transition-all",
                note.isPinned && "border-l-4 border-l-accent bg-accent/5"
              )}
            >
              {editingId === note.id ? (
                <div>
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={4}
                    autoFocus
                    className="mb-3"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => handleEditNote(note.id)}>
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-accent/10 text-accent text-small font-medium">
                        {note.author.initials}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-small font-medium text-foreground">
                          {note.author.name}
                        </span>
                        <span className="text-tiny text-muted-foreground">
                          {note.createdAt}
                        </span>
                        {note.updatedAt && (
                          <span className="text-tiny text-muted-foreground">
                            (edited {note.updatedAt})
                          </span>
                        )}
                        {note.isPinned && (
                          <Pin className="h-3 w-3 text-accent" />
                        )}
                      </div>
                      <p className="text-body text-foreground whitespace-pre-wrap">
                        {note.content}
                      </p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 hover:bg-background-secondary rounded-small transition-colors">
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36 bg-white">
                        <DropdownMenuItem onClick={() => handleTogglePin(note.id)}>
                          <Pin className="h-4 w-4 mr-2" />
                          {note.isPinned ? "Unpin" : "Pin"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => startEdit(note)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteNote(note.id)} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
