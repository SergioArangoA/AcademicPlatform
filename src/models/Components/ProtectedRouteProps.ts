import React from 'react';

export interface ProtectedRouteProps {
  allowedRoles?: string[];
  children: React.ReactNode;
}
