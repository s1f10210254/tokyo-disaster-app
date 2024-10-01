export interface WeatherData {
  publishingOffice: string; // 発表元のオフィス（気象庁など）
  reportDatetime: string; // レポートの発表日時
  timeSeries: TimeSeries[]; // 時系列データの配列
  tempAverage?: TempAverage; // 平均気温（省略可能）
  precipAverage?: PrecipAverage; // 平均降水量（省略可能）
}

interface TimeSeries {
  timeDefines: string[]; // 時間の定義（日時の配列）
  areas: Area[]; // エリア情報の配列
}

interface Area {
  area: {
    name: string; // 地域名
    code: string; // 地域コード
  };
  weatherCodes?: string[]; // 天気コード（省略可能）
  weathers?: string[]; // 天気の説明（省略可能）
  winds?: string[]; // 風情報（省略可能）
  waves?: string[]; // 波の情報（省略可能）
  temps?: number[]; // 気温（省略可能）
}

interface TempAverage {
  areas: {
    area: {
      name: string; // 地域名
      code: string; // 地域コード
    };
    min: number; // 最低気温
    max: number; // 最高気温
  }[];
}

interface PrecipAverage {
  areas: {
    area: {
      name: string; // 地域名
      code: string; // 地域コード
    };
    min: number; // 最小降水量
    max: number; // 最大降水量
  }[];
}

export interface Feed {
  title: string;
  subtitle: string;
  updated: string;
  id: string;
  rights: Rights;
  entries: Entry[];
}

interface Rights {
  type: string;
  content: string;
}

export interface Entry {
  title: string;
  id: string;
  updated: string;
  author: Author;
  link: Link;
  content: string;
}

interface Author {
  name: string;
}

interface Link {
  type: string;
  href: string;
}
