import React from "react";
import {
  Link,
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from "react-router-dom";
import { Compass, Home, ArrowLeft } from "lucide-react";
import Button from "../Button.jsx";

/**
 * Error404Page — react-router errorElement. Redesigned onto the shadcn token
 * system: a centered Card on `bg-background`, theme-aware (light + dark), with
 * design-system Buttons. Router behaviour unchanged (useRouteError / navigate).
 */
export default function Error404Page() {
  const error = useRouteError();
  const navigate = useNavigate();

  const isRouteError = isRouteErrorResponse(error);
  const isDirectNotFound = error == null;
  const status = isRouteError ? error.status : isDirectNotFound ? 404 : 500;

  let title = "Something went wrong";
  let message = "An unexpected error occurred.";
  if (isRouteError) {
    if (error.status === 404) {
      title = "Page Not Found";
      message = "The route may have moved, or the link may be outdated.";
    } else {
      title = `${error.status} Error`;
      message = error.statusText || "Something went wrong while loading this page.";
    }
  } else if (isDirectNotFound) {
    title = "Page Not Found";
    message = "The route may have moved, or the link may be outdated.";
  } else if (error instanceof Error && error.message) {
    message = error.message;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 text-foreground">
      {/* soft brand glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{
          background:
            "radial-gradient(600px 320px at 18% 12%, color-mix(in oklab, var(--primary) 8%, transparent), transparent 60%), radial-gradient(600px 320px at 85% 88%, color-mix(in oklab, var(--primary) 6%, transparent), transparent 60%)",
        }}
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Compass className="size-8" />
        </div>

        <span className="mb-3 inline-block rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Status {status}
        </span>

        <h1 className="mb-1 text-6xl font-extrabold tracking-tight text-primary">
          {status === 404 ? "404" : title}
        </h1>

        <h2 className="mb-2 text-lg font-semibold text-foreground">
          {status === 404 ? title : "Unable to open this view"}
        </h2>

        <p className="mx-auto mb-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {message}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="primary"
            icon={<Home className="size-4" />}
            onClick={() => navigate("/dashboard")}
          >
            Go to Home
          </Button>
          <Button
            variant="outline"
            icon={<ArrowLeft className="size-4" />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </div>

        {/* keep a router Link present for crawlers / no-JS fallback */}
        <Link to="/dashboard" className="sr-only">
          Home
        </Link>
      </div>
    </div>
  );
}
