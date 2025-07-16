export function getLocale() {
  if (navigator.languages?.length) {
    return navigator.languages[0];
  }

  return navigator.language || navigator.browserLanguage || navigator.userLanguage || "en-US";
}

export function capitalize(word) {
  if (!(word?.length)) return '';

  return `${word[0].toUpperCase()}${word.substring(1)}`;
}
