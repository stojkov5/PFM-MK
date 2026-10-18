// src/pages/Admin/StatusSwitch.jsx
// The status / sport switch above an admin list: a segmented control, or a
// dropdown on phones where the segments don't fit on one line.
import React from "react";
import { Segmented, Select } from "antd";
import { useIsPhone } from "./useIsPhone.js";

const StatusSwitch = ({ value, onChange, options, label }) =>
  useIsPhone() ? (
    <Select
      className="pfm-admin-status-select"
      value={value}
      onChange={onChange}
      options={options}
      aria-label={label}
    />
  ) : (
    <Segmented className="pfm-admin-switch" value={value} onChange={onChange} options={options} />
  );

export default StatusSwitch;
