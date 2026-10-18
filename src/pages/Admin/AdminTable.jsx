// src/pages/Admin/AdminTable.jsx
// The list view every admin tab uses. Wide screens (992px and up) get a real
// table whose columns always fit the page: fixed layout, text wraps, and the
// actions column is pinned to the right edge, so buttons are never cut off.
// Tablets in portrait and phones get the same data as row cards: the main
// column as the heading, the other columns as labelled cells, actions at the
// bottom.
//
// columns: [{ key, title, render(row, index), width?, primary?, actions? }]
//   primary — the card heading (one column)
//   actions — the buttons (one column, pinned right in the table)
// expandable: { render(row) } — extra details, opened per row
import React, { useState } from "react";
import { Button, Empty, Grid, Spin, Table } from "antd";
import { FiChevronDown } from "react-icons/fi";

const RowCard = ({ row, index, columns, expandable }) => {
  const [open, setOpen] = useState(false);
  const primary = columns.find((c) => c.primary);
  const actions = columns.find((c) => c.actions);
  const cells = columns.filter((c) => !c.primary && !c.actions);

  return (
    <article className="pfm-admin-row">
      {primary && <header className="pfm-admin-row-head">{primary.render(row, index)}</header>}
      <dl className="pfm-admin-row-cells">
        {cells.map((c) => (
          <div key={c.key} className="pfm-admin-row-cell">
            <dt>{c.title}</dt>
            <dd>{c.render(row, index)}</dd>
          </div>
        ))}
      </dl>
      {expandable && (
        <>
          <Button
            type="link"
            size="small"
            className={`pfm-admin-row-more ${open ? "is-open" : ""}`}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            {open ? "Hide details" : "More details"} <FiChevronDown />
          </Button>
          {open && <div className="pfm-admin-row-details">{expandable.render(row)}</div>}
        </>
      )}
      {actions && <footer className="pfm-admin-row-actions">{actions.render(row, index)}</footer>}
    </article>
  );
};

const AdminTable = ({
  columns,
  dataSource = [],
  rowKey = "id",
  loading = false,
  emptyText = "Nothing here",
  pageSize = 20,
  expandable,
  minWidth = 860,
}) => {
  // useBreakpoint is empty on the first render, which counts as wide.
  const cards = Grid.useBreakpoint().lg === false;
  // pageSize 0 = no paging: every row at once.
  const [shown, setShown] = useState(pageSize || Infinity);
  const empty = <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyText} />;

  if (cards) {
    if (loading) {
      return (
        <div className="pfm-admin-rows-loading">
          <Spin />
        </div>
      );
    }
    if (dataSource.length === 0) return <div className="pfm-admin-rows-empty">{empty}</div>;
    return (
      <div className="pfm-admin-rows">
        {dataSource.slice(0, shown).map((row, i) => (
          <RowCard key={row[rowKey]} row={row} index={i} columns={columns} expandable={expandable} />
        ))}
        {dataSource.length > shown && (
          <Button onClick={() => setShown((n) => n + pageSize)} block>
            Show more ({dataSource.length - shown})
          </Button>
        )}
      </div>
    );
  }

  return (
    <Table
      rowKey={rowKey}
      tableLayout="fixed"
      columns={columns.map((c) => ({
        key: c.key,
        title: c.title,
        width: c.width,
        fixed: c.actions ? "right" : undefined,
        className: c.actions ? "pfm-admin-col-actions" : undefined,
        render: (_, row, index) => c.render(row, index),
      }))}
      dataSource={dataSource}
      loading={loading}
      expandable={expandable ? { expandedRowRender: expandable.render } : undefined}
      pagination={pageSize ? { pageSize, hideOnSinglePage: true } : false}
      // Wide enough to read; the table scrolls (actions stay pinned) only
      // when the page is narrower than this.
      scroll={{ x: minWidth }}
      locale={{ emptyText: empty }}
      className="pfm-admin-table"
    />
  );
};

export default AdminTable;
