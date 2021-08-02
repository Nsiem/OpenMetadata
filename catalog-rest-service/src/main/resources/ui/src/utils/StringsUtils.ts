import parse from 'html-react-parser';

export const stringToSlug = (dataString: string, slugString = '') => {
  return dataString.toLowerCase().replace(/ /g, slugString);
};

/**
 * Convert a template string into HTML DOM nodes
 * Same as React.createElement(type, options, children)
 * @param  {String} str The template string
 * @return {Node}       The template HTML
 */
export const stringToHTML = function (
  strHTML: string
): string | JSX.Element | JSX.Element[] {
  return strHTML ? parse(strHTML) : strHTML;
};

/**
 * Convert a template string into rendered HTML DOM
 * @param  {String} str The template string
 * @return {BodyNode}   The rendered template HTML
 */
export const stringToDOMElement = function (strHTML: string): HTMLElement {
  const parser = new DOMParser();
  const doc = parser.parseFromString(strHTML, 'text/html');

  return doc.body;
};

export const ordinalize = (num: number): string => {
  const mod10 = num % 10;
  const mod100 = num % 100;
  let ordinalSuffix: string;

  if (mod10 === 1 && mod100 !== 11) {
    ordinalSuffix = 'st';
  } else if (mod10 === 2 && mod100 !== 12) {
    ordinalSuffix = 'nd';
  } else if (mod10 === 3 && mod100 !== 13) {
    ordinalSuffix = 'rd';
  } else {
    ordinalSuffix = 'th';
  }

  return num + ordinalSuffix;
};