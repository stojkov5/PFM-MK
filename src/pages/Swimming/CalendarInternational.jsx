import React, { useMemo, useState } from "react";
import { Input, Table, Tag, Button } from "antd";
import { FiSearch, FiExternalLink } from "react-icons/fi";
import "./Calendar.css";

const CalendarInternational = () => {
  const [q, setQ] = useState("");

  const data = useMemo(
    () => [
      {
        key: "i1",
        month: "Март",
        date: "13-14.03",
        event: "Grand prix Macedonia (LEN критериумски натпревар)",
        place: "Скопје",
        categories:
          "м: 03 и помлади: 01-02: апсолутна; ж: 04 и помлади: 02-03: апсолутна",
        pool: "50м",
        status: "OK",
      },
      {
        key: "i2",
        month: "Април",
        date: "Да се потврди",
        event: "11 Април Гран При",
        place: "Белград, Србија",
        categories: "",
        pool: "50м",
        status: "TBC",
      },
      {
        key: "i3",
        month: "Април",
        date: "Да се потврди",
        event: "Serbia Open",
        place: "Белград, Србија",
        categories: "",
        pool: "50м",
        status: "TBC",
      },
      {
        key: "i4",
        month: "Мај",
        date: "Да се потврди",
        event: "Младинска балканијада",
        place: "Да се потврди",
        categories: "м:03/04; ж:04/05",
        pool: "50м",
        status: "TBC",
      },
      {
        key: "i5",
        month: "Мај",
        date: "Да се потврди",
        event: "Acropolis ’19",
        place: "Атина, Грција",
        categories: "Опен",
        pool: "50м",
        status: "TBC",
      },
      {
        key: "i6",
        month: "Јуни",
        date: "Да се потврди",
        event: "Комен Куп",
        place: "Да се потврди",
        categories: "м:05/06; ж:07/08",
        pool: "50м",
        status: "TBC",
      },
      {
        key: "i7",
        month: "Јули",
        date: "06-11.07",
        event: "ЕП младинско",
        place: "Да се потврди",
        categories: "м:03/06; ж:04/07",
        pool: "50м",
        status: "OK",
      },
      {
        key: "i8",
        month: "Јули/Август",
        date: "23.07–08.08",
        event: "Летни Олимписки Игри",
        place: "Токио, Јапонија",
        categories: "Опен",
        pool: "50м",
        status: "OK",
      },
      {
        key: "i9",
        month: "Август",
        date: "17.08–23.08",
        event: "Европско Сениорско Првенство",
        place: "Будимпешта, Унгарија",
        categories: "Опен",
        pool: "50м",
        status: "OK",
      },
      {
        key: "i10",
        month: "Ноември",
        date: "Да се потврди",
        event: 'Гран При "Куп на Зрењанин"',
        place: "Зрењанин, Србија",
        categories: "сите категории",
        pool: "25м",
        status: "TBC",
      },
      {
        key: "i11",
        month: "Ноември",
        date: "02-07.11",
        event: "Европско Сениорско Првенство во кратки базени",
        place: "Казан, Русија",
        categories: "Опен",
        pool: "25м",
        status: "OK",
      },
      {
        key: "i12",
        month: "Декември",
        date: "13-17.12",
        event: "Светско Првенство во кратки базени",
        place: "Абу Даби, ОАЕ",
        categories: "Опен",
        pool: "25м",
        status: "OK",
      },
    ],
    [],
  );

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return data;
    return data.filter((r) =>
      [r.month, r.date, r.event, r.place, r.categories, r.pool, r.status]
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
    { title: "Месец", dataIndex: "month", key: "month", width: 140 },
    {
      title: "Датум",
      dataIndex: "date",
      key: "date",
      width: 140,
      render: (v) => <span className="pfm-cal-date">{v}</span>,
    },
    {
      title: "Натпревар",
      dataIndex: "event",
      key: "event",
      render: (v) => <span className="pfm-cal-event">{v}</span>,
    },
    { title: "Место", dataIndex: "place", key: "place", width: 220 },
    { title: "Категории", dataIndex: "categories", key: "categories" },
    { title: "Базен", dataIndex: "pool", key: "pool", width: 90 },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      width: 110,
      render: (v) => (
        <span className={`pfm-status ${v === "TBC" ? "tbc" : "ok"}`}>
          {v === "TBC" ? "TBC" : "OK"}
        </span>
      ),
    },
  ];

  return (
    <div className="pfm-cal pt-24">
      <div className="pfm-landing-inner max-w-6xl mx-auto px-4 md:px-6">
        <div className="pfm-cal-head">
          <div className="pfm-cal-kicker">Calendar</div>
          <h2 className="pfm-cal-title">Calendar – International</h2>

          <div className="pfm-cal-controls pb-3">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              prefix={<FiSearch />}
              placeholder="Search… (пример: Belgrade, 25м, TBC, Olympics)"
              className="pfm-cal-search"
              allowClear
            />
            <Tag className="pfm-cal-tag">
              Вкупно: <b>{filtered.length}</b>
            </Tag>

            <Button
              className="pfm-cal-open"
              icon={<FiExternalLink />}
              onClick={() =>
                window.open(
                  "/docs/schedule-2021.pdf",
                  "_blank",
                  "noopener,noreferrer",
                )
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
            scroll={{ x: 1120 }}
            rowKey="key"
          />
        </div>
      </div>
    </div>
  );
};

export default CalendarInternational;
