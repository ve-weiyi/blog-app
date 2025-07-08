/** 配置项文档：https://prettier.io/docs/en/configuration.html */
/** 代码美化利器 - Prettier https://www.jianshu.com/p/6a99ae530d43*/
/** VS code部分prettier配置及注释 https://www.jianshu.com/p/65fb2b018612*/
/** @type {import("prettier").Config} */
export default {
  /** 指定代码换行的字符长度，默认为 80，超过该长度会换行*/
  printWidth: 100,
  /** 指定缩进长度，默认为 2*/
  tabWidth: 2,
  /** 指定缩进的方式：空格 或 Tab，默认为 false，即使用空格缩进。 */
  useTabs: false,
  /** 行尾是否加分号 默认true */
  semi: true,
  /** 是否采用单引号代替双引号 */
  singleQuote: false,
  /** 在对象中的括号之间是否用空格来间隔 */
  bracketSpacing: true,
  /** 是否折叠  <button >*/
  bracketSameLine: false,
  /** 箭头函数的括号 always:(x) => x,avoid:x => x  */
  arrowParens: "always",
  /** 指定代码最后是否添加一行空行 */
  endOfLine: "auto",
  /** 对象或者数组的最后一个元素后面不要加逗号 es5:在数组最后一行加逗号 none:都不加 all:方法和数组都加 */
  trailingComma: "es5",

  //在 JSX 中使用单引号替代双引号，默认false
  jsxSingleQuote: false,
  //将 html 开始标签的后面一个 > 放在最后一行的末尾，而不是单独一行。
  jsxBracketSameLine: false,
  //每个属性单独占一行
  singleAttributePerLine: false,
  //指定对 HTML, Vue, Angular, and Handlebars 文件中的空格保持敏感。 css 遵循css|strict 保留|ignore 忽略
  htmlWhitespaceSensitivity: "css",
  //vue 文件中，是否给 script 和 style 内的代码添加缩进。
  vueIndentScriptAndStyle: false,

  eslintIntegration: false, //不让prettier使用eslint的代码格式进行校验
  stylelintIntegration: false, //不让prettier使用stylelint的代码格式进行校验
  tslintIntegration: false, // 不让prettier使用tslint的代码格式进行校验
};
