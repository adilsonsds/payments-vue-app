// Tipos básicos para a aplicação
export interface PaymentFilters {
  pageNumber?: number;
  pageSize?: number;
  profiles?: number[];
  year?: number;
  month?: number;
  sortBy?: 'CreatedAtDesc' | 'CreatedAtAsc' | 'PaymentDateDesc' | 'PaymentDateAsc' | 'AmountDesc' | 'AmountAsc' | 'CompletedDesc' | 'CompletedAsc';
}

export interface PaymentSummaryFilters {
  profiles?: number[];
  startYear?: number;
  startMonth?: number;
  endYear?: number;
  endMonth?: number;
}

export interface Payment {
  id: number;
  description: string;
  amount: number;
  dueDate: string;
  completed: boolean;
  profileId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message: string;
}