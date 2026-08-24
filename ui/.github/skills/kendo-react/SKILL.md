---
name: kendo-react
description: 'Use when developing or debugging KendoReact UI in the ui project: layouts, buttons, inputs, dialogs, forms, notifications, tooltips, icons, themes, responsive behavior, or accessibility.'
argument-hint: 'Describe the KendoReact component or interaction to change'
user-invocable: true
disable-model-invocation: false
---

# KendoReact UI

## Purpose

Use this skill for KendoReact component and theme work in the `ui/` project. The UI uses KendoReact for layouts, navigation, dialogs, forms, inputs, labels, notifications, tooltips, buttons, icons, and grid layouts. The current alert table is `DataGrid` from `ml-fasttrack`; this project does not install `@progress/kendo-react-grid` or a KendoReact chart package.

## When to Use

- Add or change a KendoReact component.
- Change layouts, navigation drawers, dialogs, forms, inputs, buttons, notifications, or tooltips.
- Change Kendo theme variables or application-wide component styling.
- Fix a Kendo event, value, rendering, loading, empty, or error state.
- Add or change Kendo SVG icons or button affordances.
- Improve keyboard access, focus behavior, responsive layout, or accessibility.

## Project Map

- `src/App.tsx`: application-level `GridLayout` usage.
- `src/App.scss`: Kendo default theme import and color customization.
- `src/App.css`: application and graph-related styles.
- `src/components/NavigationDrawer.tsx`: `AppBar`, `Drawer`, buttons, tooltips, and menu icon.
- `src/components/Notifications.tsx`: Kendo notification UI.
- `src/components/AlertGraphTimeline.tsx`: Kendo cards, buttons, and grid layout around a FastTrack graph.
- `src/pages/SearchPage.tsx`: Kendo layout, `TabStrip`, and `WindowCard` integration.
- `src/pages/AlertsPage.tsx`: Kendo layout, dialog, buttons, and FastTrack `DataGrid`.
- `src/pages/SignIn.tsx`: layout, inputs, labels, form, validation, and button controls.
- `src/utils/customResultRender.tsx`: Kendo result rendering helpers.
- `pdp-design-system/`: local design-system package used by the UI.
- `telerik-license.txt`: local licensing file; do not expose or alter its contents.

## Installed Kendo Scope

Check `package.json` before importing a component. Installed Kendo packages include layout, buttons, dialogs, form, inputs, labels, notifications, tooltips, licensing, SVG icons, and themes. The current project does not include `@progress/kendo-react-grid` or a KendoReact chart package.

Use `DataGrid` and `NetworkGraph` from `ml-fasttrack` for the existing alert table and graphs. Do not apply Kendo Grid or Kendo Charts APIs to those components without an explicit dependency and design change.

The alert table uses a custom Subject cell: selecting it expands the source trade URI and related email/transcript URIs. Keep the `View` action independent from this toggle by stopping event propagation. The visible Security Count is the combined related email and transcript count.

## Component Guidance

- Use `@progress/kendo-react-layout` for `GridLayout`, `GridLayoutItem`, `Drawer`, `AppBar`, `Card`, `TabStrip`, and related layout primitives.
- Use `@progress/kendo-react-buttons` for buttons and `@progress/kendo-svg-icons` for Kendo icon props.
- Use `@progress/kendo-react-dialogs` for alert and document dialogs.
- Use `@progress/kendo-react-form`, `@progress/kendo-react-inputs`, and `@progress/kendo-react-labels` for sign-in and form controls.
- Use `@progress/kendo-react-notification` for transient application feedback.
- Use `@progress/kendo-react-tooltip` for unfamiliar icon-only controls.
- Font Awesome is also loaded by this UI and is used by notification and graph-related UI. Preserve the existing icon family when extending those areas.
- Keep keyboard access, visible focus states, labels, validation messages, and dialog close behavior intact.

## Working Procedure

1. Identify the owning page or reusable component before editing.
2. Check nearby imports and existing Kendo usage for the intended component pattern.
3. Reuse installed Kendo packages and the existing theme rather than adding another UI library.
4. Keep data fetching and domain transformations outside presentational Kendo components where possible.
5. Make loading, disabled, empty, error, selected, and close/cancel states explicit.
6. Preserve stable dimensions so loading and populated states do not shift the layout.
7. Validate desktop and narrow layouts after changing shared components or styles.

## Styling and Theme Rules

- The theme is imported in `src/App.scss` from `@progress/kendo-theme-default/dist/all.scss`; preserve that import and its color customization unless the task changes the theme.
- Prefer classes in `src/App.css` or `src/App.scss` for new styles.
- Existing components use inline styles for some Kendo layout and content values. Preserve those values unless the task includes a deliberate style refactor.
- Reuse existing spacing, typography, colors, and responsive behavior before introducing new global styles.
- Avoid nested cards and unrelated global selectors.
- Do not replace Kendo components with hand-built equivalents without a clear requirement.

## Responsive Surfaces

Check these surfaces at narrow widths after layout changes:

- `Drawer` and `AppBar` navigation in `src/components/NavigationDrawer.tsx`.
- Two-column `GridLayout` views used by search, alerts, and graph content.
- Alert `Dialog` and its timeline or document content.
- Sign-in `Form`, validation messages, and submit button.

Keep columns, dialogs, buttons, labels, and validation text readable without overflow or overlap.

## Licensing

The project contains `telerik-license.txt` and the `@progress/kendo-licensing` dependency. Do not print license contents, place license values in source code, or bypass licensing warnings in application code. Treat licensing warnings as project or environment configuration issues.

## Validation

Run these commands from `ui/`:

```bash
npm run lint
npm run build
```

There is no configured test framework in `package.json`. Manually verify the affected interaction, keyboard operation, focus, close/cancel behavior, narrow viewport layout, and loading or empty states.
