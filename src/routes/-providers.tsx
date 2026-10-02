import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RotateCw, DatabaseZap } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { initDb } from "@/lib/hooks/db";
import { useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";

type ProviderProps = {
  children: React.ReactNode;
};

function DatabaseProvider({ children }: ProviderProps) {
  const { isLoading, isError, refetch } = useQuery({
    queryFn: initDb,
    queryKey: ["database"],
    staleTime: Infinity,
    retry: 5,
  });

  const fullScreenCenter = cn(
    "flex flex-col justify-center items-center",
    "w-full h-full bg-background",
  );

  if (isLoading) {
    return (
      <div className={fullScreenCenter}>
        <Spinner className="w-12 h-12 text-primary" />
        <p className="mt-4 text-lg text-foreground/80">
          Initializing database...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={fullScreenCenter}>
        <Alert
          className="w-full max-w-md shadow-lg border-destructive/50"
          variant="destructive"
        >
          <DatabaseZap className="w-4 h-4" />
          <AlertTitle>Database Connection Failed</AlertTitle>
          <AlertDescription className="mt-2 text-sm text-destructive">
            We couldn't establish a connection. This might be a temporary issue.
          </AlertDescription>
          <Button
            onClick={() => refetch()}
            className="mt-4 w-full"
            variant="outline"
          >
            <RotateCw className="mr-2 w-4 h-4" />
            Try Reconnecting
          </Button>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}

export default function Providers({ children }: ProviderProps) {
  return (
    <DatabaseProvider>
      {children}
      <Toaster richColors position="bottom-center" />
    </DatabaseProvider>
  );
}
