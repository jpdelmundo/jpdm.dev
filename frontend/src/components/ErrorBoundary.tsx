import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode }
type State = { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return {hasError: true, error};
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error("React render error:", error, errorInfo);
        //send to server?
    }

    render(){
        if (this.state.hasError) {
            return <div>Something went wrong</div>;
        }

        return this.props.children;
    }
}