/**
 * Centralised user-facing copy strings.
 *
 * Import from here instead of inlining the same strings across components.
 * Add new strings here before using them — do not duplicate across files.
 */

export const COPY = {
  actions: {
    cancel:      "Cancel",
    save:        "Save",
    delete:      "Delete",
    open:        "Open",
    back:        "Back",
    upload:      "Upload",
    remove:      "Remove",
    newPlan:     "+ New plan",
    newProject:  "+ New project",
    importPlan:  "Import a plan",
    startProject: "Start a project",
    drawShape:   "Draw your first shape",
  },

  tilePlans: {
    eyebrow:          "Tile Plans",
    emptyHeading:     "NO PLANS YET.",
    emptyDescription: "Draw your first shape — any floor or patio outline — and Bloomy counts the tiles before you order.",
    creating:         "Creating…",
  },

  projects: {
    eyebrow:          "Garden Projects",
    emptyHeading:     "NO PROJECTS YET",
    emptyDescription: "Create a garden project to plan zones — patio, lawn, beds, decking — and place objects like trees and furniture on your canvas.",
  },

  errors: {
    generic:    "Something went wrong. Please try again.",
    uploadFail: "Upload failed",
    maxSize:    "Max 15 MB",
    saveFail:   "Failed to save",
    loadFail:   "Failed to load",
  },

  status: {
    loading:    "Loading…",
    saving:     "Saving…",
    submitting: "Sending…",
    uploading:  "Uploading…",
    analysing:  "Analysing…",
  },
} as const;
