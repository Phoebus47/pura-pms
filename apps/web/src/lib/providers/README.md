# Providers

This directory contains React context providers for the application.

## QueryProvider

TanStack Query (React Query) provider for server state management.

### Usage

```tsx
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

function MyComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.get('/users'),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{/* render data */}</div>;
}
```

### Features

- Automatic caching
- Background refetching
- Request deduplication
- DevTools in development mode
