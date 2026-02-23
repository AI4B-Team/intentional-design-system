import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListFilter, Upload, Layers3, PenLine } from "lucide-react";
import { CriteriaTab } from "./tabs/criteria-tab";
import { UploadTab } from "./tabs/upload-tab";
import { StackTab } from "./tabs/stack-tab";
import { ManualTab } from "./tabs/manual-tab";

interface CreateListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: string;
}

export function CreateListModal({
  open,
  onOpenChange,
  defaultTab = "upload",
}: CreateListModalProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New List</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="criteria" className="gap-2">
              <ListFilter className="h-4 w-4" />
              <span className="hidden sm:inline">From Criteria</span>
              <span className="sm:hidden">Criteria</span>
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Upload CSV</span>
              <span className="sm:hidden">Upload</span>
            </TabsTrigger>
            <TabsTrigger value="stack" className="gap-2">
              <Layers3 className="h-4 w-4" />
              <span className="hidden sm:inline">Stack Lists</span>
              <span className="sm:hidden">Stack</span>
            </TabsTrigger>
            <TabsTrigger value="manual" className="gap-2">
              <PenLine className="h-4 w-4" />
              <span className="hidden sm:inline">Manual Entry</span>
              <span className="sm:hidden">Manual</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4 min-h-0 pb-2">
            <TabsContent value="criteria" className="mt-0 h-full">
              <CriteriaTab onSuccess={handleSuccess} />
            </TabsContent>

            <TabsContent value="upload" className="mt-0 h-full">
              <UploadTab onSuccess={handleSuccess} />
            </TabsContent>

            <TabsContent value="stack" className="mt-0 h-full">
              <StackTab onSuccess={handleSuccess} />
            </TabsContent>

            <TabsContent value="manual" className="mt-0 h-full">
              <ManualTab onSuccess={handleSuccess} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
