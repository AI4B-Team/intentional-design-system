import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Eye, X } from "lucide-react";
import type { JVProfile } from "@/hooks/useJVPartners";

interface JVProfileFormProps {
  profile?: JVProfile | null;
  onSave: (data: Partial<JVProfile>) => void;
  isLoading?: boolean;
}

const DEAL_TYPES = [
  "Wholesale",
  "Fix & Flip",
  "BRRRR",
  "Buy & Hold",
  "New Construction",
  "Commercial",
  "Land Development",
  "Multi-Family",
];

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner (0-2 deals)" },
  { value: "intermediate", label: "Intermediate (3-10 deals)" },
  { value: "experienced", label: "Experienced (11-50 deals)" },
  { value: "expert", label: "Expert (50+ deals)" },
];

export function JVProfileForm({ profile, onSave, isLoading }: JVProfileFormProps) {
  const [formData, setFormData] = React.useState({
    profile_type: profile?.profile_type || "both",
    available_capital: profile?.available_capital?.toString() || "",
    target_deal_types: profile?.target_deal_types || [],
    target_areas: profile?.target_areas || [],
    preferred_role: profile?.preferred_role || "either",
    experience_level: profile?.experience_level || "beginner",
    deals_completed: profile?.deals_completed?.toString() || "0",
    bio: profile?.bio || "",
    is_public: profile?.is_public || false,
  });
  const [newArea, setNewArea] = React.useState("");

  const handleDealTypeToggle = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      target_deal_types: prev.target_deal_types.includes(type)
        ? prev.target_deal_types.filter((t) => t !== type)
        : [...prev.target_deal_types, type],
    }));
  };

  const handleAddArea = () => {
    if (newArea.trim() && !formData.target_areas.includes(newArea.trim())) {
      setFormData((prev) => ({
        ...prev,
        target_areas: [...prev.target_areas, newArea.trim()],
      }));
      setNewArea("");
    }
  };

  const handleRemoveArea = (area: string) => {
    setFormData((prev) => ({
      ...prev,
      target_areas: prev.target_areas.filter((a) => a !== area),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      available_capital: formData.available_capital
        ? parseFloat(formData.available_capital)
        : null,
      deals_completed: parseInt(formData.deals_completed) || 0,
      id: profile?.id,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Profile Type */}
        <Card variant="default" padding="md">
          <h3 className="text-body font-semibold mb-4">Partner Type</h3>
          <div className="space-y-2">
            <Label>What type of partner are you?</Label>
            <Select
              value={formData.profile_type}
              onValueChange={(v) => setFormData((p) => ({ ...p, profile_type: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="capital_partner">
                  Capital Partner - I provide funding
                </SelectItem>
                <SelectItem value="operating_partner">
                  Operating Partner - I find & manage deals
                </SelectItem>
                <SelectItem value="both">
                  Both - I can do either
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 space-y-2">
            <Label>Preferred Role</Label>
            <Select
              value={formData.preferred_role}
              onValueChange={(v) => setFormData((p) => ({ ...p, preferred_role: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="passive">Passive - hands off</SelectItem>
                <SelectItem value="active">Active - hands on</SelectItem>
                <SelectItem value="either">Either works for me</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Capital */}
        <Card variant="default" padding="md">
          <h3 className="text-body font-semibold mb-4">Capital & Experience</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Available Capital</Label>
              <Input
                type="number"
                placeholder="e.g., 250000"
                value={formData.available_capital}
                onChange={(v) => setFormData((p) => ({ ...p, available_capital: v }))}
              />
              <p className="text-tiny text-muted-foreground">
                Leave blank if not applicable
              </p>
            </div>
            <div className="space-y-2">
              <Label>Experience Level</Label>
              <Select
                value={formData.experience_level}
                onValueChange={(v) => setFormData((p) => ({ ...p, experience_level: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Label>Deals Completed</Label>
            <Input
              type="number"
              placeholder="0"
              value={formData.deals_completed}
              onChange={(v) => setFormData((p) => ({ ...p, deals_completed: v }))}
            />
          </div>
        </Card>

        {/* Deal Types */}
        <Card variant="default" padding="md">
          <h3 className="text-body font-semibold mb-4">Deal Types Interested In</h3>
          <div className="flex flex-wrap gap-2">
            {DEAL_TYPES.map((type) => (
              <Badge
                key={type}
                variant={formData.target_deal_types.includes(type) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleDealTypeToggle(type)}
              >
                {type}
              </Badge>
            ))}
          </div>
        </Card>

        {/* Target Areas */}
        <Card variant="default" padding="md">
          <h3 className="text-body font-semibold mb-4">Target Geographic Areas</h3>
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Enter city, state, or zip"
              value={newArea}
              onChange={setNewArea}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddArea())}
            />
            <Button type="button" variant="secondary" onClick={handleAddArea}>
              Add
            </Button>
          </div>
          {formData.target_areas.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.target_areas.map((area) => (
                <Badge key={area} variant="secondary" className="gap-1">
                  {area}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => handleRemoveArea(area)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </Card>

        {/* Bio */}
        <Card variant="default" padding="md">
          <h3 className="text-body font-semibold mb-4">About You</h3>
          <Textarea
            placeholder="Tell potential partners about yourself, your experience, and what you're looking for..."
            value={formData.bio}
            onChange={(e) => setFormData((p) => ({ ...p, bio: e.target.value }))}
            rows={4}
          />
        </Card>

        {/* Visibility */}
        <Card variant="default" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-body font-semibold">Make Profile Public</h3>
              <p className="text-small text-muted-foreground">
                Allow other users to find you in the partner search
              </p>
            </div>
            <Checkbox
              checked={formData.is_public}
              onCheckedChange={(c) => setFormData((p) => ({ ...p, is_public: !!c }))}
            />
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" icon={<Eye />}>
            Preview Profile
          </Button>
          <Button type="submit" variant="primary" icon={<Save />} disabled={isLoading}>
            {profile ? "Update Profile" : "Create Profile"}
          </Button>
        </div>
      </div>
    </form>
  );
}
