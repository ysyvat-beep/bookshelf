import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { api, STATUS } from '../api/client.js';

export default function StatsPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.stats().then(setStats).catch((e) => alert(e.message));
  }, []);

  if (!stats) return <p className="text-center text-gray-400 py-20">불러오는 중…</p>;

  // 상태별 파이차트 데이터
  const statusData = stats.byStatus.map((s) => ({
    name: STATUS[s.status]?.label || s.status,
    value: s.count,
    color: STATUS[s.status]?.color || '#999',
  }));

  return (
    <div className="space-y-8">
      {/* 요약 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard label="총 책" value={`${stats.totals.total_books}권`} />
        <SummaryCard label="총 구절" value={`${stats.totals.total_quotes}개`} />
        <SummaryCard label="평균 별점" value={`★ ${stats.avgRating}`} />
        <SummaryCard label="별점 매긴 책" value={`${stats.ratedCount}권`} />
      </div>

      {/* 월별 완독량 */}
      <section>
        <h2 className="font-semibold mb-2">월별 완독량</h2>
        <div className="bg-white rounded-lg p-4 shadow-sm h-64">
          {stats.monthly.length === 0 ? (
            <Empty text="완독일이 입력된 책이 아직 없어요." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthly}>
                <XAxis dataKey="month" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="#b5835a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* 상태별 분포 */}
        <section>
          <h2 className="font-semibold mb-2">상태별 분포</h2>
          <div className="bg-white rounded-lg p-4 shadow-sm h-64">
            {statusData.length === 0 ? (
              <Empty text="데이터가 없어요." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={80} label>
                    {statusData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* 별점 분포 */}
        <section>
          <h2 className="font-semibold mb-2">별점 분포</h2>
          <div className="bg-white rounded-lg p-4 shadow-sm h-64">
            {stats.ratingDist.length === 0 ? (
              <Empty text="별점이 입력된 책이 없어요." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.ratingDist}>
                  <XAxis dataKey="rating" fontSize={12} tickFormatter={(r) => `${r}★`} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#c98a3c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm text-center">
      <p className="text-2xl font-bold text-shelf-accent">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function Empty({ text }) {
  return <div className="h-full flex items-center justify-center text-gray-400 text-sm">{text}</div>;
}
