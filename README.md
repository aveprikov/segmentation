# Segmentation
JS segmentation library for split tests

### Features

- Assigns a visitor to one of the specified segments
- The maximum number of segments is 26, like the letters in the Latin alphabet from A to Z
- A visitor's belonging to a segment can be specified and can last for a session or a specified number of days

### Files
- `segmentator.js` is a complete ES6 version, easy to modify according to your needs
- `segmentator.min.js` is a minified ES5 version for easy use

### Parameters
####Method
```javascript
/**
 * Get segment
 * @params {segments_number {integer}, prefix {string}, days {integer}}
 * @returns {string}
*/

segmab({params}, callback);
```

####Params

##### Number of segments
- `segments_number`, integer (from 2 to 26)

##### Prefix
- `prefix`, string

##### Cookie's lifetime (days)
- `days`, integer (if zero, the segment will be assigned for the duration of the browser session)

### Usage

For example, three segments with the prefix "myprefix" were defined. And the segmentation script itself is connected to the "head" as a file.

```html
<!DOCTYPE html>
<html>
    <head>
        <script src="js/segmentator.min.js"></script>
    </head>
    <body>
        ...
    </body>
</html>
```
Getting the segment value into an external variable:
```javascript
const segment = segmab({segments_number: 3, prefix: "myprefix", days: 0});
switch(segment) {
    case 'A':
        // something for the segment "A" visitors
        break;
    case 'B':
        // something for the segment "B" visitors
        break;
    case 'C':
        // something for the segment "C" visitors
        break;
    default:
        // if the segment value has been reset
}
```
Using callback function. For example, to send a segment to Google Analytics:
```javascript
segmab({segments_number: 3, prefix: "myprefix", days: 0}, segment => {
    ga("set", "dimension1", segment);
});
```
