import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="p-8">
        <h1 className="text-2xl font-bold">Teacher AI Assistant</h1>
        <p>Frontend Foundation</p>
      </div>
    </QueryClientProvider>
  );
}

export default App;\n