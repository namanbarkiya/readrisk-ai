# Analysis Components

This directory contains the analysis-related components for the RiskRead AI platform.

## Components

### `analysis-test.tsx`

A comprehensive test component that demonstrates the analysis state management system.

**Features:**

- Tests both Jotai store and React Query hooks
- File upload simulation
- Analysis creation and management
- Real-time status updates
- Error handling demonstration
- Statistics display

**Usage:**
Access via `/dashboard/analysis-test` in the development section of the sidebar.

## State Management

The analysis system uses a dual state management approach:

### Jotai Store (`lib/store/analysis-store.ts`)

- **Purpose**: UI state management
- **Features**:
  - Current analysis selection
  - Upload progress
  - View modes
  - Filters and pagination
  - Error states

### React Query Hooks (`lib/query/hooks/analysis.ts`)

- **Purpose**: Server state management
- **Features**:
  - Data fetching and caching
  - Background updates
  - Optimistic updates
  - Real-time polling

## Testing the System

1. **Navigate to the test page**: Go to `/dashboard/analysis-test`
2. **Create test analyses**: Use the buttons to create mock analyses
3. **Observe state changes**: Watch how both Jotai and React Query handle the data
4. **Test error handling**: The system includes comprehensive error handling
5. **View statistics**: See real-time statistics and analysis history

## Key Features Demonstrated

- **File Upload**: Simulated file upload and analysis creation
- **Real-time Updates**: Status polling for processing analyses
- **Caching**: React Query caching with background updates
- **Error Handling**: Comprehensive error management and recovery
- **Statistics**: Real-time analysis statistics and metrics
- **History Management**: Analysis history with filtering and pagination

## Architecture Benefits

- **Separation of Concerns**: UI state vs server state
- **Performance**: Efficient caching and background updates
- **Developer Experience**: Type-safe hooks and clear APIs
- **User Experience**: Real-time updates and optimistic UI
- **Scalability**: Modular design for easy extension
