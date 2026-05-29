## ADDED Requirements

### Requirement: Dashboard page header is removed

The Dashboard page SHALL NOT render the `PageHeader` component with title "Dashboard" or any subtitle text below it.

#### Scenario: User visits dashboard
- **WHEN** a user navigates to the dashboard page
- **THEN** no `PageHeader` or heading that says "Dashboard" SHALL appear at the top of the page

### Requirement: Top-level weekly progress bar is removed

The Dashboard page SHALL NOT render the horizontal progress bar `Card` showing "Weekly Progress" with "X/Y raids completed".

#### Scenario: Dashboard loads with data
- **WHEN** the dashboard data loads successfully
- **THEN** no global progress card SHALL be shown at the top of the page
