// src/pages/Admin/useIsPhone.js
import { Grid } from "antd";

// Phones (under 768px) get cards and dropdowns instead of wide tables and
// switches. useBreakpoint is empty on the first render, which counts as desktop.
export const useIsPhone = () => Grid.useBreakpoint().md === false;
