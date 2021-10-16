# 口罩地圖

## Screenshots

<img height="500px" src="https://raw.githubusercontent.com/lycheetw/mask-web/master/public/screenshot.jpeg"/>

## API
剩餘口罩查詢API <br />
https://data.nhi.gov.tw/Datasets/Download.ashx?rid=A21030000I-D50001-001&l=https://data.nhi.gov.tw/resource/mask/maskdata.csv


If you want to use the compiled CSS and not customize any colors, text, etc. you can skip to [Step 3a](#step-3a-use-compiled-css).

Most likely you'll want to start using the [Sass mixins](https://github.com/material-components/material-components-web/blob/master/docs/code/architecture.md#sass) to customize your app. MDC Sass files are not supported out of the box, since we do not prepend `~` to our module imports. See this [Github issue](https://github.com/facebook/create-react-app/issues/4494#issuecomment-428531848) explaining the issue in detail. There is a workaround, but requires some work on your end (we promise it is not too difficult).

##### Add environment variable

To get MDC React Components to work with `create-react-app` you need to set a `SASS_PATH` environment variable that points to your `node_modules` directory. To quickly do this on OS X or Linux enter the following in your command line:

```sh
export SASS_PATH=./node_modules
```

If you're on Windows use the following:

```bat
SET SASS_PATH=.\node_modules
```