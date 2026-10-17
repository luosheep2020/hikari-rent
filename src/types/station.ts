export interface StationOption {
  value: string;
  label: string;
}

export interface StationTreeNode extends StationOption {
  children?: StationTreeNode[];
}
