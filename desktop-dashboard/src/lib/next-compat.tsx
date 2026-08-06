import React from 'react';

// Mock for next/navigation
export const usePathname = () => {
  try {
    // In Electron, we might not have a clean URL structure
    // but for the admin check in RealtimeManager, /admin is what's needed.
    return '/admin'; 
  } catch (e) {
    return '/';
  }
};

export const useRouter = () => {
  return {
    push: (url: string) => { 
        console.log('Navigate to:', url); 
        // Simple mock for navigation
        if (url === '/admin/login') {
            window.location.reload(); // Force a reload to show login if session is lost
        }
    },
    replace: (url: string) => { console.log('Replace with:', url); },
    refresh: () => { 
        console.log('App: Refresh requested');
        window.location.reload(); 
    },
    back: () => { window.history.back(); },
    prefetch: () => {},
  };
};

export const useSearchParams = () => {
    try {
        return new URLSearchParams(window.location.search);
    } catch (e) {
        return new URLSearchParams();
    }
};

export const useParams = () => ({});

// Mock for next/link
export const Link = ({ href, children, className, onClick, ...props }: any) => {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) onClick(e);
    // If it's a relative path, we just prevent default to stay in the same "page"
    // In our desktop app, tabs are handled by state, not routes
    if (href.startsWith('/')) {
        e.preventDefault();
        console.log('Link (Internal) blocked in Desktop:', href);
    }
  };

  return (
    <a href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </a>
  );
};

export default Link;
