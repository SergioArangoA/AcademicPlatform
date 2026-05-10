declare module '*.svg' {
  const content: any;
  export default content;
}

interface ImportMetaEnv {
	readonly VITE_API_URL: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
