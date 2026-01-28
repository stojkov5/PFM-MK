import React, { useMemo, useState } from "react";
import { Input, Table, Tag, Button } from "antd";
import { FiSearch, FiExternalLink } from "react-icons/fi";
import "./Calendar.css";

const CalendarNational = () => {
  const [q, setQ] = useState("");

  const data = useMemo(
    () => [
      {
        key: "n1",
        month: "Февруари",
        date: "20-21.02",
        event: "Нептун Куп",
        place: "Скопје",
        categories: "",
        pool: "25м",
        status: "Confirmed",
      },
      {
        key: "n2",
        month: "Февруари",
        date: "27.02",
        event: "Бета Спринт",
        place: "Скопје",
        categories: "",
        pool: "25м",
        status: "Confirmed",
      },

      {
        key: "n3",
        month: "Март",
        date: "13-14.03",
        event: "Grand prix Macedonia (LEN критериумски натпревар)",
        place: "Скопје",
        categories:
          "м: 03 и помлади: 01-02: апсолутна; ж: 04 и помлади: 02-03: апсолутна",
        pool: "50м",
        status: "Confirmed",
      },
      {
        key: "n4",
        month: "Март",
        date: "27-28.03",
        event: "Вардар 2018",
        place: "Скопје",
        categories: "",
        pool: "50м",
        status: "Confirmed",
      },

      {
        key: "n5",
        month: "Април",
        date: "24-25.04",
        event: "Младост Куп",
        place: "Скопје",
        categories: "",
        pool: "50м",
        status: "Confirmed",
      },

      {
        key: "n6",
        month: "Мај",
        date: "15-16.05",
        event: "Орион куп",
        place: "Скопје",
        categories: "",
        pool: "50м",
        status: "Confirmed",
      },

      {
        key: "n7",
        month: "Јуни",
        date: "11-12.06",
        event: "Делфин куп",
        place: "Скопје",
        categories: "сите категории",
        pool: "50м",
        status: "Confirmed",
      },

      {
        key: "n8",
        month: "Јули",
        date: "03-04.07",
        event: "Летно Национално Првенство во пливање",
        place: "Скопје",
        categories: "Сите",
        pool: "50м",
        status: "Confirmed",
      },
      {
        key: "n9",
        month: "Јули",
        date: "10.07",
        event: "Работнички Куп",
        place: "Скопје",
        categories: "Мастерс",
        pool: "50м",
        status: "Confirmed",
      },

      {
        key: "n10",
        month: "Август",
        date: "14.08",
        event: "Охрид Опен",
        place: "Охрид",
        categories: "",
        pool: "50м",
        status: "Confirmed",
      },

      {
        key: "n11",
        month: "Септември",
        date: "18.09",
        event: "Делфин Спринт",
        place: "Скопје",
        categories: "",
        pool: "50м",
        status: "Confirmed",
      },

      {
        key: "n12",
        month: "Октомври",
        date: "02.10",
        event: "Орион Куп Мини",
        place: "Скопје",
        categories: "М и Ж 09-12",
        pool: "25м",
        status: "Confirmed",
      },

      {
        key: "n13",
        month: "Ноември",
        date: "13-14.11",
        event: "13 Ноември",
        place: "Скопје",
        categories: "",
        pool: "25м",
        status: "Confirmed",
      },
      {
        key: "n14",
        month: "Ноември",
        date: "20-21.11",
        event: "Немо куп",
        place: "Скопје",
        categories: "сите категории",
        pool: "25м",
        status: "Confirmed",
      },

      {
        key: "n15",
        month: "Декември",
        date: "04-05.12",
        event: "Зимско Национално првенство во пливање",
        place: "Скопје",
        categories: "",
        pool: "25м",
        status: "Confirmed",
      },
      {
        key: "n16",
        month: "Декември",
        date: "19.12",
        event: "Дедо Мраз – Аква Про",
        place: "Скопје",
        categories: "",
        pool: "25м",
        status: "Confirmed",
      },
    ],
    [],
  );

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return data;
    return data.filter((r) =>
      [r.month, r.date, r.event, r.place, r.categories, r.pool]
        .join(" ")
        .toLowerCase()
        .includes(s),
    );
  }, [q, data]);

  const columns = [
    {
      title: "#",
      key: "idx",
      width: 60,
      fixed: "left",
      render: (_text, _record, idx) => (
        <span className="pfm-cal-index">{idx + 1}</span>
      ),
    },
    { title: "Месец", dataIndex: "month", key: "month", width: 120 },
    {
      title: "Датум",
      dataIndex: "date",
      key: "date",
      width: 110,
      render: (v) => <span className="pfm-cal-date">{v}</span>,
    },
    {
      title: "Натпревар",
      dataIndex: "event",
      key: "event",
      render: (v) => <span className="pfm-cal-event">{v}</span>,
    },
    { title: "Место", dataIndex: "place", key: "place", width: 140 },
    { title: "Категории", dataIndex: "categories", key: "categories" },
    { title: "Базен", dataIndex: "pool", key: "pool", width: 90 },
  ];

  return (
    <div className="pfm-cal pt-24">
      <div className="pfm-landing-inner max-w-6xl mx-auto px-4 md:px-6">
        <div className="pfm-cal-head">
          <div className="pfm-cal-kicker">Calendar</div>
          <h2 className="pfm-cal-title">Calendar – National</h2>

          <div className="pfm-cal-controls pb-3">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              prefix={<FiSearch />}
              placeholder="Search… (пример: Скопје, 25м, Национално)"
              className="pfm-cal-search"
              allowClear
            />
            <Tag className="pfm-cal-tag">
              Вкупно: <b>{filtered.length}</b>
            </Tag>

            <Button
              className="pfm-cal-open "
              icon={<FiExternalLink />}
              onClick={() =>
                window.open("/Schedule.pdf", "_blank", "noopener,noreferrer")
              }
            >
              Отвори PDF
            </Button>
          </div>
        </div>

        <div className="pfm-cal-card">
          <Table
            columns={columns}
            dataSource={filtered}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            size="middle"
            bordered={false}
            className="pfm-table-dark"
            scroll={{ x: 1050 }}
            rowKey="key"
          />
        </div>
      </div>
    </div>
  );
};

export default CalendarNational;
