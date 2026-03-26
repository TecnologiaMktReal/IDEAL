export type UserRole = "consultor" | "cliente" | "gestor";

export type Permission =
  | "project:create"
  | "project:read"
  | "project:update"
  | "forms:fill_internal"
  | "transcript:upload"
  | "ai:run_assistive"
  | "report:create_draft"
  | "report:publish"
  | "report:read_published"
  | "report:download"
  | "approval:type1_register"
  | "approval:type2_decide"
  | "report:comment"
  | "stage:complete"
  | "dashboard:project_read"
  | "dashboard:agency_read"
  | "user:manage";

const PERMISSIONS_BY_ROLE: Record<UserRole, Permission[]> = {
  consultor: [
    "project:create",
    "project:read",
    "project:update",
    "forms:fill_internal",
    "transcript:upload",
    "ai:run_assistive",
    "report:create_draft",
    "report:publish",
    "report:read_published",
    "report:download",
    "stage:complete",
    "dashboard:project_read"
  ],
  cliente: [
    "project:read",
    "report:read_published",
    "report:download",
    "approval:type1_register",
    "approval:type2_decide",
    "report:comment",
    "dashboard:project_read"
  ],
  gestor: [
    "project:create",
    "project:read",
    "report:publish",
    "report:read_published",
    "report:download",
    "dashboard:project_read",
    "dashboard:agency_read",
    "user:manage"
  ]
};

export function can(role: UserRole, permission: Permission): boolean {
  return PERMISSIONS_BY_ROLE[role].includes(permission);
}
