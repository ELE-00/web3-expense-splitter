import React from "react";
import '../styles/skeleton.css';

const SkeletonCard = ({ className, rows = 3 }) => (
    <div className={`skeleton-card ${className}`}>
        <div className="skeleton-block skeleton-card-header"></div>
        {Array.from({ length: rows }).map((_, i) => (
            <div
                key={i}
                className={`skeleton-block skeleton-row ${i % 2 === 0 ? '' : 'skeleton-row-short'}`}
            ></div>
        ))}
    </div>
);

const DashboardSkeleton = () => (
    <div className="skeleton-dashboard">
        <div className="skeleton-left">
            <SkeletonCard className="skeleton-overview" rows={3} />
            <SkeletonCard className="skeleton-balances" rows={4} />
        </div>
        <div className="skeleton-right">
            <SkeletonCard className="skeleton-expenses" rows={6} />
        </div>
    </div>
);

export default DashboardSkeleton;
