declare module 'cookie' {
  export const parse: (value: string) => Record<string, string | undefined>;
}
