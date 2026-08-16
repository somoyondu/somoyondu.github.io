import { Component } from 'react';

/** Keeps one broken section from blanking the whole page. */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('Render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="mx-auto my-10 max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-semibold text-red-800">দুঃখিত, কিছু একটা সমস্যা হয়েছে</p>
            <button
              type="button"
              className="mt-3 rounded-md bg-[#1D0061] px-4 py-2 text-sm text-white"
              onClick={() => window.location.reload()}
            >
              পাতাটি রিফ্রেশ করুন
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
