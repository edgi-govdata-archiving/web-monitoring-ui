# Pagefreezer API

Pagefreezer provides a simple diff API that allows coparisons of file versions; results are returned as JSON in a straightforward way.

## The Compare Service

This is the only service currently available

```sh
http post https://api1.pagefreezer.com/v1/api/utils/diff/compare \
source=text
url1=http://apple.com/jp \
url2=http://apple.com/kr \
"x-api-key: KEYHERE"
```

w/ jQuery:
```javascript
 $.ajax({
    type: "POST",
    url: "https://api1.pagefreezer.com/v1/api/utils/diff/compare",
    data: {
      url1:  ,
      url2:  ,
      source: "text",
      x-api-key: },
    success: function( data ) {SOMETHING HERE},
    dataType: "json"
 });
 
```

## Parameters

| Parameter	| Description |
|-----------|-------------|
| source (optional)|	Default: 'url'. 'url'=url1 and url2 must be URL of the target document. 'text'=url1 and url2 contains HTML text document itself. |
| url1 |	The source URL or HTML |
| url2 |	The target URL or HTML |
| diffmode | (optional)	Default: 0. 0=No pre-processing, 1=extra white spaces removed, 2=[\s]* are removed, |3=HTML tags are removed for full-text comparison |
| html  (optional) |	Default: 1. 2=HTML with HEAD, 1=HTML without HEAD, 0=False (no HTML output). |
| snippet  (optional)	 | Default: 200 (characters). It will generate snippets of changes. |

## Testing
use our test html files
