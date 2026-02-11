import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  children: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ children, value, onValueChange }) => {
  return (
    <div className="w-full">
      {children}
    </div>
  );
};

interface TabsListProps {
  children: React.ReactNode;
}

const TabsList: React.FC<TabsListProps> = ({ children }) => {
  return (
    <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
      {children}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
}

const TabsContent: React.FC<TabsContentProps> = ({ value, children }) => {
  return (
    <div className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
      {children}
    </div>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };