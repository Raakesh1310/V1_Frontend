export interface TOCItem {
  title: string;
  id: string;
  inView: boolean;
  children?: TOCItem[];
}

export interface TOCIndexItem {
  title: string;
  children?: TOCIndexItem[];
}
