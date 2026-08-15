'use client';

import React from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <div className="pb-20 lg:pb-0">{children}</div>;
}
