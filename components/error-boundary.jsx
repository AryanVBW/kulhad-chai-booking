"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false
    };
  }
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error
    };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  resetError = () => {
    this.setState({
      hasError: false,
      error: undefined
    });
  };
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }
      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />;
    }
    return this.props.children;
  }
}
function DefaultErrorFallback({
  error,
  resetError
}) {
  return <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Oops! Something went wrong
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            We encountered an unexpected error. Please try refreshing the page.
          </p>
          {error && process.env.NODE_ENV === 'development' && <details className="text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Error details (development only)
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                {error.message}
              </pre>
            </details>}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={resetError} className="flex items-center justify-center space-x-2" variant="outline">
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </Button>
            <Button onClick={() => window.location.reload()} className="flex items-center justify-center space-x-2 btn-primary">
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Page</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>;
}
export { ErrorBoundary, DefaultErrorFallback };
