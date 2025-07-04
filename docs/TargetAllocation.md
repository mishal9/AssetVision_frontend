# Target Allocation Feature Documentation

## Overview

The Target Allocation feature allows users to define target allocation percentages for their portfolio's asset classes. This enables drift analysis to determine how the current portfolio allocations deviate from the target, helping users make informed rebalancing decisions.

## Components

### TargetAllocationEditor

The `TargetAllocationEditor` component provides an interface for users to:

- View and modify target allocation percentages for each asset class
- Visualize allocations with a pie chart
- Ensure allocations total to 100% with validation
- Automatically balance remaining allocation percentages with "Balance to 100%" button

### Integration with Portfolio Drift

The target allocations feature is tightly integrated with the Portfolio Drift visualization. When target allocations are defined, the drift analysis will:

- Calculate the absolute drift (difference between current and target percentages)
- Calculate the relative drift (percentage deviation from target)
- Visualize these differences to identify rebalancing opportunities

## API Endpoints

### Backend Integration

The feature interacts with two main API endpoints:

1. `GET /api/portfolio/asset-classes/`
   - Returns available asset classes with current and target allocations
   - Handles fallback to mock data during development

2. `POST /api/portfolio/target-allocations/`
   - Saves target allocation percentages
   - Accepts an array of allocation objects with `asset_id` and `target_percentage`
   - Validates that percentages total to 100%

## User Flow

1. User navigates to Portfolio Drift section
2. If no target allocations are defined, a warning is displayed with a button to define them
3. User clicks "Define Target Allocations" to open the editor
4. User adjusts allocation percentages using sliders or direct input
5. User can click "Balance to 100%" to automatically distribute remaining percentage
6. After saving, the portfolio drift visualization immediately updates

## Error Handling

- Gracefully handles missing backend endpoints with fallback to mock data
- Validates total allocation equals 100% before saving
- Provides clear error messages and UI feedback
- Supports toggling between real and mock data for testing

## Development Notes

- Uses Redux store for state management
- Implements API service methods in `services/api.ts`
- Stores configuration in `config/api.ts`
- Provides mock data in `mock/assetClasses.ts`
