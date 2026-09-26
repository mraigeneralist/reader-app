// Reader engine files shipped as Metro assets (see metro.config.js).
declare module '*.html' {
  const asset: number;
  export default asset;
}
declare module '*.txt' {
  const asset: number;
  export default asset;
}
