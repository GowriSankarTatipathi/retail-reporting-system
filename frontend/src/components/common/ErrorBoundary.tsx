import { Component, type ErrorInfo, type ReactNode } from 'react';
import ServerErrorPage from '@/pages/errors/ServerErrorPage';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/** Catches render-time errors anywhere below it and shows the 500 page instead of a blank screen. */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled render error', error, info.componentStack);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  override render() {
    if (this.state.hasError) {
      return <ServerErrorPage onRetry={this.handleRetry} />;
    }
    return this.props.children;
  }
}
