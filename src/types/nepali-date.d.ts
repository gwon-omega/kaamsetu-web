declare module "nepali-date" {
  export default class NepaliDate {
    constructor(value?: Date | string | number);
    format(pattern: string): string;
  }
}
