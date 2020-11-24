export type Item = {
  target: {
    title: string;
    id: number;
  };
};

export type Question = {
  title: string;
  url: string;
};

export type HotList = {
  data: Item[];
};
