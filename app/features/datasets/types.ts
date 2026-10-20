
export interface DatasetSummary {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    fields: number;
    records: number;
  };
}
