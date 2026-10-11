// src/lib/antDarkTheme.js
// Ant Design theme for forms and dialogs shown on the public (dark) site.
// Wrap them in <ConfigProvider theme={antDarkTheme}>.
import { theme } from "antd";

export const antDarkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: "#38bdf8",
    colorBgContainer: "#0b1324",
    colorBgElevated: "#0f1a2e",
    borderRadius: 10,
  },
};
