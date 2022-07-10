import React from "react";

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode; errorMessage: string },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; errorMessage: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error(error);
    console.error(errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>{this.props.errorMessage}</h1>;
    }

    return this.props.children;
  }
}
