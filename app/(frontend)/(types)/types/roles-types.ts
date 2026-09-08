export interface RoleDataTypes {
  id: string;
  name: string;
  description?: string;
  permissions?: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    userData: number;
  };
}

export interface RolesInputData {
  id?: string;
  name: string;
  description?: string;
  permissions?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    userData: number;
  };
}

export interface RoleUpdateData {
  id: string;
  name: string;
  description?: string;
  permissions?: string[];
  isActive: boolean;
}
