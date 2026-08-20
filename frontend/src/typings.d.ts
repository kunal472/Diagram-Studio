declare module 'mermaid' {
  const mermaid: any;
  export default mermaid;
}

declare module 'marked' {
  export const marked: {
    parse(src: string, options?: any): string;
  };
}
