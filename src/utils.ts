export function getLocale() {
  if (navigator.languages?.length) {
    return navigator.languages[0];
  }

  return navigator.language || window.navigator.language || "en-US";
}

export function capitalize(word?: string) {
  if (!(word?.length)) return '';

  return `${word[0].toUpperCase()}${word.substring(1)}`;
}
