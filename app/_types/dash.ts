export interface DashboardService {
  name: string;
  price: number;
  month: number;
  total: number;
  monthRevenue: number;
  totalRevenue: number;
}

export interface DashboardBarber {
  id: string;
  name: string;
  services: DashboardService[];
  monthRevenue: number;
  totalRevenue: number;
}

export interface DashboardTotals {
  totalMonthRevenue: number;
  totalAllRevenue: number;
  totalMonthServices: number;
  totalAllServices: number;
}

export interface DashboardResponse {
  barbers: DashboardBarber[];
  totals: DashboardTotals;
}